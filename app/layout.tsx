// Root layout is a passthrough — [locale]/layout.tsx provides <html> and <body>
// with the correct lang attribute for i18n
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
