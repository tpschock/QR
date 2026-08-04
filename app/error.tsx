"use client";

import Link from "next/link";
import BrandHeader from "@/components/BrandHeader";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-dvh flex-col bg-white">
      <BrandHeader />
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <h1 className="text-lg font-semibold text-slate-900">
          Something went wrong
        </h1>
        <p className="mt-2 max-w-xs text-sm text-slate-500">
          Please try again, or browse our current properties.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-full bg-brand-navy px-6 py-3 text-sm font-medium text-white"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-full border border-brand-navy px-6 py-3 text-sm font-medium text-brand-navy"
          >
            All properties
          </Link>
        </div>
      </div>
    </main>
  );
}
