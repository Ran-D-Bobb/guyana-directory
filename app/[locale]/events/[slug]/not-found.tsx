import Link from 'next/link'
import { Calendar, ArrowLeft } from 'lucide-react'

export default function EventNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-pink-50/20 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 mb-6">
          <Calendar className="w-10 h-10 text-purple-600" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Event Not Found
        </h1>

        <p className="text-gray-600 mb-8">
          This event may have been removed, ended, or the link might be incorrect.
          Check out our other upcoming events!
        </p>

        <Link
          href="/events"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-purple-500/30 transition-all hover:scale-105"
        >
          <ArrowLeft className="w-5 h-5" />
          Browse All Events
        </Link>
      </div>
    </div>
  )
}
