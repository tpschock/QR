import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Property Chatbot",
  description: "Scan the QR code to chat with an AI assistant about this listing.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
