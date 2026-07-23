# Property Chatbot

A multi-property site designed for QR codes on "for sale"/"for lease" signs.
Each property gets its own page at `/<slug>` with a compact, read-only
summary and a prominent AI chat panel — visitors scan the sign for that
specific property and land directly on its chat. The root page (`/`) is a
searchable directory of all properties. Listing data comes straight from a
Salesforce report export (`data/properties.csv`) — no code editing required
to update listings. The chat calls a server-side API route (never the
client) to talk to the Gemini API, so your API key never reaches the
browser. A bad or stale QR code lands on a branded "not found" page instead
of a generic error.

## Getting a free API key

1. Go to [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Sign in with a Google account and click **Create API key**
3. Copy the key — it's free to use within Gemini's free-tier rate limits (no
   billing required for light/demo traffic)

## Updating listings from Salesforce

`data/properties.csv` is a direct export of your Salesforce property report
— the exact column headers this app expects are:

`Property: Property Name`, `# of Dock Doors`, `# of Grade Level Doors`,
`# of Parking Spaces`, `Available SF`, `Ceiling Height (ft)`, `City`,
`Land Size (Acres)`, `Lease Price (PSF)`, `Net Operating Income`,
`Lead Broker`, `Year Built`, `Warehouse Space (SF)`, `Price (PSF)`,
`Price (per Unit)`, `Price (total)`, `Sprinkler Type`, `Unit Amenities`,
`# of Bathrooms`, `# of Bedrooms`, `# of Buildings`, `# of Elevators`,
`# Of Units`, `# of Floors`, `Access Frontage`, `Building Status`,
`Sales (per SF)`, `Building Type`, `Lease Structure`,
`Truck Court Depth (ft)`, `Traffic (per Day)`, `In-Place Rent (psf)`,
`Building Size (SF)`, `Dock Height (ft)`, `Listing Status`

Plus one optional column not part of the standard Salesforce report:

- `Photo URL` — a direct link to a photo of the property (e.g. hosted on
  Salesforce, Dropbox, or anywhere publicly accessible). If present, it's
  shown as a hero image at the top of the property page. Leave it blank (or
  omit the column) for properties with no photo yet — nothing breaks.

To refresh the site with current data:

1. In Salesforce, run/export your property report to CSV (report menu →
   **Export** → **Details Only** → Format: **Comma Delimited .csv**) — as
   long as it has the same columns as above (any order is fine, since export
   is matched by header name), it'll work as-is.
2. On GitHub, open `data/properties.csv` and use **Add file → Upload files**
   to overwrite it with your freshly exported file (this is safer than
   copy-pasting for a file this size — just drag the exported CSV in).
3. Commit, then redeploy on Vercel (or just wait — a commit on this branch
   auto-triggers a new deploy if your Vercel project is connected to GitHub).

**Notes on how the data is handled:**
- Every field except property name/city/status is optional — the site only
  displays and tells the AI about whatever fields are actually filled in for
  each property, so a warehouse listing and a land parcel look different
  automatically.
- Rows with a **blank `Listing Status`** are skipped entirely — this is how
  Salesforce "MASTER"/rollup records (e.g. a multi-building complex's parent
  record) get excluded automatically, since those aren't individually
  marketed properties.
- Each property automatically gets a URL slug generated from its name (e.g.
  "1102 Shaver Street, Unit B" → `/1102-shaver-street-unit-b`) — no manual
  slug management needed.
- `Land Size (Acres)` of `0` or `0.00` is treated as "not applicable" rather
  than a real zero-acre lot, since that's how the export fills the field on
  non-land listings.
- If a property isn't in `data/properties.csv` (or its `Listing Status` is
  blank), it has no page and no QR code should be generated for it yet.

## Setting up broker contact info

Salesforce only exports the broker's first name (e.g. `Palmer`, `Corey`) —
not phone/email. `data/agents.csv` maps each broker's first name to their
full contact info; the site joins this automatically by name. Open
`data/agents.csv` and fill in the real name/phone/email for each broker key:

```
BrokerKey,FullName,Phone,Email
Palmer,"Palmer Hays, SIOR","(479) 466-8499","palmer@focuscregroup.com"
Cameron,"Cameron [Last Name]","",""
...
```

If a property lists multiple brokers (Salesforce separates them with `; `,
e.g. `"Clinton; Corey"`), the site shows/tells the AI about all of them. A
broker listed as `N/A - Other` is treated as unassigned — the AI will tell
visitors to contact your office instead. If you add a new broker's name to
Salesforce that isn't yet in `agents.csv`, the site still works — it just
shows their first name with no phone/email until you add a row for them.

The listing agent's phone/email are shown as tap-to-call/email buttons right
under the price on each property page (not just buried in "full details"),
so a visitor on their phone can reach the broker in one tap.

## Adding marketing flier content

The Salesforce export only has structured spec fields — no room for the
richer narrative content in your marketing fliers. To add that: create a
file at `data/notes/<slug>.md` (same slug as the property's URL, e.g.
`data/notes/1102-shaver-street.md`) and put whatever extra text you want the
chatbot to know in it — copy-pasted flier copy, highlights, nearby
amenities, whatever. It's shown to visitors in the "full details" section
and given to the AI as additional context. Only properties with a flier
need a file — everything else works exactly as before. This file is
untouched by Salesforce CSV refreshes, so it persists across updates.

You don't have to type it yourself — send the flier PDF to Claude and ask
it to pull the key details into a notes file for that property.

## Local development

```bash
npm install
cp .env.example .env.local   # then fill in GEMINI_API_KEY
npm run dev
```

Open http://localhost:3000 — this shows the searchable directory of all
properties from `data/properties.csv`.

## Deploy to Vercel

1. Push this repo to GitHub (or use `vercel` CLI directly without GitHub).
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo — Vercel
   auto-detects the Next.js project, no config needed.
3. Under **Environment Variables**, add:
   - `GEMINI_API_KEY` — your key from [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
4. Deploy. You'll get a live URL like `your-project.vercel.app`.

### Deploying via CLI instead of GitHub

```bash
npm install -g vercel
vercel                       # first deploy, follow prompts
vercel env add GEMINI_API_KEY production
vercel --prod
```

## Generating a QR code per sign

For each property, generate a QR code pointing at its specific URL
(`yoursite.vercel.app/<slug>`) using any free QR generator (e.g.
[qr-code-generator.com](https://www.qr-code-generator.com/) or
[Google's own QR tool](https://qr.io/)) and print it on that property's sign.
Each sign gets a different code pointing at its own listing.

## Abuse protection

`/api/chat` rate-limits requests per visitor (20 messages per 5 minutes) to
protect the shared Gemini API key from being exhausted by a single abusive
client — this is a simple in-memory limiter, good enough at the current
traffic scale, but not shared across serverless instances. If usage grows
significantly, swap in Vercel KV or Upstash for a durable, cross-instance
limiter.

## How it's structured

- `data/properties.csv` — the listing data — **replace this file (exported
  from a Salesforce report) to add/update/remove properties**
- `data/agents.csv` — broker first name → full name/phone/email lookup —
  **fill this in with real contact info**
- `data/notes/<slug>.md` — optional freeform extra content per property
  (from marketing fliers, etc.) — only needed for properties that have one
- `lib/listings-data.ts` — reads and parses both CSVs, joins broker contact
  info onto each listing, filters out blank-status rows, auto-generates
  slugs
- `lib/listing.ts` — the `Listing`/`Agent` types, the field-display config
  (which Salesforce columns map to which labels/units), and the helper that
  formats a listing for the AI's context
- `app/page.tsx` — the properties directory page
- `components/PropertyDirectory.tsx` — client-side search/filter over all
  properties (needed since the full list can be large)
- `app/[slug]/page.tsx` — an individual property page (read-only summary + chat)
- `app/not-found.tsx` / `app/error.tsx` — branded fallback pages for a bad
  QR code link or an unexpected error
- `components/BrandHeader.tsx` / `components/FocusLogo.tsx` — the sticky
  brand header shown on every page
- `components/ListingCard.tsx` — property summary; dynamically shows only
  the fields that are actually populated for that property, a hero photo
  if one's set, tap-to-call/email broker buttons, and full contact(s) in
  "full details"
- `components/Chat.tsx` — the chat panel, calls `/api/chat`
- `app/api/chat/route.ts` — serverless route; holds the Gemini API key
  server-side, rate-limits requests, and calls Gemini with the listing as
  context
