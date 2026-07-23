import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { Listing, listingToContext } from "@/lib/listing";

export const runtime = "nodejs";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// Simple in-memory sliding-window limiter, keyed by client IP. This is a
// single serverless instance's view only (not shared across instances), but
// it's enough to blunt basic abuse of the shared free-tier Gemini key
// without adding external infra like Vercel KV/Upstash.
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 30;
const requestLog = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (requestLog.get(ip) ?? []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS
  );
  recent.push(now);
  requestLog.set(ip, recent);
  return recent.length > RATE_LIMIT_MAX_REQUESTS;
}

function getClientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
}

export async function POST(req: Request) {
  if (isRateLimited(getClientIp(req))) {
    return NextResponse.json(
      { error: "Too many messages — please wait a moment and try again." },
      { status: 429 }
    );
  }

  let body: { messages?: ChatMessage[]; listing?: Listing };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { messages, listing } = body;

  if (!Array.isArray(messages) || messages.length === 0 || !listing) {
    return NextResponse.json(
      { error: "Request must include `messages` and `listing`." },
      { status: 400 }
    );
  }

  const recentMessages = messages.slice(-20);
  const request = {
    model: "gemini-3.1-flash-lite",
    contents: recentMessages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
    config: {
      systemInstruction: `You are a friendly, knowledgeable real estate assistant answering questions about one specific property listing for a prospective buyer who scanned a QR code at the property. Answer only using the listing details below. If asked something the listing doesn't cover (e.g. school ratings, HOA fees not listed), say you don't have that detail and suggest contacting the listing agent. Keep answers concise and conversational.

${listingToContext(listing)}`,
    },
  };

  const maxAttempts = 3;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await ai.models.generateContent(request);
      const reply = response.text ?? "";
      return NextResponse.json({ reply });
    } catch (err) {
      const isOverloaded =
        err instanceof Error && /"code":503|UNAVAILABLE/.test(err.message);
      if (isOverloaded && attempt < maxAttempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1500 * (attempt + 1)));
        continue;
      }
      return NextResponse.json(
        {
          error: `Assistant error: ${
            err instanceof Error ? err.message : "Unexpected error contacting the assistant."
          }`,
        },
        { status: 500 }
      );
    }
  }
}
