import { defaultListing } from "@/lib/listing";
import ListingCard from "@/components/ListingCard";
import Chat from "@/components/Chat";

export default function Home() {
  return (
    <main className="flex min-h-dvh flex-col bg-white">
      <ListingCard listing={defaultListing} />
      <Chat listing={defaultListing} />
    </main>
  );
}
