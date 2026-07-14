# Property Chatbot

A single-property listing page with an AI chat panel. The listing is editable
in the browser; the chat calls a server-side API route (never the client) to
talk to the Gemini API, so your API key never reaches the browser. A QR code
button generates a code pointing at the live page URL.

## Getting a free API key

1. Go to [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Sign in with a Google account and click **Create API key**
3. Copy the key — it's free to use within Gemini's free-tier rate limits (no
   billing required for light/demo traffic)

## Local development

```bash
npm install
cp .env.example .env.local   # then fill in GEMINI_API_KEY
npm run dev
