"use client";

import { useEffect, useRef, useState } from "react";
import { Listing } from "@/lib/listing";
import { renderMarkdown } from "@/lib/markdown";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const QUICK_REPLIES = [
  "What's the price?",
  "What's included?",
  "Who's the listing agent?",
  "Can I schedule a tour?",
];

const REQUEST_TIMEOUT_MS = 20000;
const NEAR_BOTTOM_THRESHOLD_PX = 80;

function greeting(listing: Listing): ChatMessage {
  return {
    role: "assistant",
    content: `Hi! I can answer questions about ${listing.address}. Ask me about the price, specs, or how to schedule a tour.`,
  };
}

export default function Chat({ listing }: { listing: Listing }) {
  const storageKey = `chat:${listing.slug}`;

  const [messages, setMessages] = useState<ChatMessage[]>([greeting(listing)]);
  const [hydrated, setHydrated] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryMessages, setRetryMessages] = useState<ChatMessage[] | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const listEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const stickToBottomRef = useRef(true);

  // Restore a saved conversation for this property after mount (not during
  // the initial render) so the server- and client-rendered HTML always match.
  useEffect(() => {
    try {
      const saved = window.sessionStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) setMessages(parsed);
      }
    } catch {
      // Corrupt or unavailable storage — just start fresh.
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.sessionStorage.setItem(storageKey, JSON.stringify(messages));
    } catch {
      // Storage full/unavailable (e.g. private browsing) — not critical.
    }
  }, [messages, hydrated, storageKey]);

  function handleScroll() {
    const el = containerRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    stickToBottomRef.current = distanceFromBottom < NEAR_BOTTOM_THRESHOLD_PX;
  }

  function scrollToBottom(force = false) {
    if (!force && !stickToBottomRef.current) return;
    requestAnimationFrame(() =>
      listEndRef.current?.scrollIntoView({ behavior: "smooth" })
    );
  }

  async function postToApi(nextMessages: ChatMessage[]) {
    setLoading(true);
    setError(null);
    setRetryMessages(null);

    const assistantIndex = nextMessages.length;
    setMessages([...nextMessages, { role: "assistant", content: "" }]);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages, listing }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || `Request failed (${res.status})`);
      }
      if (!res.body) throw new Error("No response body.");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";
      let receivedAny = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunkText = decoder.decode(value, { stream: true });
        if (!chunkText) continue;
        receivedAny = true;
        accumulated += chunkText;
        setMessages((prev) => {
          const copy = [...prev];
          copy[assistantIndex] = { role: "assistant", content: accumulated };
          return copy;
        });
        scrollToBottom();
      }

      if (!receivedAny) {
        throw new Error("The assistant didn't return a response. Please try again.");
      }
    } catch (err) {
      const isTimeout = err instanceof DOMException && err.name === "AbortError";
      setError(
        isTimeout
          ? "That took too long to answer. Please try again."
          : err instanceof Error
          ? err.message
          : "Something went wrong."
      );
      setRetryMessages(nextMessages);
      setMessages((prev) => prev.slice(0, assistantIndex));
    } finally {
      clearTimeout(timeout);
      setLoading(false);
      scrollToBottom(true);
    }
  }

  function send(text: string) {
    if (!text || loading) return;
    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    stickToBottomRef.current = true;
    scrollToBottom(true);
    postToApi(nextMessages);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    send(input.trim());
  }

  function retry() {
    if (retryMessages) postToApi(retryMessages);
  }

  async function copyMessage(text: string, index: number) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex((cur) => (cur === index ? null : cur)), 1500);
    } catch {
      // Clipboard API unavailable/denied — not critical, just skip feedback.
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4"
        aria-live="polite"
        aria-relevant="additions"
      >
        {messages.map((m, i) => {
          const isLast = i === messages.length - 1;
          const isStreamingEmpty =
            loading && isLast && m.role === "assistant" && m.content === "";
          const showCopy = m.role === "assistant" && m.content && !(loading && isLast);

          return (
            <div
              key={i}
              className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-base leading-snug ${
                  m.role === "user"
                    ? "bg-brand-navy text-white"
                    : "bg-slate-100 text-slate-800"
                }`}
              >
                {isStreamingEmpty ? (
                  <span className="flex items-center gap-1 py-0.5" aria-label="Assistant is typing">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
                  </span>
                ) : m.role === "assistant" ? (
                  renderMarkdown(m.content)
                ) : (
                  m.content
                )}
              </div>
              {showCopy && (
                <button
                  type="button"
                  onClick={() => copyMessage(m.content, i)}
                  className="mt-1 text-xs text-slate-400"
                >
                  {copiedIndex === i ? "Copied" : "Copy"}
                </button>
              )}
            </div>
          );
        })}

        {messages.length === 1 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {QUICK_REPLIES.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => send(q)}
                className="rounded-full border border-brand-navy px-3 py-1.5 text-sm text-brand-navy"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">
            <p>{error}</p>
            {retryMessages && (
              <button type="button" onClick={retry} className="mt-1.5 font-medium underline">
                Try again
              </button>
            )}
          </div>
        )}
        <div ref={listEndRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex gap-2 border-t border-slate-200 bg-white p-3"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <input
          className="flex-1 rounded-full border border-slate-300 px-4 py-3 text-base outline-none focus:border-brand-navy"
          placeholder="Ask about this property…"
          aria-label="Ask about this property"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="rounded-full bg-brand-navy px-5 py-3 text-base font-medium text-white disabled:opacity-40"
        >
          Send
        </button>
      </form>
    </div>
  );
}
