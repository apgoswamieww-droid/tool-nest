import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/layout/Providers";
import { MonetizationProvider } from "@/components/monetization/MonetizationProvider";
import { resolveMonetizationClientBundle } from "@/lib/monetization";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getHomeMetadata } from "@/lib/seo";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = getHomeMetadata();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-resolved monetization state (flags + tier). Anonymous for
  // now — R1 reads the session here. Never passes secrets to the client.
  const monetizationBundle = resolveMonetizationClientBundle();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col font-sans antialiased">
        <Providers>
          <MonetizationProvider bundle={monetizationBundle}>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </MonetizationProvider>
        </Providers>
      </body>
    </html>
  );
}
