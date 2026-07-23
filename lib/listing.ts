export interface Agent {
  name: string;
  phone?: string;
  email?: string;
}

export interface Listing {
  slug: string;
  address: string;
  city: string;
  listingStatus: string;
  photoUrl?: string;
  buildingType?: string;
  buildingStatus?: string;
  leaseStructure?: string;
  sprinklerType?: string;
  unitAmenities?: string;
  accessFrontage?: string;
  yearBuilt?: number;
  buildingSizeSf?: number;
  availableSf?: number;
  warehouseSf?: number;
  landSizeAcres?: number;
  dockDoors?: number;
  gradeLevelDoors?: number;
  dockHeightFt?: number;
  truckCourtDepthFt?: number;
  ceilingHeightFt?: number;
  parkingSpaces?: number;
  bedrooms?: number;
  bathrooms?: number;
  units?: number;
  buildings?: number;
  floors?: number;
  elevators?: number;
  trafficPerDay?: number;
  pricePsf?: number;
  pricePerUnit?: number;
  priceTotal?: number;
  leasePricePsf?: number;
  inPlaceRentPsf?: number;
  salesPerSf?: number;
  noi?: number;
  agents: Agent[];
  notes?: string;
}

interface FieldDef {
  key: keyof Listing;
  label: string;
  format?: (value: never) => string;
}

const money = (v: number) =>
  `$${v.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
const moneyWhole = (v: number) => `$${Math.round(v).toLocaleString()}`;
const sf = (v: number) => `${v.toLocaleString()} SF`;
const ft = (v: number) => `${v} ft`;
const perSf = (v: number) => `${money(v)}/SF`;

const FIELD_DEFS: FieldDef[] = [
  { key: "buildingType", label: "Building Type" },
  { key: "buildingSizeSf", label: "Building Size", format: sf as never },
  { key: "availableSf", label: "Available", format: sf as never },
  { key: "warehouseSf", label: "Warehouse Space", format: sf as never },
  {
    key: "landSizeAcres",
    label: "Land Size",
    format: ((v: number) => `${v} acres`) as never,
  },
  { key: "yearBuilt", label: "Year Built" },
  { key: "priceTotal", label: "Price (Total)", format: moneyWhole as never },
  { key: "pricePsf", label: "Price (PSF)", format: perSf as never },
  { key: "pricePerUnit", label: "Price per Unit", format: moneyWhole as never },
  { key: "leasePricePsf", label: "Lease Rate", format: perSf as never },
  { key: "inPlaceRentPsf", label: "In-Place Rent", format: perSf as never },
  { key: "leaseStructure", label: "Lease Structure" },
  { key: "noi", label: "Net Operating Income", format: moneyWhole as never },
  { key: "salesPerSf", label: "Sales", format: perSf as never },
  { key: "dockDoors", label: "Dock Doors" },
  { key: "gradeLevelDoors", label: "Grade-Level Doors" },
  { key: "dockHeightFt", label: "Dock Height", format: ft as never },
  { key: "truckCourtDepthFt", label: "Truck Court Depth", format: ft as never },
  { key: "ceilingHeightFt", label: "Ceiling Height", format: ft as never },
  { key: "sprinklerType", label: "Sprinkler" },
  { key: "parkingSpaces", label: "Parking Spaces" },
  { key: "accessFrontage", label: "Access/Frontage" },
  {
    key: "trafficPerDay",
    label: "Traffic",
    format: ((v: number) => `${v.toLocaleString()}/day`) as never,
  },
  { key: "bedrooms", label: "Bedrooms" },
  { key: "bathrooms", label: "Bathrooms" },
  { key: "units", label: "Units" },
  { key: "buildings", label: "Buildings" },
  { key: "floors", label: "Floors" },
  { key: "elevators", label: "Elevators" },
  { key: "unitAmenities", label: "Unit Amenities" },
  { key: "buildingStatus", label: "Building Status" },
];

export interface DisplayField {
  label: string;
  value: string;
}

export function getListingFields(listing: Listing): DisplayField[] {
  const fields: DisplayField[] = [];
  for (const def of FIELD_DEFS) {
    const raw = listing[def.key];
    if (raw === undefined || raw === null || raw === "") continue;
    const value = def.format ? def.format(raw as never) : String(raw);
    fields.push({ label: def.label, value });
  }
  return fields;
}

export function getPrimaryStat(listing: Listing): string | undefined {
  if (listing.priceTotal) return moneyWhole(listing.priceTotal);
  if (listing.pricePsf) return perSf(listing.pricePsf);
  if (listing.leasePricePsf) return `${perSf(listing.leasePricePsf)} lease`;
  if (listing.inPlaceRentPsf) return `${perSf(listing.inPlaceRentPsf)} rent`;
  return undefined;
}

export function getSecondaryStat(listing: Listing): string | undefined {
  if (listing.buildingSizeSf) return sf(listing.buildingSizeSf);
  if (listing.landSizeAcres) return `${listing.landSizeAcres} acres`;
  if (listing.availableSf) return `${sf(listing.availableSf)} avail`;
  return undefined;
}

export function listingToContext(listing: Listing): string {
  const fieldLines = getListingFields(listing)
    .map((f) => `${f.label}: ${f.value}`)
    .join("\n");

  const agentLines = listing.agents.length
    ? listing.agents
        .map(
          (a) =>
            `${a.name}${a.phone ? `, ${a.phone}` : ""}${
              a.email ? `, ${a.email}` : ""
            }`
        )
        .join("; ")
    : "Not yet assigned — direct the buyer to contact our office";

    const notesSection = listing.notes
    ? `\n\nAdditional marketing details (from the property flier):\n${listing.notes}`
    : "";

  return `Property listing details:
Name/Address: ${listing.address}
City: ${listing.city}
Status: ${listing.listingStatus}
${fieldLines}
Listing agent(s): ${agentLines}${notesSection}`;
}
