import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { headers } from "next/headers";

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Waypoint - Discover Guyana",
  description: "Explore local businesses, experiences, stays, and events across Guyana. Connect instantly via WhatsApp.",
  icons: {
    icon: '/waypoint-logo.png',
    apple: '/waypoint-logo.png',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Check if we're on a kiosk route - kiosk mode should be completely standalone
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  const isKioskMode = pathname.startsWith("/kiosk");

  return (
    <html lang="en" className={`light ${playfair.variable} ${dmSans.variable}`}>
      <body className="antialiased font-sans">
        {/* Don't render Header in kiosk mode - it should be a standalone fullscreen experience */}
        {!isKioskMode && <Header />}
        {children}
      </body>
    </html>
  );
}
