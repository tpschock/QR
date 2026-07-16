import fs from "fs";
import path from "path";
import Papa from "papaparse";
import { Agent, Listing } from "./listing";

const PROPERTIES_CSV_PATH = path.join(process.cwd(), "data", "properties.csv");
const AGENTS_CSV_PATH = path.join(process.cwd(), "data", "agents.csv");
const NOTES_DIR = path.join(process.cwd(), "data", "notes");

function slugify(address: string): string {
  return (
    address
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "listing"
  );
}

function num(raw: string | undefined): number | undefined {
  if (!raw || raw.trim() === "") return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
}

function str(raw: string | undefined): string | undefined {
  const trimmed = raw?.trim();
  return trimmed ? trimmed : undefined;
}

function loadAgentLookup(): Map<string, Agent> {
  const map = new Map<string, Agent>();
  if (!fs.existsSync(AGENTS_CSV_PATH)) return map;

  const csv = fs.readFileSync(AGENTS_CSV_PATH, "utf-8");
  const { data } = Papa.parse<Record<string, string>>(csv, {
    header: true,
    skipEmptyLines: true,
  });

  for (const row of data) {
    const key = row.BrokerKey?.trim();
    if (!key) continue;
    map.set(key.toLowerCase(), {
      name: row.FullName?.trim() || key,
      phone: str(row.Phone),
      email: str(row.Email),
    });
  }

  return map;
}

function loadNotes(slug: string): string | undefined {
  const notesPath = path.join(NOTES_DIR, `${slug}.md`);
  if (!fs.existsSync(notesPath)) return undefined;
  const content = fs.readFileSync(notesPath, "utf-8").trim();
  return content || undefined;
}

function resolveAgents(
  rawBroker: string | undefined,
  agentLookup: Map<string, Agent>
): Agent[] {
  if (!rawBroker) return [];

  return rawBroker
    .split(";")
    .map((name) => name.trim())
    .filter((name) => name && name.toLowerCase() !== "n/a - other")
    .map((name) => agentLookup.get(name.toLowerCase()) ?? { name });
}

function loadListings(): Listing[] {
  const csv = fs.readFileSync(PROPERTIES_CSV_PATH, "utf-8");
  const { data } = Papa.parse<Record<string, string>>(csv, {
    header: true,
    skipEmptyLines: true,
  });

  const agentLookup = loadAgentLookup();
  const slugCounts = new Map<string, number>();

  return data
    // Rows with no Listing Status are org/rollup records (e.g. "X - MASTER"),
    // not individually marketed properties.
    .filter((row) => str(row["Listing Status"]))
    .map((row) => {
      const address = row["Property: Property Name"]?.trim() || "Untitled Property";
      const baseSlug = slugify(address);
      const seen = slugCounts.get(baseSlug) ?? 0;
      slugCounts.set(baseSlug, seen + 1);
      const slug = seen === 0 ? baseSlug : `${baseSlug}-${seen + 1}`;

      // "0.00" is used as a filler/not-applicable value for land size on
      // non-land listings in this export, not a genuine zero-acre parcel.
      const landSizeAcres = num(row["Land Size (Acres)"]);

      const listing: Listing = {
        slug,
        address,
        city: row.City?.trim() ?? "",
        listingStatus: row["Listing Status"]?.trim() ?? "",
        buildingType: str(row["Building Type"]),
        buildingStatus: str(row["Building Status"]),
        leaseStructure: str(row["Lease Structure"]),
        sprinklerType: str(row["Sprinkler Type"]),
        unitAmenities: str(row["Unit Amenities"]),
        accessFrontage: str(row["Access Frontage"]),
        yearBuilt: num(row["Year Built"]),
        buildingSizeSf: num(row["Building Size (SF)"]),
        availableSf: num(row["Available SF"]),
        warehouseSf: num(row["Warehouse Space (SF)"]),
        landSizeAcres: landSizeAcres && landSizeAcres > 0 ? landSizeAcres : undefined,
        dockDoors: num(row["# of Dock Doors"]),
        gradeLevelDoors: num(row["# of Grade Level Doors"]),
        dockHeightFt: num(row["Dock Height (ft)"]),
        truckCourtDepthFt: num(row["Truck Court Depth (ft)"]),
        ceilingHeightFt: num(row["Ceiling Height (ft)"]),
        parkingSpaces: num(row["# of Parking Spaces"]),
        bedrooms: num(row["# of Bedrooms"]),
        bathrooms: num(row["# of Bathrooms"]),
        units: num(row["# Of Units"]),
        buildings: num(row["# of Buildings"]),
        floors: num(row["# of Floors"]),
        elevators: num(row["# of Elevators"]),
        trafficPerDay: num(row["Traffic (per Day)"]),
        pricePsf: num(row["Price (PSF)"]),
        pricePerUnit: num(row["Price (per Unit)"]),
        priceTotal: num(row["Price (total)"]),
        leasePricePsf: num(row["Lease Price (PSF)"]),
        inPlaceRentPsf: num(row["In-Place Rent (psf)"]),
        salesPerSf: num(row["Sales (per SF)"]),
        noi: num(row["Net Operating Income"]),
        agents: resolveAgents(row["Lead Broker"], agentLookup),
        notes: loadNotes(slug),
      };

      return listing;
    });
}

let cachedListings: Listing[] | null = null;

export function getListings(): Listing[] {
  if (!cachedListings) {
    cachedListings = loadListings();
  }
  return cachedListings;
}

export function getListingBySlug(slug: string): Listing | undefined {
  return getListings().find((listing) => listing.slug === slug);
}
