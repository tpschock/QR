"use client";

import { useState } from "react";
import {
  Listing,
  getListingFields,
  getPrimaryStat,
  getSecondaryStat,
} from "@/lib/listing";

function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export default function ListingCard({ listing }: { listing: Listing }) {
  const [expanded, setExpanded] = useState(false);
  const fields = getListingFields(listing);
  const primaryStat = getPrimaryStat(listing);
  const secondaryStat = getSecondaryStat(listing);
  const hasDetails = fields.length > 0 || listing.agents.length > 0 || !!listing.notes;
  const primaryAgent = listing.agents[0];

  return (
    <div className="border-b border-slate-200 bg-white">
      {listing.photoUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={listing.photoUrl}
          alt={listing.address}
          className="h-48 w-full object-cover"
        />
      )}

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

        {listing.brochureUrl && (
          <a
            href={listing.brochureUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-full bg-brand-navy px-4 py-2.5 text-center text-sm font-medium text-white"
          >
            <span aria-hidden>📄</span> View Property Brochure
          </a>
        )}

        {primaryAgent && (primaryAgent.phone || primaryAgent.email) && (
          <div className={`flex gap-2 ${listing.brochureUrl ? "mt-2" : "mt-3"}`}>
            {primaryAgent.phone && (
              <a
                href={telHref(primaryAgent.phone)}
                className={`flex-1 rounded-full px-4 py-2.5 text-center text-sm font-medium ${
                  listing.brochureUrl
                    ? "border border-brand-navy text-brand-navy"
                    : "bg-brand-navy text-white"
                }`}
              >
                Call {primaryAgent.name.split(",")[0]}
              </a>
            )}
            {primaryAgent.email && (
              <a
                href={`mailto:${primaryAgent.email}`}
                className="flex-1 rounded-full border border-brand-navy px-4 py-2.5 text-center text-sm font-medium text-brand-navy"
              >
                Email
              </a>
            )}
          </div>
        )}

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
            {listing.notes && (
              <p className="whitespace-pre-line text-slate-700">{listing.notes}</p>
            )}

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
                    {agent.phone && (
                      <a href={telHref(agent.phone)} className="block text-brand-navy underline">
                        {agent.phone}
                      </a>
                    )}
                    {agent.email && (
                      <a href={`mailto:${agent.email}`} className="block text-brand-navy underline">
                        {agent.email}
                      </a>
                    )}
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
