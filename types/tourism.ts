import { Database } from './supabase'

export type TourismExperience = Database['public']['Tables']['tourism_experiences']['Row'] & {
  tourism_categories: { name: string; icon: string } | null
  regions: { name: string } | null
  tourism_photos: Array<{ image_url: string; is_primary: boolean | null; display_order?: number | null }> | null
}
