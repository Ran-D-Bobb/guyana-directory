# SEO Action Plan: waypointgy.com

**Generated:** February 21, 2026
**Current Score:** 28/100
**Target Score:** 75+/100

---

## Priority 1: CRITICAL (Fix Immediately)

These issues are **blocking indexing entirely**. The site has 0 Google-indexed pages.

### 1.1 Create robots.txt
**File:** `public/robots.txt`
**Effort:** 5 minutes

```
User-agent: *
Allow: /

Disallow: /admin/
Disallow: /dashboard/
Disallow: /auth/
Disallow: /api/
Disallow: /kiosk/
Disallow: /offline

Sitemap: https://waypointgy.com/sitemap.xml
```

### 1.2 Create Dynamic sitemap.xml
**File:** `app/sitemap.ts`
**Effort:** 1-2 hours

Create a Next.js dynamic sitemap that queries all businesses, tourism experiences, events, and rentals from Supabase and generates URLs. Include:
- Homepage (priority 1.0, daily)
- /businesses, /tourism, /events, /rentals (priority 0.9, daily)
- All category pages (priority 0.8, weekly)
- All individual listing pages (priority 0.7, weekly)
- /discover (priority 0.6, weekly)
- /privacy, /terms (priority 0.3, monthly)

### 1.3 Add Canonical URLs
**File:** `app/layout.tsx` + individual page metadata
**Effort:** 30 minutes

Add `metadataBase` to root layout:
```typescript
export const metadata: Metadata = {
  metadataBase: new URL('https://waypointgy.com'),
  // ... existing metadata
  alternates: {
    canonical: '/',
  },
};
```

Each page should set its own canonical via metadata or generateMetadata.

### 1.4 Add Unique Metadata to Key Public Pages
**Effort:** 2-3 hours

Pages that need `generateMetadata` or `metadata` exports:

| Page File | Suggested Title | Suggested Description |
|-----------|----------------|----------------------|
| `app/page.tsx` | "Waypoint - Discover Local Businesses in Guyana" | "Find restaurants, shops, tourism experiences, events, and rentals across Guyana. Your guide to local businesses." |
| `app/businesses/page.tsx` | "Local Businesses in Guyana \| Waypoint" | "Browse verified local businesses in Guyana. Restaurants, shops, services and more with reviews and contact info." |
| `app/businesses/[slug]/page.tsx` | "{Business Name} - {Category} in {Region} \| Waypoint" | "{Business description truncated to 155 chars}" |
| `app/businesses/category/[slug]/page.tsx` | "{Category Name} Businesses in Guyana \| Waypoint" | "Find the best {category} businesses in Guyana. Browse listings with reviews, hours, and contact information." |
| `app/tourism/page.tsx` | "Tourism Experiences in Guyana \| Waypoint" | "Discover guided tours, adventures, and cultural experiences across Guyana. From Kaieteur Falls to Rupununi safaris." |
| `app/tourism/[slug]/page.tsx` | "{Experience Name} - Guyana Tourism \| Waypoint" | "{Experience description truncated to 155 chars}" |
| `app/tourism/category/[slug]/page.tsx` | "{Category} Experiences in Guyana \| Waypoint" | "Browse {category} tourism experiences in Guyana. Find tours, activities, and adventures." |
| `app/events/page.tsx` | "Events & Festivals in Guyana \| Waypoint" | "Discover upcoming events, festivals, workshops, and community gatherings across Guyana." |
| `app/events/[slug]/page.tsx` | "{Event Name} - {Date} \| Waypoint" | "{Event description truncated to 155 chars}" |
| `app/events/category/[slug]/page.tsx` | "{Category} Events in Guyana \| Waypoint" | "Find {category} events in Guyana. Browse upcoming festivals, workshops, and gatherings." |
| `app/search/page.tsx` | "Search Businesses & Experiences \| Waypoint" | "Search for businesses, tourism experiences, events, and rentals in Guyana." |

### 1.5 Submit to Google Search Console
**Effort:** 30 minutes

1. Set up Google Search Console for waypointgy.com
2. Verify ownership via DNS or HTML meta tag
3. Submit sitemap.xml
4. Request indexing of key pages
5. Monitor crawl errors

---

## Priority 2: HIGH (Fix Within 1 Week)

### 2.1 Add Open Graph & Twitter Card Tags
**File:** Root layout + individual pages
**Effort:** 1-2 hours

Add to root layout as defaults:
```typescript
export const metadata: Metadata = {
  openGraph: {
    type: 'website',
    siteName: 'Waypoint',
    locale: 'en_US',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
  },
};
```

Create a default OG image (1200x630px) with Waypoint branding.

Each business/tourism/event detail page should override with specific OG data:
- `og:title` = Business/experience name
- `og:description` = Business/experience description
- `og:image` = Primary photo of the business/experience

### 2.2 Add JSON-LD Structured Data
**Effort:** 4-6 hours

#### Homepage - Organization + WebSite schema
```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Waypoint",
  "url": "https://waypointgy.com",
  "description": "Discover local businesses, experiences, stays, and events across Guyana",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://waypointgy.com/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
```

#### Business Detail Pages - LocalBusiness schema
Include: name, address, phone, email, rating, reviews, hours, category, images

#### Tourism Detail Pages - TouristAttraction schema
Include: name, description, price, duration, location, images

#### Event Detail Pages - Event schema
Include: name, date, location, description, organizer, price

#### Category/Listing Pages - ItemList schema
Include: list of items with position, name, URL

#### All Pages - BreadcrumbList schema
Include: Home > Section > Category > Item Name

### 2.3 Fix Duplicate H1 Tags
**File:** `app/businesses/category/[slug]/page.tsx`
**Effort:** 15 minutes

The category page renders "Restaurants & Dining" as H1 twice (likely mobile + desktop duplicates). Use CSS responsive classes instead of rendering two separate H1 elements.

### 2.4 Fix /search Page Error
**File:** `app/search/page.tsx`
**Effort:** 30 minutes

The search page shows "This page could not be found" to crawlers. Ensure the page renders meaningful content even without a search query (e.g., popular categories, recent listings).

---

## Priority 3: MEDIUM (Fix Within 1 Month)

### 3.1 Improve Image Alt Text
**Effort:** 2-3 hours

Audit all image components and ensure:
- Business card images use: `alt="{Business Name} - {Category} in {Region}"`
- Tourism images use: `alt="{Experience Name} in Guyana"`
- Category icons use: `alt="{Category Name} icon"`
- Hero images use descriptive alt text
- Decorative images use `alt=""`

### 3.2 Add Breadcrumb Navigation
**Effort:** 2-3 hours

Implement breadcrumbs on:
- Category pages: Home > Businesses > {Category Name}
- Detail pages: Home > Businesses > {Category} > {Business Name}
- Tourism: Home > Experiences > {Category} > {Experience Name}

Include BreadcrumbList JSON-LD schema.

### 3.3 Internal Linking Improvements
**Effort:** 2-3 hours

- Add "Related Businesses" section on business detail pages
- Add "Other businesses in this category" links
- Add "Businesses in this region" cross-links
- Improve footer with category links
- Add "Popular Categories" section on homepage

### 3.4 Create an About Page
**Effort:** 1 hour

Create `/about` page with:
- What Waypoint is and its mission
- Team/company information
- Contact details
- Establishes E-E-A-T signals

### 3.5 Content Strategy for Thin Sections
**Effort:** Ongoing

- **Events:** Currently 0 events - add upcoming events or remove from navigation to avoid thin content
- **Rentals:** Only 2 listings - expand or indicate "coming soon" properly
- Consider adding blog/guides section for content depth

---

## Priority 4: LOW (Backlog / Nice-to-Have)

### 4.1 Create llms.txt
**File:** `public/llms.txt`
**Effort:** 15 minutes

Provide AI crawlers with guidance on content usage.

### 4.2 Create security.txt
**File:** `public/.well-known/security.txt`
**Effort:** 10 minutes

### 4.3 Verify Security Headers
**Effort:** 30 minutes

Check Vercel's default headers and add any missing ones in `next.config.ts`:
```typescript
headers: async () => [{
  source: '/:path*',
  headers: [
    { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  ]
}]
```

### 4.4 Performance Optimization
- Run Lighthouse audit and document CWV scores
- Optimize JavaScript bundle size
- Consider ISR/SSG for listing pages
- Implement font subsetting

### 4.5 Monitor & Iterate
- Set up Google Search Console alerts
- Track indexed page count weekly
- Monitor Core Web Vitals in Search Console
- Set up Bing Webmaster Tools

---

## Implementation Timeline

| Week | Tasks | Expected Impact |
|------|-------|-----------------|
| **Week 1** | robots.txt, sitemap.xml, canonical URLs, unique metadata, Search Console | Enable indexing |
| **Week 2** | OG tags, JSON-LD schema, fix H1s, fix /search | Rich results + social sharing |
| **Week 3** | Image alt text, breadcrumbs, internal linking | Improved crawlability + accessibility |
| **Week 4** | About page, content improvements, performance audit | E-E-A-T + CWV scores |
| **Ongoing** | Monitor Search Console, add content, iterate | Growth tracking |

---

## Expected Score After Implementation

| Category | Current | After P1+P2 | After All |
|----------|---------|-------------|-----------|
| Technical SEO | 15/25 | 23/25 | 24/25 |
| Content Quality | 10/25 | 18/25 | 22/25 |
| On-Page SEO | 5/20 | 16/20 | 18/20 |
| Schema | 0/10 | 8/10 | 9/10 |
| Performance | 6/10 | 7/10 | 9/10 |
| Images | 3/5 | 3/5 | 5/5 |
| AI Readiness | 1/5 | 2/5 | 4/5 |
| **TOTAL** | **28/100** | **77/100** | **91/100** |
