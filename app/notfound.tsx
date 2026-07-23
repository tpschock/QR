import Link from "next/link";
import BrandHeader from "@/components/BrandHeader";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col bg-white">
      <BrandHeader />
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <h1 className="text-lg font-semibold text-slate-900">
          We couldn't find that listing
        </h1>
        <p className="mt-2 max-w-xs text-sm text-slate-500">
          This link may be out of date. Browse our current properties instead.
        </p>
        <Link
          href="/"
          className="mt-6 rounded-full bg-brand-navy px-6 py-3 text-sm font-medium text-white"
        >
          View all properties
        </Link>
      </div>
    </main>
  );
}
