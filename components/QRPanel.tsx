"use client";

import { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

export default function QRPanel() {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  return (
    <div className="fixed bottom-4 right-4">
      {open && (
        <div className="mb-3 rounded-2xl border border-stone-200 bg-white p-4 text-center shadow-lg">
          {url ? (
            <QRCodeCanvas value={url} size={180} includeMargin />
          ) : (
            <div className="flex h-[180px] w-[180px] items-center justify-center text-xs text-stone-400">
              Loading…
            </div>
          )}
          <p className="mt-2 max-w-[180px] break-all text-[10px] text-stone-400">
            {url}
          </p>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white shadow-lg"
      >
        {open ? "Hide QR code" : "Show QR code"}
      </button>
    </div>
  );
}
