import { notFound } from "next/navigation";
import { getListingBySlug } from "@/lib/listing";
import ListingCard from "@/components/ListingCard";
import Chat from "@/components/Chat";

export function generateMetadata({ params }: { params: { slug: string } }) {
  const listing = getListingBySlug(params.slug);
  return { title: listing ? listing.address : "Property Chatbot" };
}

export default function PropertyPage({ params }: { params: { slug: string } }) {
  const listing = getListingBySlug(params.slug);

  if (!listing) {
    notFound();
  }

  return (
    <main className="flex min-h-dvh flex-col bg-white">
      <ListingCard listing={listing} />
      <Chat listing={listing} />
    </main>
  );
}
