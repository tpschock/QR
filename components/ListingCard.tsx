"use client";

import { Listing } from "@/lib/listing";

export default function ListingCard({
  listing,
  onChange,
}: {
  listing: Listing;
  onChange: (next: Listing) => void;
}) {
  function update<K extends keyof Listing>(key: K, value: Listing[K]) {
    onChange({ ...listing, [key]: value });
  }

  function updateFeature(index: number, value: string) {
    const features = [...listing.features];
    features[index] = value;
    update("features", features);
  }

  function removeFeature(index: number) {
    update(
      "features",
      listing.features.filter((_, i) => i !== index)
    );
  }

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
          Listing details
        </h2>
        <span className="text-xs text-stone-400">Click any field to edit</span>
      </div>

      <input
        className="w-full border-none bg-transparent text-2xl font-semibold text-stone-900 outline-none focus:ring-0"
        value={listing.address}
        onChange={(e) => update("address", e.target.value)}
      />
      <input
        className="mt-1 w-full border-none bg-transparent text-stone-500 outline-none focus:ring-0"
        value={listing.city}
        onChange={(e) => update("city", e.target.value)}
      />

      <input
        className="mt-3 w-full border-none bg-transparent text-xl font-bold text-emerald-700 outline-none focus:ring-0"
        value={listing.price}
        onChange={(e) => update("price", e.target.value)}
      />

      <div className="mt-4 grid grid-cols-4 gap-2 text-center">
        <Stat label="Beds">
          <input
            type="number"
            className="w-full border-none bg-transparent text-center outline-none focus:ring-0"
            value={listing.beds}
            onChange={(e) => update("beds", Number(e.target.value))}
          />
        </Stat>
        <Stat label="Baths">
          <input
            type="number"
            className="w-full border-none bg-transparent text-center outline-none focus:ring-0"
            value={listing.baths}
            onChange={(e) => update("baths", Number(e.target.value))}
          />
        </Stat>
        <Stat label="Sqft">
          <input
            type="number"
            className="w-full border-none bg-transparent text-center outline-none focus:ring-0"
            value={listing.sqft}
            onChange={(e) => update("sqft", Number(e.target.value))}
          />
        </Stat>
        <Stat label="Built">
          <input
            type="number"
            className="w-full border-none bg-transparent text-center outline-none focus:ring-0"
            value={listing.yearBuilt}
            onChange={(e) => update("yearBuilt", Number(e.target.value))}
          />
        </Stat>
      </div>

      <textarea
        className="mt-4 w-full resize-none rounded-lg border-none bg-stone-50 p-3 text-sm text-stone-700 outline-none focus:ring-1 focus:ring-stone-300"
        rows={4}
        value={listing.description}
        onChange={(e) => update("description", e.target.value)}
      />

      <div className="mt-4">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">
          Features
        </h3>
        <ul className="space-y-1">
          {listing.features.map((feature, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className="text-emerald-600">•</span>
              <input
                className="w-full border-none bg-transparent text-sm text-stone-700 outline-none focus:ring-0"
                value={feature}
                onChange={(e) => updateFeature(i, e.target.value)}
              />
              <button
                type="button"
                onClick={() => removeFeature(i)}
                className="text-xs text-stone-400 hover:text-red-500"
                aria-label="Remove feature"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => update("features", [...listing.features, "New feature"])}
          className="mt-2 text-xs font-medium text-emerald-700 hover:underline"
        >
          + Add feature
        </button>
      </div>

      <div className="mt-5 border-t border-stone-100 pt-4 text-sm text-stone-600">
        <input
          className="w-full border-none bg-transparent font-medium text-stone-800 outline-none focus:ring-0"
          value={listing.agentName}
          onChange={(e) => update("agentName", e.target.value)}
        />
        <input
          className="w-full border-none bg-transparent text-stone-500 outline-none focus:ring-0"
          value={listing.agentPhone}
          onChange={(e) => update("agentPhone", e.target.value)}
        />
        <input
          className="w-full border-none bg-transparent text-stone-500 outline-none focus:ring-0"
          value={listing.agentEmail}
          onChange={(e) => update("agentEmail", e.target.value)}
        />
      </div>
    </div>
  );
}

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-stone-50 py-2">
      <div className="text-base font-semibold text-stone-800">{children}</div>
      <div className="text-[10px] uppercase tracking-wide text-stone-400">{label}</div>
    </div>
  );
}
