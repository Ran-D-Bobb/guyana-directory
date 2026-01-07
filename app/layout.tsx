import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Toaster } from "sonner";

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
  description: "Explore local businesses, experiences, stays, and events across Guyana.",
  icons: {
    icon: '/waypoint-logo.png',
    apple: '/waypoint-logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`light ${playfair.variable} ${dmSans.variable}`}>
      <body className="antialiased font-sans">
        <Header />
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
