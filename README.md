# Property Chatbot

A multi-property site designed for QR codes on "for sale" signs. Each
property gets its own page at `/<slug>` with a compact, read-only summary and
a prominent AI chat panel — visitors scan the sign for that specific property
and land directly on its chat. The root page (`/`) is a directory listing all
properties, useful for you to grab each one's link. Listing details are
hardcoded in `lib/listing.ts` — there's no in-browser editing, since these
pages are meant for the public, not the agent. The chat calls a server-side
API route (never the client) to talk to the Gemini API, so your API key never
reaches the browser.

## Getting a free API key

1. Go to [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Sign in with a Google account and click **Create API key**
3. Copy the key — it's free to use within Gemini's free-tier rate limits (no
   billing required for light/demo traffic)

## Adding or editing a property

Open `lib/listing.ts` and edit the `listings` array — each entry needs a
unique `slug` (used in its URL, e.g. `slug: "128-maple-ridge"` →
`yoursite.vercel.app/128-maple-ridge`), plus address, price, beds/baths,
description, features, and agent contact. Commit and redeploy to update the
live site. Add a new object to the array for a new property.

## Local development

```bash
npm install
cp .env.example .env.local   # then fill in GEMINI_API_KEY
npm run dev
