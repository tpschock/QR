import Link from "next/link";
import { listings } from "@/lib/listing";

export default function Home() {
  return (
    <main className="mx-auto min-h-dvh max-w-lg px-4 py-8">
      <h1 className="text-lg font-semibold text-stone-900">Properties</h1>
      <p className="mt-1 text-sm text-stone-500">
        Each listing has its own page and QR code — visitors scanning a
        sign go straight to that property's chat.
      </p>

      <ul className="mt-6 space-y-3">
        {listings.map((listing) => (
          <li key={listing.slug}>
            <Link
              href={`/${listing.slug}`}
              className="block rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"
            >
              <p className="font-semibold text-stone-900">{listing.address}</p>
              <p className="text-sm text-stone-500">{listing.city}</p>
              <p className="mt-1 font-bold text-emerald-700">{listing.price}</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
