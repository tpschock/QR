export interface Listing {
  slug: string;
  address: string;
  city: string;
  price: string;
  beds: number;
  baths: number;
  baydoors: number;
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
    slug: "1102-shaver-street",
    address: "1102 Shaver Street, Unit B",
    city: "Springdale",
    price: "$11 PSF NNN",
    sqft: 5083,
    description:
      "This ±5,083 SF warehouse for lease offers a functional industrial layout with ±550SF of dedicated office space and ±0.25 acre of yard space to support outdoor storage, staging, or operational flexibility.",
    features: [
      "2 grade-level bay doors",
      "Only a 1 mile drive to 1-49",
      "New concrete at the entrance",
      "Fresh gravel throughout the rear",
      "Interior improvements throughout the space",
    ],
    agentName: "Palmer Hays, SIOR",
    agentPhone: "(479) 466-8499",
    agentEmail: "palmer@focuscregroup.com",
    photoUrl: "",
  },

  {
    slug: "1201-e-lake-francis",
    address: "1201 E Lake Francis Drive",
    city: "Siloam Springs",
    price: "$8 PSF Modified Gross",
    sqft: 14682,
    description:
      "1201 E Lake Francis Drive offers ±14,682 SF of functional flex/industrial space for lease in Siloam Springs, Arkansas, conveniently located less than one mile from Highway 412 for excellent regional access. The property features four 12' x 10' grade-level overhead doors, two dock-high doors, an 18' peak ceiling height, one office, and a half bath, providing a versatile layout for a variety of industrial users.",
    features: [
      "4 (12'x 10') grade level doors",
      "2 dock doors",
      "18' peak height",
      "Electric HVAC",
      "Fenced backyard",
      "136' x 102' Dimensions",
    ],
    agentName: "Will Jarratt",
    agentPhone: "(479) 396-2712",
    agentEmail: "will@focuscregroup.com",
    photoUrl: "",
  },
  {
    slug: "1603-w-acorn",
    address: "1603 W Acorn Drive",
    city: "Rogers",
    price: "$12 PSF NNN",
    sqft: 1760,
    description:
      "READY TO LEASE FLEX UNIT COMPLETE WITH ONE SMALL OFFICE & ONE HALF BATH, WITH EASY ACCESS TO MAJOR HIGHWAYS AND NEARBY AMENITIES.",
    features: [
      "10x10 bay level door",
      "Only a 2 mile drive to 1-49",
      "4 miles from the Walmart Home Office", 
    ],
    agentName: "Palmer Hays, SIOR",
    agentPhone: "(479) 466-8499",
    agentEmail: "palmer@focuscregroup.com",
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
