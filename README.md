# Property Chatbot

A single-property listing page with an AI chat panel. The listing is editable
in the browser; the chat calls a server-side API route (never the client) to
talk to the Claude API, so your API key never reaches the browser. A QR code
button generates a code pointing at the live page URL.

## Local development

```bash
npm install
cp .env.example .env.local   # then fill in ANTHROPIC_API_KEY
npm run dev
```

Open http://localhost:3000.

## Deploy to Vercel

1. Push this repo to GitHub (or use `vercel` CLI directly without GitHub).
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo — Vercel
   auto-detects the Next.js project, no config needed.
3. Under **Environment Variables**, add:
   - `ANTHROPIC_API_KEY` — your key from [console.anthropic.com](https://console.anthropic.com)
4. Deploy. You'll get a live URL like `your-project.vercel.app`.
5. Open the deployed page, click **Show QR code** — it encodes the live page
   URL and is scannable immediately.

### Deploying via CLI instead of GitHub

```bash
npm install -g vercel
vercel                       # first deploy, follow prompts
vercel env add ANTHROPIC_API_KEY production
vercel --prod
```

## How it's structured

- `app/page.tsx` — the listing page (editable fields + chat panel + QR button)
- `components/ListingCard.tsx` — editable property details
- `components/Chat.tsx` — chat UI, calls `/api/chat`
- `components/QRPanel.tsx` — generates a QR code for the current page URL
- `app/api/chat/route.ts` — serverless route; holds the Anthropic API key
  server-side and calls Claude with the listing as context
- `lib/listing.ts` — listing data shape and default values
