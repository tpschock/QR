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

// The network delivers text in bursts (however Gemini happens to chunk it),
// which can look like whole sentences popping in at once. These decouple
// on-screen reveal speed from network timing — raise REVEAL_CHARS_PER_TICK
// or lower REVEAL_INTERVAL_MS to speed the typing effect up, and vice versa.
const REVEAL_CHARS_PER_TICK = 3;
const REVEAL_INTERVAL_MS = 30;

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
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

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

    // Text arrives from the network in whatever bursts Gemini happens to
    // chunk it into (targetText). A separate ticker reveals it on-screen at
    // a fixed pace (revealedLength), so display speed doesn't depend on
    // network timing.
    let targetText = "";
    let revealedLength = 0;
    let networkDone = false;
    let revealTimer: ReturnType<typeof setInterval> | null = null;

    function showRevealed() {
      if (!mountedRef.current) return;
      setMessages((prev) => {
        const copy = [...prev];
        copy[assistantIndex] = { role: "assistant", content: targetText.slice(0, revealedLength) };
        return copy;
      });
      scrollToBottom();
    }

    function finish() {
      if (revealTimer) {
        clearInterval(revealTimer);
        revealTimer = null;
      }
      if (!mountedRef.current) return;
      setLoading(false);
      scrollToBottom(true);
    }

    function startRevealTimer() {
      if (revealTimer) return;
      revealTimer = setInterval(() => {
        if (!mountedRef.current) {
          if (revealTimer) clearInterval(revealTimer);
          return;
        }
        if (revealedLength < targetText.length) {
          revealedLength = Math.min(targetText.length, revealedLength + REVEAL_CHARS_PER_TICK);
          showRevealed();
        } else if (networkDone) {
          finish();
        }
      }, REVEAL_INTERVAL_MS);
    }

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
      let receivedAny = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunkText = decoder.decode(value, { stream: true });
        if (!chunkText) continue;
        receivedAny = true;
        targetText += chunkText;
        startRevealTimer();
      }
      networkDone = true;

      if (!receivedAny) {
        throw new Error("The assistant didn't return a response. Please try again.");
      }
      // If the reveal ticker never needed to start (or already caught up),
      // finish immediately — otherwise it'll detect networkDone itself.
      if (revealedLength >= targetText.length) {
        finish();
      }
    } catch (err) {
      if (revealTimer) clearInterval(revealTimer);
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
      setLoading(false);
    } finally {
      clearTimeout(timeout);
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

  // Keep offering suggestions for the rest of the conversation, not just the
  // first turn — but only ones not already asked, and only between turns
  // (once it's the visitor's turn again), not while a reply is streaming in.
  const lastMessage = messages[messages.length - 1];
  const alreadyAsked = new Set(
    messages
      .filter((m) => m.role === "user")
      .map((m) => m.content.trim().toLowerCase())
  );
  const quickReplies =
    !loading && lastMessage?.role === "assistant" && lastMessage.content !== ""
      ? QUICK_REPLIES.filter((q) => !alreadyAsked.has(q.trim().toLowerCase()))
      : [];

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

        {quickReplies.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {quickReplies.map((q) => (
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
