import type { Metadata, Viewport } from "next";
import dynamic from "next/dynamic";
import { Playfair_Display, DM_Sans } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { Header } from "@/components/Header";
import { Toaster } from "sonner";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { MainLayoutShell } from "@/components/MainLayoutShell";
import { routing } from '@/i18n/routing';
import "../globals.css";

// Dynamic imports for non-critical components — code-split into separate chunks
const InstallPrompt = dynamic(() => import("@/components/InstallPrompt").then(m => ({ default: m.InstallPrompt })));
const ConsoleEasterEgg = dynamic(() => import("@/components/ConsoleEasterEgg").then(m => ({ default: m.ConsoleEasterEgg })));
const ScrollToTop = dynamic(() => import("@/components/ScrollToTop").then(m => ({ default: m.ScrollToTop })));

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
  weight: ["600", "700"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
  weight: ["400", "500", "600", "700"],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: '#0d5c4b',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  // Note: Do NOT set maximumScale: 1 - it disables pinch-to-zoom accessibility
}

export const metadata: Metadata = {
  metadataBase: new URL('https://waypointgy.com'),
  title: {
    default: "Waypoint - Discover Guyana",
    template: "%s | Waypoint",
  },
  description: "Find the best businesses, experiences, events, and stays across Guyana. Your guide to the Land of Many Waters.",
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
    url: 'https://waypointgy.com',
    title: 'Waypoint - Discover Guyana',
    description: 'Find the best businesses, experiences, events, and stays across Guyana.',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Waypoint - Discover Guyana | Businesses, Experiences, Events & Stays' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Waypoint - Discover Guyana',
    description: 'Find the best businesses, experiences, events, and stays across Guyana.',
    images: ['/opengraph-image'],
  },
  alternates: {
    canonical: '/',
  },
};

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Load all messages for the current locale
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${playfair.variable} ${dmSans.variable}`} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://cgkjhdqyaxkcianuwevp.supabase.co" />
        <link rel="dns-prefetch" href="https://cgkjhdqyaxkcianuwevp.supabase.co" />
      </head>
      <body className="antialiased font-sans min-h-screen min-h-dvh">
        <a href="#main-content" className="skip-link">Skip to content</a>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            <QueryProvider>
              <MainLayoutShell>
                <Header />
              </MainLayoutShell>
              <div id="main-content">{children}</div>
              <MainLayoutShell>
                <Toaster position="top-center" richColors />
                <InstallPrompt />
                <ConsoleEasterEgg />
                <ScrollToTop />
              </MainLayoutShell>
            </QueryProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
