'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { Calendar, UserCheck, ChevronRight, MapPin, Loader2, Users } from 'lucide-react';
import { getFallbackImage } from '@/lib/category-images';

interface OrganiserEvent {
  event_id: string;
  event_title: string;
  event_slug: string;
  event_image_url: string | null;
  event_start_date: string;
  event_end_date: string;
  event_location: string | null;
  event_is_featured: boolean;
  event_interest_count: number;
  organiser_name: string;
  organiser_slug: string | null;
  organiser_type: string;
  category_name: string | null;
  category_icon: string | null;
}

export function UpcomingFromOrganisers() {
  const [events, setEvents] = useState<OrganiserEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .rpc('get_followed_organiser_events', { p_user_id: user.id, p_limit: 10 });

      if (error) {
        console.error('Error fetching organiser events:', error);
        setIsLoading(false);
        return;
      }

      setEvents((data as OrganiserEvent[]) || []);
      setIsLoading(false);
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <section className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
        </div>
      </section>
    );
  }

  if (events.length === 0) return null;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Group events by organiser
  const grouped = events.reduce<Record<string, { name: string; slug: string | null; type: string; events: OrganiserEvent[] }>>((acc, event) => {
    const key = event.organiser_slug || event.organiser_name;
    if (!acc[key]) {
      acc[key] = {
        name: event.organiser_name,
        slug: event.organiser_slug,
        type: event.organiser_type,
        events: [],
      };
    }
    acc[key].events.push(event);
    return acc;
  }, {});

  return (
    <section className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
          <UserCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
        </div>
        <h2 className="text-section-title-lg font-bold text-gray-900">From Organisers You Follow</h2>
      </div>

      <div className="space-y-6">
        {Object.values(grouped).map((organiser) => (
          <div key={organiser.slug || organiser.name} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {/* Organiser Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{organiser.name}</h3>
                  <p className="text-sm text-violet-600">
                    {organiser.events.length} upcoming {organiser.events.length === 1 ? 'event' : 'events'}
                  </p>
                </div>
              </div>
              {organiser.slug && (
                <Link
                  href={`/businesses/${organiser.slug}`}
                  className="flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700"
                >
                  View profile
                  <ChevronRight className="w-4 h-4" />
                </Link>
              )}
            </div>

            {/* Events - Horizontal scroll on mobile */}
            <div className="p-4">
              {/* Mobile: Horizontal scroll */}
              <div className="sm:hidden -mx-4 px-4">
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
                  {organiser.events.map((event) => (
                    <Link
                      key={event.event_id}
                      href={`/events/${event.event_slug}`}
                      className="group flex-shrink-0 w-[clamp(200px,55vw,260px)] snap-start"
                    >
                      <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 mb-2">
                        <Image
                          src={event.event_image_url || getFallbackImage(event.category_name, 'event')}
                          alt={event.event_title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="260px"
                        />
                        {/* Date badge */}
                        <div className="absolute top-2 left-2 px-2.5 py-1 bg-white/90 backdrop-blur-sm text-xs font-bold rounded-lg text-gray-900 shadow-sm">
                          <Calendar className="w-3 h-3 inline mr-1 text-emerald-600" />
                          {formatDate(event.event_start_date)}
                        </div>
                        {event.event_is_featured && (
                          <div className="absolute top-2 right-2 px-2 py-0.5 bg-amber-400 text-amber-950 text-[10px] font-bold rounded-full uppercase">
                            Featured
                          </div>
                        )}
                      </div>
                      <h4 className="font-medium text-sm text-gray-900 group-hover:text-emerald-600 line-clamp-2">
                        {event.event_title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        {event.event_location && (
                          <div className="flex items-center gap-0.5 text-xs text-gray-500">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate">{event.event_location}</span>
                          </div>
                        )}
                        {event.event_interest_count > 0 && (
                          <div className="flex items-center gap-0.5 text-xs text-gray-500">
                            <Users className="w-3 h-3" />
                            <span>{event.event_interest_count}</span>
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
              {/* Desktop: Grid */}
              <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {organiser.events.map((event) => (
                  <Link
                    key={event.event_id}
                    href={`/events/${event.event_slug}`}
                    className="group block"
                  >
                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 mb-2">
                      <Image
                        src={event.event_image_url || getFallbackImage(event.category_name, 'event')}
                        alt={event.event_title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 1024px) 50vw, 33vw"
                      />
                      <div className="absolute top-2 left-2 px-2.5 py-1 bg-white/90 backdrop-blur-sm text-xs font-bold rounded-lg text-gray-900 shadow-sm">
                        <Calendar className="w-3 h-3 inline mr-1 text-emerald-600" />
                        {formatDate(event.event_start_date)}
                      </div>
                      {event.event_is_featured && (
                        <div className="absolute top-2 right-2 px-2 py-0.5 bg-amber-400 text-amber-950 text-[10px] font-bold rounded-full uppercase">
                          Featured
                        </div>
                      )}
                    </div>
                    <h4 className="font-medium text-sm text-gray-900 group-hover:text-emerald-600 line-clamp-2">
                      {event.event_title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      {event.event_location && (
                        <div className="flex items-center gap-0.5 text-xs text-gray-500">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate">{event.event_location}</span>
                        </div>
                      )}
                      {event.event_interest_count > 0 && (
                        <div className="flex items-center gap-0.5 text-xs text-gray-500">
                          <Users className="w-3 h-3" />
                          <span>{event.event_interest_count}</span>
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
