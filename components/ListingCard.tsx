"use client";

import { useState } from "react";
import { Listing } from "@/lib/listing";

export default function ListingCard({ listing }: { listing: Listing }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-b border-stone-200 bg-white">
      <div className="px-4 py-3">
        <h1 className="text-lg font-semibold leading-tight text-stone-900">
          {listing.address}
        </h1>
        <p className="text-sm text-stone-500">{listing.city}</p>

          <div className="mt-2 flex items-center justify-between">
          <p className="text-xl font-bold text-navy-700">{listing.price}</p>
          <p className="text-sm text-stone-500">{listing.sqft.toLocaleString()} sqft</p>
        </div>

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 flex w-full items-center justify-between border-t border-stone-100 pt-2 text-sm font-medium text-navy-700"
        >
          <span>{expanded ? "Hide" : "See"} full details</span>
          <span aria-hidden>{expanded ? "▲" : "▼"}</span>
        </button>

        {expanded && (
          <div className="mt-3 space-y-3 text-sm">
            <p className="text-stone-700">{listing.description}</p>

            <ul className="space-y-1">
              {listing.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-stone-700">
                  <span className="text-navy-600">•</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <div className="border-t border-stone-100 pt-3 text-stone-600">
              <p className="font-medium text-stone-800">{listing.agentName}</p>
              <p>{listing.agentPhone}</p>
              <p>{listing.agentEmail}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
