# Property Chatbot

A single-property page designed for a QR code on a "for sale" sign. Visitors
scan the code, land on a mobile-first page with a compact, read-only property
summary and a prominent AI chat panel to ask questions. Listing details are
hardcoded in `lib/listing.ts` — there's no in-browser editing, since this page
is meant for the public, not the agent. The chat calls a server-side API
route (never the client) to talk to the Gemini API, so your API key never
reaches the browser,

## Getting a free API key

1. Go to [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Sign in with a Google account and click **Create API key**
3. Copy the key — it's free to use within Gemini's free-tier rate limits (no
   billing required for light/demo traffic)

## Editing the listing

Open `lib/listing.ts` and edit the `defaultListing` object directly — address,
price, beds/baths, description, features, agent contact. Commit and redeploy
to update the live page.

## Local development

```bash
npm install
cp .env.example .env.local   # then fill in GEMINI_API_KEY
npm run dev
