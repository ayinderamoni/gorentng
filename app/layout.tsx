import type { Metadata } from "next";
import { Bricolage_Grotesque, DM_Sans, Space_Grotesk } from "next/font/google";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/auth";
import { SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/constants";

import "./globals.css";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
});

const head = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-head",
});

const body = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Rent homes and everyday items across Nigeria — apartments, rooms, generators, tools and appliances on one marketplace.",
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_NG",
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser();

  return (
    <html
      lang="en-NG"
      className={`${display.variable} ${head.variable} ${body.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-cream font-body text-ink">
        <SiteHeader userName={user?.fullName ?? null} />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
