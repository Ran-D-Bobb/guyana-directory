import Link from 'next/link'
import { Plane, ArrowLeft } from 'lucide-react'

export default function TourismNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-teal-50/20 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 mb-6">
          <Plane className="w-10 h-10 text-emerald-600" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Experience Not Found
        </h1>

        <p className="text-gray-600 mb-8">
          This tourism experience may be pending approval, no longer available, or the link might be incorrect.
          Discover other amazing experiences!
        </p>

        <Link
          href="/tourism"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-emerald-500/30 transition-all hover:scale-105"
        >
          <ArrowLeft className="w-5 h-5" />
          Browse All Experiences
        </Link>
      </div>
    </div>
  )
}
