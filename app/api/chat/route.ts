import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { Listing, listingToContext } from "@/lib/listing";

export const runtime = "nodejs";

const client = new Anthropic();

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
    const response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 1024,
      output_config: { effort: "low" },
      system: `You are a friendly, knowledgeable real estate assistant answering questions about one specific property listing for a prospective buyer who scanned a QR code at the property. Answer only using the listing details below. If asked something the listing doesn't cover (e.g. school ratings, HOA fees not listed), say you don't have that detail and suggest contacting the listing agent. Keep answers concise and conversational.

${listingToContext(listing)}`,
      messages: recentMessages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const textBlock = response.content.find((b) => b.type === "text");
    const reply = textBlock && textBlock.type === "text" ? textBlock.text : "";

    return NextResponse.json({ reply });
  } catch (err) {
    if (err instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: `Assistant error: ${err.message}` },
        { status: err.status ?? 500 }
      );
    }
    return NextResponse.json(
      { error: "Unexpected error contacting the assistant." },
      { status: 500 }
    );
  }
}
