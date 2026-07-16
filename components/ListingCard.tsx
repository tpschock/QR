"use client";

import { useState } from "react";
import {
  Listing,
  getListingFields,
  getPrimaryStat,
  getSecondaryStat,
} from "@/lib/listing";

export default function ListingCard({ listing }: { listing: Listing }) {
  const [expanded, setExpanded] = useState(false);
  const fields = getListingFields(listing);
  const primaryStat = getPrimaryStat(listing);
  const secondaryStat = getSecondaryStat(listing);
  const hasDetails = fields.length > 0 || listing.agents.length > 0;

  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="px-4 py-3">
        <h1 className="text-lg font-semibold leading-tight text-slate-900">
          {listing.address}
        </h1>
        <p className="text-sm text-slate-500">{listing.city}</p>

        <div className="mt-2 flex items-center justify-between">
          <p className="text-xl font-bold text-brand-navy">
            {primaryStat ?? listing.listingStatus}
          </p>
          {secondaryStat && <p className="text-sm text-slate-500">{secondaryStat}</p>}
        </div>

        {hasDetails && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="mt-2 flex w-full items-center justify-between border-t border-slate-100 pt-2 text-sm font-medium text-brand-navy"
          >
            <span>{expanded ? "Hide" : "See"} full details</span>
            <span aria-hidden>{expanded ? "▲" : "▼"}</span>
          </button>
        )}

        {expanded && (
          <div className="mt-3 space-y-3 text-sm">
            {fields.length > 0 && (
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                {fields.map((f) => (
                  <div key={f.label}>
                    <dt className="text-xs uppercase tracking-wide text-slate-400">
                      {f.label}
                    </dt>
                    <dd className="text-slate-800">{f.value}</dd>
                  </div>
                ))}
              </dl>
            )}

            {listing.agents.length > 0 && (
              <div className="space-y-2 border-t border-slate-100 pt-3 text-slate-600">
                {listing.agents.map((agent, i) => (
                  <div key={i}>
                    <p className="font-medium text-slate-800">{agent.name}</p>
                    {agent.phone && <p>{agent.phone}</p>}
                    {agent.email && <p>{agent.email}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
