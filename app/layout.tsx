import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { SITE } from "@/lib/config";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: "Idoconverter: marketplace-ready product photos", template: "%s | Idoconverter" },
  description: "Prepare product photos for Amazon India, Flipkart and Meesho in one batch: white background, right size, renamed and checked, in your browser.",
  openGraph: { type: "website", siteName: SITE.name },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: dark)", color: "#121518" },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Reading request headers renders every page per request, so each response gets a fresh CSP nonce.
  await headers();
  return (
    <html lang="en">
      <body>
        <a href="#main" className="skip-link">Skip to content</a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
