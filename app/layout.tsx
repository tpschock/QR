import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Focus Commercial Real Estate",
  description: "Scan the QR code to chat with an AI assistant about this property.",
};

export const viewport: Viewport = {
  themeColor: "#1E3A5C",
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
