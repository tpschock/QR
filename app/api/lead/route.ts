import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

interface LeadRequest {
  name?: string;
  company?: string;
  phone?: string;
  email?: string;
  listingAddress?: string;
  listingSlug?: string;
  // Hidden field real visitors never fill in — if it has a value, the
  // submission came from a bot and is silently dropped.
  website?: string;
}

// Much stricter than /api/chat — a real visitor submits this at most once.
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const requestLog = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (requestLog.get(ip) ?? []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS
  );
  recent.push(now);
  requestLog.set(ip, recent);
  return recent.length > RATE_LIMIT_MAX_REQUESTS;
}

function getClientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
}

async function sendNotificationEmail(lead: LeadRequest) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, LEAD_NOTIFICATION_EMAIL } =
    process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD || !LEAD_NOTIFICATION_EMAIL) return;

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
  });

  await transporter.sendMail({
    from: SMTP_USER,
    to: LEAD_NOTIFICATION_EMAIL,
    replyTo: lead.email || undefined,
    subject: `New chatbot lead: ${lead.listingAddress || "unknown property"}`,
    text: `Name: ${lead.name || "(not given)"}
Company: ${lead.company || "(not given)"}
Phone: ${lead.phone || "(not given)"}
Email: ${lead.email || "(not given)"}
Property: ${lead.listingAddress || "(unknown)"}
Link: ${lead.listingSlug ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL || ""}/${lead.listingSlug}` : "(unknown)"}
Submitted: ${new Date().toLocaleString()}`,
  });
}

async function appendToGoogleSheet(lead: LeadRequest) {
  const actionUrl = process.env.GOOGLE_FORM_ACTION_URL;
  if (!actionUrl) return;

  const params = new URLSearchParams();
  const entries: [string | undefined, string | undefined][] = [
    [process.env.GOOGLE_FORM_ENTRY_NAME, lead.name],
    [process.env.GOOGLE_FORM_ENTRY_COMPANY, lead.company],
    [process.env.GOOGLE_FORM_ENTRY_PHONE, lead.phone],
    [process.env.GOOGLE_FORM_ENTRY_EMAIL, lead.email],
    [process.env.GOOGLE_FORM_ENTRY_PROPERTY, lead.listingAddress],
  ];
  for (const [entryId, value] of entries) {
    if (entryId && value) params.set(entryId, value);
  }

  await fetch(actionUrl, { method: "POST", body: params });
}

export async function POST(req: Request) {
  if (isRateLimited(getClientIp(req))) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  let body: LeadRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (body.website) {
    // Honeypot tripped — pretend success so bots don't learn to skip this field.
    return NextResponse.json({ ok: true });
  }

  const name = body.name?.trim();
  const phone = body.phone?.trim();
  const email = body.email?.trim();

  if (!name || (!phone && !email)) {
    return NextResponse.json(
      { error: "Please include your name and a phone number or email." },
      { status: 400 }
    );
  }

  const lead: LeadRequest = {
    name,
    company: body.company?.trim(),
    phone,
    email,
    listingAddress: body.listingAddress,
    listingSlug: body.listingSlug,
  };

  const results = await Promise.allSettled([
    sendNotificationEmail(lead),
    appendToGoogleSheet(lead),
  ]);

  for (const result of results) {
    if (result.status === "rejected") {
      console.error("Lead delivery failed:", result.reason);
    }
  }

  return NextResponse.json({ ok: true });
}
