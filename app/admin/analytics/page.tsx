import { AdminHeader } from '@/components/admin/AdminHeader'
import { BarChart3 } from 'lucide-react'

export default function AdminAnalyticsPage() {
  return (
    <div className="min-h-screen">
      <AdminHeader
        title="Analytics"
        subtitle="View platform metrics and insights"
      />

      <div className="px-4 lg:px-8 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-purple-100 flex items-center justify-center">
            <BarChart3 className="w-8 h-8 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Analytics Coming Soon
          </h2>
          <p className="text-gray-600">
            Platform analytics and insights will be available here. Track views, engagement, and growth metrics across all listings.
          </p>
        </div>
      </div>
    </div>
  )
}
