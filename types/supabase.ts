export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      admin_emails: {
        Row: {
          created_at: string | null
          email: string
          id: string
          notes: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          notes?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          notes?: string | null
        }
        Relationships: []
      }
      business_event_types: {
        Row: {
          created_at: string | null
          icon: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          icon?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      business_events: {
        Row: {
          business_id: string
          created_at: string | null
          description: string | null
          end_date: string
          event_type_id: string | null
          id: string
          is_active: boolean | null
          slug: string
          start_date: string
          title: string
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          business_id: string
          created_at?: string | null
          description?: string | null
          end_date: string
          event_type_id?: string | null
          id?: string
          is_active?: boolean | null
          slug: string
          start_date: string
          title: string
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          business_id?: string
          created_at?: string | null
          description?: string | null
          end_date?: string
          event_type_id?: string | null
          id?: string
          is_active?: boolean | null
          slug?: string
          start_date?: string
          title?: string
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "business_events_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_events_event_type_id_fkey"
            columns: ["event_type_id"]
            isOneToOne: false
            referencedRelation: "business_event_types"
            referencedColumns: ["id"]
          },
        ]
      }
      business_photos: {
        Row: {
          business_id: string
          created_at: string | null
          display_order: number | null
          id: string
          image_url: string
          is_primary: boolean | null
        }
        Insert: {
          business_id: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_url: string
          is_primary?: boolean | null
        }
        Update: {
          business_id?: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_url?: string
          is_primary?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "business_photos_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          address: string | null
          category_id: string | null
          created_at: string | null
          description: string | null
          email: string | null
          formatted_address: string | null
          hours: Json | null
          id: string
          is_featured: boolean | null
          is_verified: boolean | null
          latitude: number | null
          longitude: number | null
          name: string
          owner_id: string | null
          phone: string | null
          rating: number | null
          region_id: string | null
          review_count: number | null
          slug: string
          updated_at: string | null
          view_count: number | null
          website: string | null
          whatsapp_clicks: number | null
          whatsapp_number: string
        }
        Insert: {
          address?: string | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          formatted_address?: string | null
          hours?: Json | null
          id?: string
          is_featured?: boolean | null
          is_verified?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name: string
          owner_id?: string | null
          phone?: string | null
          rating?: number | null
          region_id?: string | null
          review_count?: number | null
          slug: string
          updated_at?: string | null
          view_count?: number | null
          website?: string | null
          whatsapp_clicks?: number | null
          whatsapp_number: string
        }
        Update: {
          address?: string | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          formatted_address?: string | null
          hours?: Json | null
          id?: string
          is_featured?: boolean | null
          is_verified?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          owner_id?: string | null
          phone?: string | null
          rating?: number | null
          region_id?: string | null
          review_count?: number | null
          slug?: string
          updated_at?: string | null
          view_count?: number | null
          website?: string | null
          whatsapp_clicks?: number | null
          whatsapp_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "businesses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "businesses_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "businesses_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      event_categories: {
        Row: {
          created_at: string | null
          icon: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          icon?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      event_interests: {
        Row: {
          created_at: string | null
          event_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          event_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_interests_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          business_id: string | null
          category_id: string | null
          created_at: string | null
          description: string | null
          email: string | null
          end_date: string
          event_type: string | null
          id: string
          image_url: string | null
          interest_count: number | null
          is_featured: boolean | null
          location: string | null
          region_id: string | null
          slug: string
          start_date: string
          title: string
          updated_at: string | null
          user_id: string | null
          view_count: number | null
          whatsapp_clicks: number | null
          whatsapp_number: string | null
        }
        Insert: {
          business_id?: string | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          end_date: string
          event_type?: string | null
          id?: string
          image_url?: string | null
          interest_count?: number | null
          is_featured?: boolean | null
          location?: string | null
          region_id?: string | null
          slug: string
          start_date: string
          title: string
          updated_at?: string | null
          user_id?: string | null
          view_count?: number | null
          whatsapp_clicks?: number | null
          whatsapp_number?: string | null
        }
        Update: {
          business_id?: string | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          end_date?: string
          event_type?: string | null
          id?: string
          image_url?: string | null
          interest_count?: number | null
          is_featured?: boolean | null
          location?: string | null
          region_id?: string | null
          slug?: string
          start_date?: string
          title?: string
          updated_at?: string | null
          user_id?: string | null
          view_count?: number | null
          whatsapp_clicks?: number | null
          whatsapp_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "event_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          name: string | null
          phone: string | null
          photo: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id: string
          name?: string | null
          phone?: string | null
          photo?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          photo?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      regions: {
        Row: {
          created_at: string | null
          id: string
          name: string
          slug: string
          type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          slug: string
          type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          slug?: string
          type?: string
        }
        Relationships: []
      }
      rental_categories: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          icon: string
          id: string
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon: string
          id?: string
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string
          id?: string
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      rental_flags: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          reason: string
          rental_id: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          reason: string
          rental_id: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          reason?: string
          rental_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rental_flags_rental_id_fkey"
            columns: ["rental_id"]
            isOneToOne: false
            referencedRelation: "rentals"
            referencedColumns: ["id"]
          },
        ]
      }
      rental_inquiry_clicks: {
        Row: {
          clicked_at: string | null
          device_type: string | null
          id: string
          rental_id: string
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          clicked_at?: string | null
          device_type?: string | null
          id?: string
          rental_id: string
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          clicked_at?: string | null
          device_type?: string | null
          id?: string
          rental_id?: string
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rental_inquiry_clicks_rental_id_fkey"
            columns: ["rental_id"]
            isOneToOne: false
            referencedRelation: "rentals"
            referencedColumns: ["id"]
          },
        ]
      }
      rental_photos: {
        Row: {
          caption: string | null
          created_at: string | null
          display_order: number | null
          id: string
          image_url: string
          is_primary: boolean | null
          rental_id: string
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_url: string
          is_primary?: boolean | null
          rental_id: string
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_url?: string
          is_primary?: boolean | null
          rental_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rental_photos_rental_id_fkey"
            columns: ["rental_id"]
            isOneToOne: false
            referencedRelation: "rentals"
            referencedColumns: ["id"]
          },
        ]
      }
      rental_review_helpful_votes: {
        Row: {
          created_at: string | null
          id: string
          is_helpful: boolean
          review_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_helpful: boolean
          review_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_helpful?: boolean
          review_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rental_review_helpful_votes_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "rental_reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      rental_review_photos: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: string
          image_url: string
          review_id: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_url: string
          review_id: string
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_url?: string
          review_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rental_review_photos_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "rental_reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      rental_review_responses: {
        Row: {
          created_at: string | null
          id: string
          rental_id: string
          response: string
          review_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          rental_id: string
          response: string
          review_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          rental_id?: string
          response?: string
          review_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rental_review_responses_rental_id_fkey"
            columns: ["rental_id"]
            isOneToOne: false
            referencedRelation: "rentals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rental_review_responses_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: true
            referencedRelation: "rental_reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      rental_reviews: {
        Row: {
          comment: string
          created_at: string | null
          helpful_count: number | null
          id: string
          not_helpful_count: number | null
          rating_cleanliness: number
          rating_communication: number
          rating_location: number
          rating_overall: number
          rating_value: number
          rental_id: string
          stay_from: string | null
          stay_to: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          comment: string
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          not_helpful_count?: number | null
          rating_cleanliness: number
          rating_communication: number
          rating_location: number
          rating_overall: number
          rating_value: number
          rental_id: string
          stay_from?: string | null
          stay_to?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          comment?: string
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          not_helpful_count?: number | null
          rating_cleanliness?: number
          rating_communication?: number
          rating_location?: number
          rating_overall?: number
          rating_value?: number
          rental_id?: string
          stay_from?: string | null
          stay_to?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rental_reviews_rental_id_fkey"
            columns: ["rental_id"]
            isOneToOne: false
            referencedRelation: "rentals"
            referencedColumns: ["id"]
          },
        ]
      }
      rental_saved: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          rental_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          rental_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          rental_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rental_saved_rental_id_fkey"
            columns: ["rental_id"]
            isOneToOne: false
            referencedRelation: "rentals"
            referencedColumns: ["id"]
          },
        ]
      }
      rentals: {
        Row: {
          address: string | null
          amenities: Json | null
          bathrooms: number | null
          bedrooms: number | null
          category_id: string
          created_at: string | null
          description: string
          email: string | null
          flag_count: number | null
          flag_reasons: Json | null
          house_rules: Json | null
          id: string
          inquiry_count: number | null
          is_approved: boolean | null
          is_best_value: boolean | null
          is_featured: boolean | null
          is_flagged: boolean | null
          landlord_id: string
          location_details: string | null
          max_guests: number | null
          name: string
          phone: string | null
          price_per_month: number
          price_per_night: number | null
          price_per_week: number | null
          property_type: string
          rating: number | null
          rating_cleanliness: number | null
          rating_communication: number | null
          rating_location: number | null
          rating_value: number | null
          region_id: string | null
          review_count: number | null
          save_count: number | null
          security_deposit: number | null
          slug: string
          square_feet: number | null
          updated_at: string | null
          utilities_included: Json | null
          view_count: number | null
          whatsapp_number: string
        }
        Insert: {
          address?: string | null
          amenities?: Json | null
          bathrooms?: number | null
          bedrooms?: number | null
          category_id: string
          created_at?: string | null
          description: string
          email?: string | null
          flag_count?: number | null
          flag_reasons?: Json | null
          house_rules?: Json | null
          id?: string
          inquiry_count?: number | null
          is_approved?: boolean | null
          is_best_value?: boolean | null
          is_featured?: boolean | null
          is_flagged?: boolean | null
          landlord_id: string
          location_details?: string | null
          max_guests?: number | null
          name: string
          phone?: string | null
          price_per_month: number
          price_per_night?: number | null
          price_per_week?: number | null
          property_type: string
          rating?: number | null
          rating_cleanliness?: number | null
          rating_communication?: number | null
          rating_location?: number | null
          rating_value?: number | null
          region_id?: string | null
          review_count?: number | null
          save_count?: number | null
          security_deposit?: number | null
          slug: string
          square_feet?: number | null
          updated_at?: string | null
          utilities_included?: Json | null
          view_count?: number | null
          whatsapp_number: string
        }
        Update: {
          address?: string | null
          amenities?: Json | null
          bathrooms?: number | null
          bedrooms?: number | null
          category_id?: string
          created_at?: string | null
          description?: string
          email?: string | null
          flag_count?: number | null
          flag_reasons?: Json | null
          house_rules?: Json | null
          id?: string
          inquiry_count?: number | null
          is_approved?: boolean | null
          is_best_value?: boolean | null
          is_featured?: boolean | null
          is_flagged?: boolean | null
          landlord_id?: string
          location_details?: string | null
          max_guests?: number | null
          name?: string
          phone?: string | null
          price_per_month?: number
          price_per_night?: number | null
          price_per_week?: number | null
          property_type?: string
          rating?: number | null
          rating_cleanliness?: number | null
          rating_communication?: number | null
          rating_location?: number | null
          rating_value?: number | null
          region_id?: string | null
          review_count?: number | null
          save_count?: number | null
          security_deposit?: number | null
          slug?: string
          square_feet?: number | null
          updated_at?: string | null
          utilities_included?: Json | null
          view_count?: number | null
          whatsapp_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "rentals_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "rental_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rentals_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      review_helpful_votes: {
        Row: {
          created_at: string | null
          id: string
          is_helpful: boolean
          review_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_helpful: boolean
          review_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_helpful?: boolean
          review_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_helpful_votes_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_helpful_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      review_responses: {
        Row: {
          business_id: string
          created_at: string | null
          id: string
          response: string
          review_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          business_id: string
          created_at?: string | null
          id?: string
          response: string
          review_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          business_id?: string
          created_at?: string | null
          id?: string
          response?: string
          review_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_responses_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_responses_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: true
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_responses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          business_id: string
          comment: string | null
          created_at: string | null
          helpful_count: number | null
          id: string
          not_helpful_count: number | null
          rating: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          business_id: string
          comment?: string | null
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          not_helpful_count?: number | null
          rating: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          business_id?: string
          comment?: string | null
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          not_helpful_count?: number | null
          rating?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tourism_categories: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          icon: string
          id: string
          is_active: boolean | null
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon: string
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
        }
        Relationships: []
      }
      tourism_experiences: {
        Row: {
          accessibility_info: string | null
          advance_booking_days: number | null
          age_requirement: string | null
          available_months: string[] | null
          best_season: string | null
          booking_inquiry_count: number | null
          booking_required: boolean | null
          coordinates: unknown
          created_at: string | null
          description: string
          difficulty_level: string | null
          duration: string | null
          email: string | null
          excludes: string | null
          experience_type: string | null
          group_size_max: number | null
          group_size_min: number | null
          id: string
          includes: string | null
          is_approved: boolean | null
          is_featured: boolean | null
          is_tourism_authority_approved: boolean | null
          is_verified: boolean | null
          languages: string[] | null
          location_details: string | null
          meeting_point: string | null
          name: string
          operator_id: string | null
          operator_license: string | null
          operator_name: string | null
          phone: string | null
          price_currency: string | null
          price_from: number | null
          price_notes: string | null
          rating: number | null
          region_id: string | null
          review_count: number | null
          safety_requirements: string | null
          slug: string
          tags: string[] | null
          tourism_category_id: string | null
          updated_at: string | null
          user_preference_data: Json | null
          view_count: number | null
          website: string | null
          what_to_bring: string[] | null
          whatsapp_clicks: number | null
          whatsapp_number: string
        }
        Insert: {
          accessibility_info?: string | null
          advance_booking_days?: number | null
          age_requirement?: string | null
          available_months?: string[] | null
          best_season?: string | null
          booking_inquiry_count?: number | null
          booking_required?: boolean | null
          coordinates?: unknown
          created_at?: string | null
          description: string
          difficulty_level?: string | null
          duration?: string | null
          email?: string | null
          excludes?: string | null
          experience_type?: string | null
          group_size_max?: number | null
          group_size_min?: number | null
          id?: string
          includes?: string | null
          is_approved?: boolean | null
          is_featured?: boolean | null
          is_tourism_authority_approved?: boolean | null
          is_verified?: boolean | null
          languages?: string[] | null
          location_details?: string | null
          meeting_point?: string | null
          name: string
          operator_id?: string | null
          operator_license?: string | null
          operator_name?: string | null
          phone?: string | null
          price_currency?: string | null
          price_from?: number | null
          price_notes?: string | null
          rating?: number | null
          region_id?: string | null
          review_count?: number | null
          safety_requirements?: string | null
          slug: string
          tags?: string[] | null
          tourism_category_id?: string | null
          updated_at?: string | null
          user_preference_data?: Json | null
          view_count?: number | null
          website?: string | null
          what_to_bring?: string[] | null
          whatsapp_clicks?: number | null
          whatsapp_number: string
        }
        Update: {
          accessibility_info?: string | null
          advance_booking_days?: number | null
          age_requirement?: string | null
          available_months?: string[] | null
          best_season?: string | null
          booking_inquiry_count?: number | null
          booking_required?: boolean | null
          coordinates?: unknown
          created_at?: string | null
          description?: string
          difficulty_level?: string | null
          duration?: string | null
          email?: string | null
          excludes?: string | null
          experience_type?: string | null
          group_size_max?: number | null
          group_size_min?: number | null
          id?: string
          includes?: string | null
          is_approved?: boolean | null
          is_featured?: boolean | null
          is_tourism_authority_approved?: boolean | null
          is_verified?: boolean | null
          languages?: string[] | null
          location_details?: string | null
          meeting_point?: string | null
          name?: string
          operator_id?: string | null
          operator_license?: string | null
          operator_name?: string | null
          phone?: string | null
          price_currency?: string | null
          price_from?: number | null
          price_notes?: string | null
          rating?: number | null
          region_id?: string | null
          review_count?: number | null
          safety_requirements?: string | null
          slug?: string
          tags?: string[] | null
          tourism_category_id?: string | null
          updated_at?: string | null
          user_preference_data?: Json | null
          view_count?: number | null
          website?: string | null
          what_to_bring?: string[] | null
          whatsapp_clicks?: number | null
          whatsapp_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "tourism_experiences_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tourism_experiences_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tourism_experiences_tourism_category_id_fkey"
            columns: ["tourism_category_id"]
            isOneToOne: false
            referencedRelation: "tourism_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      tourism_inquiry_clicks: {
        Row: {
          clicked_at: string | null
          device_type: string | null
          experience_id: string
          id: string
          location_source: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
          user_preferences: Json | null
        }
        Insert: {
          clicked_at?: string | null
          device_type?: string | null
          experience_id: string
          id?: string
          location_source?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
          user_preferences?: Json | null
        }
        Update: {
          clicked_at?: string | null
          device_type?: string | null
          experience_id?: string
          id?: string
          location_source?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
          user_preferences?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "tourism_inquiry_clicks_experience_id_fkey"
            columns: ["experience_id"]
            isOneToOne: false
            referencedRelation: "tourism_experiences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tourism_inquiry_clicks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tourism_photos: {
        Row: {
          caption: string | null
          created_at: string | null
          display_order: number | null
          experience_id: string
          id: string
          image_url: string
          is_primary: boolean | null
          photo_type: string | null
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          display_order?: number | null
          experience_id: string
          id?: string
          image_url: string
          is_primary?: boolean | null
          photo_type?: string | null
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          display_order?: number | null
          experience_id?: string
          id?: string
          image_url?: string
          is_primary?: boolean | null
          photo_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tourism_photos_experience_id_fkey"
            columns: ["experience_id"]
            isOneToOne: false
            referencedRelation: "tourism_experiences"
            referencedColumns: ["id"]
          },
        ]
      }
      tourism_reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          experience_date: string | null
          experience_id: string
          guide_rating: number | null
          id: string
          is_verified_booking: boolean | null
          overall_rating: number
          safety_rating: number | null
          title: string | null
          trip_type: string | null
          updated_at: string | null
          user_id: string
          value_rating: number | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          experience_date?: string | null
          experience_id: string
          guide_rating?: number | null
          id?: string
          is_verified_booking?: boolean | null
          overall_rating: number
          safety_rating?: number | null
          title?: string | null
          trip_type?: string | null
          updated_at?: string | null
          user_id: string
          value_rating?: number | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          experience_date?: string | null
          experience_id?: string
          guide_rating?: number | null
          id?: string
          is_verified_booking?: boolean | null
          overall_rating?: number
          safety_rating?: number | null
          title?: string | null
          trip_type?: string | null
          updated_at?: string | null
          user_id?: string
          value_rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tourism_reviews_experience_id_fkey"
            columns: ["experience_id"]
            isOneToOne: false
            referencedRelation: "tourism_experiences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tourism_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tourism_saved_experiences: {
        Row: {
          experience_id: string
          id: string
          notes: string | null
          saved_at: string | null
          user_id: string
        }
        Insert: {
          experience_id: string
          id?: string
          notes?: string | null
          saved_at?: string | null
          user_id: string
        }
        Update: {
          experience_id?: string
          id?: string
          notes?: string | null
          saved_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tourism_saved_experiences_experience_id_fkey"
            columns: ["experience_id"]
            isOneToOne: false
            referencedRelation: "tourism_experiences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tourism_saved_experiences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tourist_profiles: {
        Row: {
          arrival_date: string | null
          browsing_history: Json | null
          click_patterns: Json | null
          created_at: string | null
          departure_date: string | null
          experience_level: string | null
          home_country: string | null
          id: string
          interests: string[] | null
          is_first_visit: boolean | null
          preferred_languages: string[] | null
          recommendation_feedback: Json | null
          travel_style: string | null
          typical_group_size: number | null
          updated_at: string | null
        }
        Insert: {
          arrival_date?: string | null
          browsing_history?: Json | null
          click_patterns?: Json | null
          created_at?: string | null
          departure_date?: string | null
          experience_level?: string | null
          home_country?: string | null
          id: string
          interests?: string[] | null
          is_first_visit?: boolean | null
          preferred_languages?: string[] | null
          recommendation_feedback?: Json | null
          travel_style?: string | null
          typical_group_size?: number | null
          updated_at?: string | null
        }
        Update: {
          arrival_date?: string | null
          browsing_history?: Json | null
          click_patterns?: Json | null
          created_at?: string | null
          departure_date?: string | null
          experience_level?: string | null
          home_country?: string | null
          id?: string
          interests?: string[] | null
          is_first_visit?: boolean | null
          preferred_languages?: string[] | null
          recommendation_feedback?: Json | null
          travel_style?: string | null
          typical_group_size?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tourist_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_clicks: {
        Row: {
          business_id: string
          clicked_at: string | null
          device_type: string | null
          id: string
          user_agent: string | null
        }
        Insert: {
          business_id: string
          clicked_at?: string | null
          device_type?: string | null
          id?: string
          user_agent?: string | null
        }
        Update: {
          business_id?: string
          clicked_at?: string | null
          device_type?: string | null
          id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_clicks_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_business_event_views: {
        Args: { business_event_id: string }
        Returns: undefined
      }
      increment_event_views: { Args: { event_id: string }; Returns: undefined }
      increment_event_whatsapp_clicks: {
        Args: { event_id: string }
        Returns: undefined
      }
      increment_tourism_view_count: {
        Args: { experience_id: string }
        Returns: undefined
      }
      increment_view_count: {
        Args: { business_id: string }
        Returns: undefined
      }
      increment_whatsapp_clicks: {
        Args: { business_id: string }
        Returns: undefined
      }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

