export interface Listing {
  slug: string;
  address: string;
  city: string;
  price: string;
  beds: number;
  baths: number;
  sqft: number;
  yearBuilt: number;
  description: string;
  features: string[];
  agentName: string;
  agentPhone: string;
  agentEmail: string;
  photoUrl: string;
}

export const listings: Listing[] = [
  {
    slug: "128-maple-ridge",
    address: "128 Maple Ridge Court",
    city: "Asheville, NC 28804",
    price: "$649,000",
    beds: 4,
    baths: 3,
    sqft: 2650,
    yearBuilt: 2016,
    description:
      "A light-filled craftsman on a quiet cul-de-sac, minutes from downtown. Vaulted great room, chef's kitchen with quartz counters, and a covered back porch overlooking a wooded half-acre lot.",
    features: [
      "Attached 2-car garage",
      "Primary suite on main level",
      "Gas fireplace",
      "Hardwood floors throughout main level",
      "Fenced backyard",
      "New roof (2023)",
    ],
    agentName: "Jordan Reyes",
    agentPhone: "(828) 555-0148",
    agentEmail: "jordan@ridgeline-realty.example",
    photoUrl: "",
  },
];

export function getListingBySlug(slug: string): Listing | undefined {
  return listings.find((listing) => listing.slug === slug);
}

export function listingToContext(listing: Listing): string {
  return `Property listing details:
Address: ${listing.address}, ${listing.city}
Price: ${listing.price}
Bedrooms: ${listing.beds}
Bathrooms: ${listing.baths}
Square footage: ${listing.sqft} sqft
Year built: ${listing.yearBuilt}
Description: ${listing.description}
Features: ${listing.features.join(", ")}
Listing agent: ${listing.agentName}, ${listing.agentPhone}, ${listing.agentEmail}`;
}
