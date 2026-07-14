"use client";

import { useState } from "react";
import { defaultListing } from "@/lib/listing";
import ListingCard from "@/components/ListingCard";
import Chat from "@/components/Chat";
import QRPanel from "@/components/QRPanel";

export default function Home() {
  const [listing, setListing] = useState(defaultListing);

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-10">
      <header className="mb-6">
        <h1 className="text-lg font-semibold text-stone-900">
          Property Chatbot
        </h1>
        <p className="text-sm text-stone-500">
          Scan the QR code at the listing, or share this page — buyers can
          ask questions and get instant answers about the property.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <ListingCard listing={listing} onChange={setListing} />
        <div className="h-[600px]">
          <Chat listing={listing} />
        </div>
      </div>

      <QRPanel />
    </main>
  );
}
