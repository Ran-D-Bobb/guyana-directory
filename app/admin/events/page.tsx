import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  Calendar,
  Eye,
  TrendingUp,
  Sparkles,
  Building2,
  ExternalLink,
  MapPin,
  CalendarDays
} from 'lucide-react'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { AdminStatCard } from '@/components/admin/AdminStatCard'
import { EventActions } from '@/components/admin/AdminActionButtons'
import { cn } from '@/lib/utils'

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

function getEventStatus(startDate: string, endDate: string) {
  const now = new Date()
  const start = new Date(startDate)
  const end = new Date(endDate)

  if (now < start) return { label: 'Upcoming', variant: 'purple' as const }
  if (now > end) return { label: 'Past', variant: 'slate' as const }
  return { label: 'Ongoing', variant: 'emerald' as const }
}

export default async function AdminEventsPage() {
  const supabase = await createClient()

  // Fetch all general events
  const { data: generalEvents } = await supabase
    .from('events')
    .select(`
      *,
      event_categories:category_id (name),
      businesses!business_id (name, slug)
    `)
    .order('created_at', { ascending: false })

  // Fetch all business events
  const { data: businessEvents } = await supabase
    .from('business_events')
    .select(`
      *,
      business_event_types!event_type_id (name),
      businesses!business_id (name, slug)
    `)
    .order('created_at', { ascending: false })

  // Calculate stats
  const now = new Date().toISOString()
  const upcomingGeneralEvents = generalEvents?.filter(e => e.start_date > now).length || 0
  const upcomingBusinessEvents = businessEvents?.filter(e => e.start_date > now).length || 0
  const totalViews = (generalEvents?.reduce((sum, e) => sum + (e.view_count || 0), 0) || 0)
  const totalInterests = (generalEvents?.reduce((sum, e) => sum + (e.interest_count || 0), 0) || 0)

  const statusVariants = {
    purple: 'bg-purple-100 text-purple-700',
    emerald: 'bg-emerald-100 text-emerald-700',
    slate: 'bg-slate-100 text-slate-600',
  }

  return (
    <div className="min-h-screen">
      <AdminHeader
        title="Events"
        subtitle="Manage community events and business promotions"
      />

      <div className="px-4 lg:px-8 py-6 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <AdminStatCard
            label="General Events"
            value={generalEvents?.length || 0}
            icon="Calendar"
            color="purple"
            size="sm"
          />
          <AdminStatCard
            label="Business Events"
            value={businessEvents?.length || 0}
            icon="Building2"
            color="blue"
            size="sm"
          />
          <AdminStatCard
            label="Upcoming"
            value={upcomingGeneralEvents + upcomingBusinessEvents}
            icon="CalendarClock"
            color="emerald"
            size="sm"
          />
          <AdminStatCard
            label="Total Views"
            value={totalViews}
            icon="Eye"
            color="cyan"
            size="sm"
          />
          <AdminStatCard
            label="Interested"
            value={totalInterests}
            icon="TrendingUp"
            color="pink"
            size="sm"
          />
        </div>

        {/* General Events Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Calendar className="text-purple-600" size={20} />
              General Events
              <span className="text-sm font-normal text-slate-500">({generalEvents?.length || 0})</span>
            </h2>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {generalEvents && generalEvents.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {generalEvents.map((event) => {
                  const status = getEventStatus(event.start_date, event.end_date)
                  return (
                    <div
                      key={event.id}
                      className="p-4 hover:bg-slate-50/50 transition-colors"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                        {/* Date Badge */}
                        <div className="flex-shrink-0 w-16 h-16 bg-purple-50 rounded-xl flex flex-col items-center justify-center border border-purple-100">
                          <span className="text-xs font-medium text-purple-600 uppercase">
                            {new Date(event.start_date).toLocaleDateString('en-US', { month: 'short' })}
                          </span>
                          <span className="text-2xl font-bold text-purple-700">
                            {new Date(event.start_date).getDate()}
                          </span>
                        </div>

                        {/* Main Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-start gap-2 mb-2">
                            <Link
                              href={`/events/${event.slug}`}
                              target="_blank"
                              className="group text-lg font-semibold text-slate-900 hover:text-purple-600 transition-colors inline-flex items-center gap-1.5"
                            >
                              {event.title}
                              <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Link>

                            {/* Badges */}
                            <div className="flex flex-wrap gap-1.5">
                              <span className={cn(
                                'inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full',
                                statusVariants[status.variant]
                              )}>
                                {status.label}
                              </span>
                              {event.is_featured && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                                  <Sparkles size={12} />
                                  Featured
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Meta Info */}
                          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 mb-2">
                            {event.event_categories && (
                              <span className="inline-flex items-center gap-1.5">
                                <Calendar size={14} className="text-slate-400" />
                                {event.event_categories.name}
                              </span>
                            )}
                            <span className="inline-flex items-center gap-1.5">
                              <CalendarDays size={14} className="text-slate-400" />
                              {formatDate(event.start_date)} - {formatDate(event.end_date)}
                            </span>
                            {event.location && (
                              <span className="inline-flex items-center gap-1.5">
                                <MapPin size={14} className="text-slate-400" />
                                {event.location}
                              </span>
                            )}
                          </div>

                          {/* Stats Row */}
                          <div className="flex flex-wrap items-center gap-4 text-sm">
                            <span className="inline-flex items-center gap-1.5 text-slate-500">
                              <Eye size={14} className="text-slate-400" />
                              <span className="font-medium text-slate-700">{event.view_count || 0}</span>
                              views
                            </span>
                            <span className="inline-flex items-center gap-1.5 text-slate-500">
                              <TrendingUp size={14} className="text-slate-400" />
                              <span className="font-medium text-slate-700">{event.interest_count || 0}</span>
                              interested
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <EventActions
                            eventId={event.id}
                            eventType="general"
                            isFeatured={event.is_featured ?? false}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="p-12 text-center">
                <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-slate-900 mb-1">No general events</h3>
                <p className="text-slate-500">Events will appear here once created</p>
              </div>
            )}
          </div>
        </section>

        {/* Business Events Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Building2 className="text-blue-600" size={20} />
              Business Events
              <span className="text-sm font-normal text-slate-500">({businessEvents?.length || 0})</span>
            </h2>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {businessEvents && businessEvents.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {businessEvents.map((event) => {
                  const status = getEventStatus(event.start_date, event.end_date)
                  return (
                    <div
                      key={event.id}
                      className="p-4 hover:bg-slate-50/50 transition-colors"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                        {/* Date Badge */}
                        <div className="flex-shrink-0 w-16 h-16 bg-blue-50 rounded-xl flex flex-col items-center justify-center border border-blue-100">
                          <span className="text-xs font-medium text-blue-600 uppercase">
                            {new Date(event.start_date).toLocaleDateString('en-US', { month: 'short' })}
                          </span>
                          <span className="text-2xl font-bold text-blue-700">
                            {new Date(event.start_date).getDate()}
                          </span>
                        </div>

                        {/* Main Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-start gap-2 mb-2">
                            <span className="text-lg font-semibold text-slate-900">
                              {event.title}
                            </span>

                            {/* Badges */}
                            <div className="flex flex-wrap gap-1.5">
                              <span className={cn(
                                'inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full',
                                statusVariants[status.variant]
                              )}>
                                {status.label}
                              </span>
                            </div>
                          </div>

                          {/* Meta Info */}
                          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 mb-2">
                            {event.business_event_types && (
                              <span className="inline-flex items-center gap-1.5">
                                <Calendar size={14} className="text-slate-400" />
                                {event.business_event_types.name}
                              </span>
                            )}
                            {event.businesses && (
                              <Link
                                href={`/businesses/${event.businesses.slug}`}
                                target="_blank"
                                className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700"
                              >
                                <Building2 size={14} />
                                {event.businesses.name}
                              </Link>
                            )}
                            <span className="inline-flex items-center gap-1.5">
                              <CalendarDays size={14} className="text-slate-400" />
                              {formatDate(event.start_date)} - {formatDate(event.end_date)}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <EventActions
                            eventId={event.id}
                            eventType="business"
                            isFeatured={false}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="p-12 text-center">
                <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-slate-900 mb-1">No business events</h3>
                <p className="text-slate-500">Business events and promotions will appear here</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
