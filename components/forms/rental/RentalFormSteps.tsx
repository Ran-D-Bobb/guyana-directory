'use client'

import { useRouter } from 'next/navigation'
import { MultiStepFormWrapper } from '@/components/forms/multistep/MultiStepFormWrapper'
import PropertyTypeStep from './steps/PropertyTypeStep'
import LocationStep from './steps/LocationStep'
import PropertyDetailsStep from './steps/PropertyDetailsStep'
import PricingStep from './steps/PricingStep'
import AmenitiesStep from './steps/AmenitiesStep'
import ContactStep from './steps/ContactStep'
import { createClient } from '@/lib/supabase/client'
import { Building2, MapPin, Home, DollarSign, Sparkles, Phone } from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
}

interface Region {
  id: string
  name: string
  slug: string
}

interface RentalFormData {
  // Step 1: Property Type & Basics
  property_type: string
  category_id: string
  name: string
  description: string

  // Step 2: Location
  region_id: string
  address: string
  location_details: string

  // Step 3: Property Details
  bedrooms: number
  bathrooms: number
  max_guests: number
  square_feet: number | null

  // Step 4: Pricing
  price_per_night: number | null
  price_per_week: number | null
  price_per_month: number
  security_deposit: number | null

  // Step 5: Amenities
  amenities: string[]
  utilities_included: string[]
  house_rules: string[]

  // Step 6: Contact
  phone: string
  email: string
}

interface RentalFormStepsProps {
  categories: Category[]
  regions: Region[]
  userId: string
}

const INITIAL_DATA: RentalFormData = {
  property_type: '',
  category_id: '',
  name: '',
  description: '',
  region_id: '',
  address: '',
  location_details: '',
  bedrooms: 1,
  bathrooms: 1,
  max_guests: 1,
  square_feet: null,
  price_per_night: null,
  price_per_week: null,
  price_per_month: 0,
  security_deposit: null,
  amenities: [],
  utilities_included: [],
  house_rules: [],
  phone: '',
  email: ''
}

export default function RentalFormSteps({
  categories,
  regions,
  userId
}: RentalFormStepsProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (data: RentalFormData) => {
    try {
      // Generate slug from property name
      const baseSlug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')

      // Add short random suffix for uniqueness
      const randomSuffix = Math.random().toString(36).substring(2, 8)
      const slug = `${baseSlug}-${randomSuffix}`

      // Create rental listing
      const { data: rental, error: rentalError } = await supabase
        .from('rentals')
        .insert({
          landlord_id: userId,
          category_id: data.category_id,
          name: data.name,
          slug,
          description: data.description,
          property_type: data.property_type,
          region_id: data.region_id,
          address: data.address || null,
          location_details: data.location_details || null,
          bedrooms: data.bedrooms,
          bathrooms: data.bathrooms,
          max_guests: data.max_guests,
          square_feet: data.square_feet,
          price_per_night: data.price_per_night,
          price_per_week: data.price_per_week,
          price_per_month: data.price_per_month,
          security_deposit: data.security_deposit,
          amenities: data.amenities,
          utilities_included: data.utilities_included,
          house_rules: data.house_rules,
          phone: data.phone || null,
          email: data.email || null,
          is_approved: true, // Instant publishing (no approval queue)
        })
        .select()
        .single()

      if (rentalError) throw rentalError

      // Redirect to photo upload page
      router.push(`/dashboard/my-rentals/${rental.id}/photos`)
    } catch (err) {
      console.error('Error creating rental:', err)
      throw err
    }
  }

  const validateStep = (step: number, data: Partial<RentalFormData>): Record<string, string> => {
    const errors: Record<string, string> = {}

    switch (step) {
      case 0: // Property Type & Basics
        if (!data.property_type) errors.property_type = 'Please select a property type'
        if (!data.category_id) errors.category_id = 'Please select a category'
        if (!data.name || data.name.trim().length < 3) {
          errors.name = 'Property name must be at least 3 characters'
        }
        if (!data.description || data.description.trim().length < 10) {
          errors.description = 'Description must be at least 10 characters'
        }
        break

      case 1: // Location
        if (!data.region_id) errors.region_id = 'Please select a region'
        break

      case 2: // Property Details
        // Property types that don't require bedrooms
        const noBedroomTypes = ['office', 'commercial', 'land']
        const requiresBedrooms = !noBedroomTypes.includes(data.property_type || '')

        if (requiresBedrooms && (data.bedrooms === undefined || data.bedrooms < 0)) {
          errors.bedrooms = 'Please specify number of bedrooms'
        }
        if (!data.bathrooms || data.bathrooms < 0.5) {
          errors.bathrooms = 'Please specify number of bathrooms'
        }
        // Max guests not required for land
        if (data.property_type !== 'land' && (!data.max_guests || data.max_guests < 1)) {
          errors.max_guests = 'Please specify maximum number of guests'
        }
        break

      case 3: // Pricing
        if (!data.price_per_month || data.price_per_month <= 0) {
          errors.price_per_month = 'Monthly price is required'
        }
        break

      case 4: // Amenities (all optional, no validation)
        break

      case 5: // Contact
        // At least one contact method required
        if (!data.phone?.trim() && !data.email?.trim()) {
          errors.phone = 'Please provide at least one contact method (phone or email)'
        }
        if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
          errors.email = 'Please enter a valid email address'
        }
        break
    }

    return errors
  }

  const steps = [
    {
      id: 'property-type',
      title: 'Property Type',
      icon: <Building2 className="w-5 h-5" />,
      validate: (data: Partial<RentalFormData>) => validateStep(0, data)
    },
    {
      id: 'location',
      title: 'Location',
      icon: <MapPin className="w-5 h-5" />,
      validate: (data: Partial<RentalFormData>) => validateStep(1, data)
    },
    {
      id: 'details',
      title: 'Details',
      icon: <Home className="w-5 h-5" />,
      validate: (data: Partial<RentalFormData>) => validateStep(2, data)
    },
    {
      id: 'pricing',
      title: 'Pricing',
      icon: <DollarSign className="w-5 h-5" />,
      validate: (data: Partial<RentalFormData>) => validateStep(3, data)
    },
    {
      id: 'amenities',
      title: 'Amenities',
      icon: <Sparkles className="w-5 h-5" />,
      canSkip: true,
      validate: (data: Partial<RentalFormData>) => validateStep(4, data)
    },
    {
      id: 'contact',
      title: 'Contact',
      icon: <Phone className="w-5 h-5" />,
      validate: (data: Partial<RentalFormData>) => validateStep(5, data)
    }
  ]

  const renderStep = (
    stepId: string,
    formData: Partial<RentalFormData>,
    updateFormData: (data: Partial<RentalFormData>) => void,
    errors: Record<string, string>
  ) => {
    const handleChange = (field: string, value: string | number | string[] | null) => {
      updateFormData({ [field]: value } as Partial<RentalFormData>)
    }

    switch (stepId) {
      case 'property-type':
        return (
          <PropertyTypeStep
            formData={{
              property_type: formData.property_type || '',
              category_id: formData.category_id || '',
              name: formData.name || '',
              description: formData.description || ''
            }}
            errors={errors}
            onChange={handleChange}
            categories={categories}
          />
        )
      case 'location':
        return (
          <LocationStep
            formData={{
              region_id: formData.region_id || '',
              address: formData.address || '',
              location_details: formData.location_details || ''
            }}
            errors={errors}
            onChange={handleChange}
            regions={regions}
          />
        )
      case 'details':
        return (
          <PropertyDetailsStep
            formData={{
              bedrooms: formData.bedrooms ?? 1,
              bathrooms: formData.bathrooms ?? 1,
              max_guests: formData.max_guests ?? 1,
              square_feet: formData.square_feet ?? null
            }}
            errors={errors}
            onChange={handleChange}
            propertyType={formData.property_type}
          />
        )
      case 'pricing':
        return (
          <PricingStep
            formData={{
              price_per_night: formData.price_per_night ?? null,
              price_per_week: formData.price_per_week ?? null,
              price_per_month: formData.price_per_month ?? 0,
              security_deposit: formData.security_deposit ?? null
            }}
            errors={errors}
            onChange={handleChange}
          />
        )
      case 'amenities':
        return (
          <AmenitiesStep
            formData={{
              amenities: formData.amenities || [],
              utilities_included: formData.utilities_included || [],
              house_rules: formData.house_rules || []
            }}
            onChange={handleChange}
          />
        )
      case 'contact':
        return (
          <ContactStep
            formData={{
              phone: formData.phone || '',
              email: formData.email || ''
            }}
            errors={errors}
            onChange={handleChange}
          />
        )
      default:
        return null
    }
  }

  return (
    <MultiStepFormWrapper<RentalFormData>
      steps={steps}
      initialData={INITIAL_DATA}
      onSubmit={handleSubmit}
      formType="rental"
      userId={userId}
      renderStep={renderStep}
    />
  )
}
