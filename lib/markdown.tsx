import { Fragment, ReactNode } from "react";

// Renders a deliberately small subset of markdown from AI responses as React
// nodes — bold, italics, bullet lists, and paragraph breaks. Never touches
// raw HTML/dangerouslySetInnerHTML, since this text can end up echoing
// user-typed input.
export function renderMarkdown(text: string): ReactNode {
  const blocks = text.split(/\n{2,}/);

  return blocks.map((block, i) => {
    const lines = block.split("\n").filter((l) => l.trim() !== "");
    const isList = lines.length > 0 && lines.every((l) => /^\s*[-*]\s+/.test(l));

    if (isList) {
      return (
        <ul key={i} className={`list-disc space-y-0.5 pl-5 ${i > 0 ? "mt-2" : ""}`}>
          {lines.map((line, j) => (
            <li key={j}>{renderInline(line.replace(/^\s*[-*]\s+/, ""))}</li>
          ))}
        </ul>
      );
    }

    return (
      <p key={i} className={i > 0 ? "mt-2" : undefined}>
        {block.split("\n").map((line, j, arr) => (
          <Fragment key={j}>
            {renderInline(line)}
            {j < arr.length - 1 && <br />}
          </Fragment>
        ))}
      </p>
    );
  });
}

function renderInline(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).filter((p) => p !== "");
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}
