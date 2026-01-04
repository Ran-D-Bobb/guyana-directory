import Link from 'next/link'
import { Megaphone, TrendingUp, Users, Zap } from 'lucide-react'

export function AdvertiseHereCTA() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-pink-600 to-rose-600 text-white py-20">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-72 h-72 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl mb-6 shadow-2xl">
            <Megaphone className="h-10 w-10" />
          </div>

          {/* Heading */}
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">
            Get Your Business Featured Here
          </h2>

          <p className="text-xl md:text-2xl mb-10 text-purple-100 leading-relaxed">
            Reach thousands of potential customers across Guyana. Premium placement on our homepage puts your business in front of engaged users.
          </p>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all">
              <TrendingUp className="h-8 w-8 mb-3 mx-auto" />
              <h3 className="font-bold text-lg mb-2">Massive Visibility</h3>
              <p className="text-sm text-purple-100">Hero carousel placement with 10,000+ monthly views</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all">
              <Users className="h-8 w-8 mb-3 mx-auto" />
              <h3 className="font-bold text-lg mb-2">Targeted Audience</h3>
              <p className="text-sm text-purple-100">Reach users actively searching for local services</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all">
              <Zap className="h-8 w-8 mb-3 mx-auto" />
              <h3 className="font-bold text-lg mb-2">Instant Results</h3>
              <p className="text-sm text-purple-100">Phone calls, emails, and walk-ins same day</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/dashboard/my-business"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-purple-600 rounded-xl shadow-2xl hover:bg-gray-100 transition-all transform hover:scale-105 text-lg font-bold"
            >
              Feature My Business
            </Link>

            <a
              href="mailto:sales@waypointguyana.com?subject=Advertising%20Inquiry"
              className="inline-flex items-center gap-2 px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl hover:bg-white/10 transition-all text-lg font-bold"
            >
              Contact Sales
            </a>
          </div>

          {/* Pricing Hint */}
          <p className="text-sm text-purple-200 mt-6">
            Starting at GYD 5,000/month • Premium placements available
          </p>
        </div>
      </div>
    </section>
  )
}
