import { getListings } from "@/lib/listings-data";
import BrandHeader from "@/components/BrandHeader";
import PropertyDirectory from "@/components/PropertyDirectory";

export default function Home() {
  const listings = getListings();

  return (
    <main className="min-h-dvh bg-white">
      <BrandHeader />
      <div className="mx-auto max-w-lg px-4 py-8">
        <h1 className="text-lg font-semibold text-slate-900">Properties</h1>
        <p className="mt-1 text-sm text-slate-500">
          Each listing has its own page and QR code — visitors scanning a
          sign go straight to that property's chat.
        </p>
        <PropertyDirectory listings={listings} />
      </div>
    </main>
  );
}
