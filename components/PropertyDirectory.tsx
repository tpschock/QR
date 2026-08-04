"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Listing, getPrimaryStat } from "@/lib/listing";

export default function PropertyDirectory({ listings }: { listings: Listing[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return listings;
    return listings.filter(
      (listing) =>
        listing.address.toLowerCase().includes(q) ||
        listing.city.toLowerCase().includes(q)
    );
  }, [listings, query]);

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by address or city…"
        className="mt-4 w-full rounded-full border border-slate-300 px-4 py-2.5 text-base outline-none focus:border-brand-navy"
      />
      <p className="mt-2 text-xs text-slate-400">
        {filtered.length} of {listings.length} properties
      </p>

      <ul className="mt-4 space-y-3">
        {filtered.map((listing) => (
          <li key={listing.slug}>
            <Link
              href={`/${listing.slug}`}
              className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <p className="font-semibold text-slate-900">{listing.address}</p>
              <p className="text-sm text-slate-500">{listing.city}</p>
              <p className="mt-1 font-bold text-brand-navy">
                {getPrimaryStat(listing) ?? listing.listingStatus}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
