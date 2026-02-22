/** Unified event type for the all_events database view */
export interface UnifiedEvent {
  id: string
  source_type: 'community' | 'business'
  business_id: string | null
  title: string
  slug: string
  description: string | null
  start_date: string
  end_date: string
  image_url: string | null
  location: string | null
  event_type_name: string | null
  category_name: string | null
  category_icon: string | null
  category_id: string | null
  region_id: string | null
  is_featured: boolean
  view_count: number
  interest_count: number
  user_id: string | null
  created_at: string
  business_name: string | null
  business_slug: string | null
  event_type_icon: string | null
}
