import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { BadgeCheck, MapPin, Building2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About Waypoint',
  description: 'Waypoint is Guyana\'s local business directory. Find restaurants, shops, tourism experiences, events, and rentals across the Land of Many Waters.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About Waypoint | Guyana\'s Discovery Platform',
    description: 'Waypoint is Guyana\'s local business directory. Find restaurants, shops, tourism experiences, events, and rentals.',
    url: 'https://waypointgy.com/about',
  },
}

export default async function AboutPage() {
  const t = await getTranslations('about')
  const supabase = await createClient()

  // Fetch live stats for credibility
  const [
    { count: businessCount },
    { count: categoryCount },
    { count: reviewCount },
  ] = await Promise.all([
    supabase.from('businesses').select('id', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('categories').select('id', { count: 'exact', head: true }),
    supabase.from('reviews').select('id', { count: 'exact', head: true }),
  ])

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About Waypoint',
    url: 'https://waypointgy.com/about',
    mainEntity: {
      '@type': 'Organization',
      '@id': 'https://waypointgy.com/#organization',
      name: 'Waypoint',
      url: 'https://waypointgy.com',
      description: 'Guyana\'s local business directory connecting locals and visitors with businesses, tourism experiences, events, and rentals.',
      logo: {
        '@type': 'ImageObject',
        url: 'https://waypointgy.com/icons/icon-512x512.png',
        width: 512,
        height: 512,
      },
      areaServed: {
        '@type': 'Country',
        name: 'Guyana',
        sameAs: 'https://en.wikipedia.org/wiki/Guyana',
      },
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Georgetown',
        addressCountry: 'GY',
      },
    },
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://waypointgy.com' },
      { '@type': 'ListItem', position: 2, name: 'About' },
    ],
  }

  const stats = [
    { label: t('statBusinesses'), value: businessCount || 0, icon: Building2 },
    { label: t('statCategories'), value: categoryCount || 0, icon: MapPin },
    { label: t('statReviews'), value: reviewCount || 0, icon: BadgeCheck },
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, '\\u003c') }}
      />

      <div className="min-h-screen bg-gray-50 dark:bg-[hsl(var(--background))] pb-24 lg:pb-12">
        {/* Hero */}
        <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white">
          <div className="max-w-4xl mx-auto px-4 py-16 sm:py-20 text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
              {t('heading')}
            </h1>
            <p className="text-lg sm:text-xl text-emerald-100 max-w-2xl mx-auto leading-relaxed">
              {t('subtitle')}
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 -mt-8">
          {/* Stats bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-12">
            {stats.map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="bg-white dark:bg-white/5 rounded-2xl p-4 sm:p-5 text-center shadow-sm border border-gray-100 dark:border-white/10"
              >
                <Icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  {value.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">{label}</div>
              </div>
            ))}
          </div>

          {/* Content sections */}
          <div className="space-y-10">
            <section className="bg-white dark:bg-white/5 rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-white/10">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('missionHeading')}</h2>
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <p>
                  We built Waypoint because finding a good restaurant, a reliable mechanic, or a
                  solid tour guide in Guyana shouldn&apos;t depend on knowing the right people.
                  Whether you live here or you&apos;re visiting for the first time, you deserve
                  a simple way to find trustworthy businesses and experiences.
                </p>
                <p>
                  Every listing on Waypoint includes the stuff that actually matters: phone numbers,
                  business hours, location, photos, and honest reviews from real customers. No
                  guesswork, just the info you need to make a decision.
                </p>
              </div>
            </section>

            <section className="bg-white dark:bg-white/5 rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-white/10">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('whatWeCoverHeading')}</h2>
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <p>
                  We cover businesses and experiences from Georgetown and the coast all the way
                  to the interior and the Rupununi savannah. You&apos;ll find:
                </p>
                <ul>
                  <li><strong>Local Businesses</strong> like restaurants, shops, pharmacies, mechanics, salons, and professional services</li>
                  <li><strong>Tourism Experiences</strong> including guided tours, nature excursions, cultural experiences, and adventure activities</li>
                  <li><strong>Events</strong> like concerts, festivals, community gatherings, and cultural celebrations</li>
                  <li><strong>Rentals &amp; Stays</strong> including apartments, guesthouses, and accommodation for visitors and locals</li>
                </ul>
                <p>
                  Everything is categorized and searchable. Filter by location, rating, category,
                  or special features to find exactly what you&apos;re looking for.
                </p>
              </div>
            </section>

            <section className="bg-white dark:bg-white/5 rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-white/10">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('verificationHeading')}</h2>
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <p>
                  Businesses on Waypoint can earn a verified badge (<BadgeCheck className="inline w-4 h-4 text-emerald-500" />).
                  This means our team has confirmed their contact info, operating hours, and
                  physical location. It&apos;s a quick way to tell established businesses apart
                  from newer or unconfirmed listings.
                </p>
                <p>
                  If you own a business, you can claim your listing through our dashboard. From
                  there you can update your info, add photos, and respond to reviews to keep
                  your profile accurate and looking good.
                </p>
              </div>
            </section>
          </div>

          {/* CTA */}
          <div className="text-center mt-12 mb-8">
            <Link
              href="/businesses"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-colors min-h-[44px]"
            >
              {t('browseBusinesses')}
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
