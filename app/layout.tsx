import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: "Waypoint - Guyana Business Directory",
  description: "Discover local businesses in Guyana",
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
    <html lang="en" className="light">
      <body className="antialiased bg-white">
        {/* Don't render Header in kiosk mode - it should be a standalone fullscreen experience */}
        {!isKioskMode && <Header />}
        {children}
      </body>
    </html>
  );
}
