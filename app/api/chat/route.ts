import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { Listing, listingToContext } from "@/lib/listing";

export const runtime = "nodejs";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: Request) {
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

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: recentMessages.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
      config: {
        systemInstruction: `You are a friendly, knowledgeable real estate assistant answering questions about one specific property listing for a prospective buyer who scanned a QR code at the property. Answer only using the listing details below. If asked something the listing doesn't cover (e.g. school ratings, HOA fees not listed), say you don't have that detail and suggest contacting the listing agent. Keep answers concise and conversational.

${listingToContext(listing)}`,
      },
    });

    const reply = response.text ?? "";

    return NextResponse.json({ reply });
  } catch (err) {
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
