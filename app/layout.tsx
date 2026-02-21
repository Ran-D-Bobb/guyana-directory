import type { Metadata, Viewport } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Toaster } from "sonner";
import { InstallPrompt } from "@/components/InstallPrompt";
import { QueryProvider } from "@/components/providers/QueryProvider";
// TODO: Re-enable when push notifications are fully configured
// import { PushProvider } from "@/components/providers/PushProvider";

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

export const viewport: Viewport = {
  themeColor: '#0d5c4b',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover', // Enable safe area insets for notches/status bars
  // Note: Do NOT set maximumScale: 1 - it disables pinch-to-zoom accessibility
}

export const metadata: Metadata = {
  metadataBase: new URL('https://waypointgy.com'),
  title: {
    default: "Waypoint - Discover Guyana",
    template: "%s | Waypoint",
  },
  description: "Discover local businesses, tourism experiences, events, and rentals across Guyana. Your guide to the Land of Many Waters.",
  icons: {
    icon: '/icons/icon-192x192.png',
    apple: '/icons/icon-192x192.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Waypoint',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'Waypoint',
    locale: 'en_US',
    title: 'Waypoint - Discover Guyana',
    description: 'Discover local businesses, tourism experiences, events, and rentals across Guyana.',
    images: [{ url: '/icons/icon-512x512.png', width: 512, height: 512, alt: 'Waypoint - Discover Guyana' }],
  },
  twitter: {
    card: 'summary',
    title: 'Waypoint - Discover Guyana',
    description: 'Discover local businesses, tourism experiences, events, and rentals across Guyana.',
    images: ['/icons/icon-512x512.png'],
  },
  alternates: {
    canonical: '/',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`light ${playfair.variable} ${dmSans.variable}`}>
      <body className="antialiased font-sans min-h-screen min-h-dvh">
        <QueryProvider>
          <Header />
          {children}
          <Toaster position="top-center" richColors />
          <InstallPrompt />
        </QueryProvider>
      </body>
    </html>
  );
}
