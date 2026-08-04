import { notFound } from "next/navigation";
import { getListingBySlug } from "@/lib/listings-data";
import BrandHeader from "@/components/BrandHeader";
import ListingCard from "@/components/ListingCard";
import Chat from "@/components/Chat";

export function generateMetadata({ params }: { params: { slug: string } }) {
  const listing = getListingBySlug(params.slug);
  return { title: listing ? listing.address : "Focus Commercial Real Estate" };
}

export default function PropertyPage({ params }: { params: { slug: string } }) {
  const listing = getListingBySlug(params.slug);

  if (!listing) {
    notFound();
  }

  return (
    <main className="flex min-h-dvh flex-col bg-white">
      <BrandHeader />
      <ListingCard listing={listing} />
      <Chat listing={listing} />
    </main>
  );
}
