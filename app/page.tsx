import Link from "next/link";
import { listings } from "@/lib/listing";
import BrandHeader from "@/components/BrandHeader";

export default function Home() {
  return (
    <main className="min-h-dvh bg-white">
      <BrandHeader />
      <div className="mx-auto max-w-lg px-4 py-8">
        <h1 className="text-lg font-semibold text-slate-900">Properties</h1>
        <p className="mt-1 text-sm text-slate-500">
          Each listing has its own page and QR code — visitors scanning a
          sign go straight to that property's chat.
        </p>

        <ul className="mt-6 space-y-3">
          {listings.map((listing) => (
            <li key={listing.slug}>
              <Link
                href={`/${listing.slug}`}
                className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <p className="font-semibold text-slate-900">{listing.address}</p>
                <p className="text-sm text-slate-500">{listing.city}</p>
                <p className="mt-1 font-bold text-brand-navy">{listing.price}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
