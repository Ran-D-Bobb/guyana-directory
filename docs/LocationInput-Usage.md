# LocationInput Component Usage Guide

The `LocationInput` component provides an intuitive way for users to input addresses with autocomplete functionality and visual map confirmation. It uses Geoapify's geocoding API for address suggestions and map rendering.

## Features

- **Address Autocomplete**: Real-time address suggestions as users type
- **Map Preview**: Visual confirmation of the selected location with an interactive map
- **Draggable Marker**: Users can fine-tune the exact location by dragging the pin on the map
- **Coordinate Capture**: Automatically captures latitude, longitude, and formatted address
- **Mobile-Friendly**: Responsive design with appropriate touch targets
- **Keyboard Navigation**: Full keyboard support for accessibility

## Prerequisites

1. **Geoapify API Key**: Sign up at [https://www.geoapify.com/](https://www.geoapify.com/) to get a free API key
2. **Environment Variable**: Add your API key to `.env.local`:
   ```bash
   NEXT_PUBLIC_GEOAPIFY_API_KEY=your-api-key-here
   ```

## Installation

No additional dependencies are required. The component uses native fetch API and existing project dependencies.

## Basic Usage

```tsx
'use client'

import { useState } from 'react'
import { LocationInput, LocationData } from '@/components/forms/inputs/LocationInput'

export default function MyForm() {
  const [location, setLocation] = useState<LocationData | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (location) {
      console.log('Address:', location.formatted_address)
      console.log('Latitude:', location.latitude)
      console.log('Longitude:', location.longitude)

      // Save to database
      // await saveToDatabase(location)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <LocationInput
        label="Business Location"
        name="location"
        value={location}
        onChange={setLocation}
        apiKey={process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY!}
        required
        helperText="Start typing your address to see suggestions"
      />

      <button type="submit" disabled={!location}>
        Submit
      </button>
    </form>
  )
}
```

## Database Integration

### 1. Database Schema

The location fields are already added to your `businesses` table:

```sql
-- businesses table includes:
latitude DECIMAL(10, 8)
longitude DECIMAL(11, 8)
formatted_address TEXT
```

### 2. Saving Location Data

When submitting a form with location data:

```tsx
const saveBusinessLocation = async (businessData: {
  name: string
  // ... other fields
  location: LocationData | null
}) => {
  if (!businessData.location) return

  const { data, error } = await supabase
    .from('businesses')
    .insert({
      name: businessData.name,
      latitude: businessData.location.latitude,
      longitude: businessData.location.longitude,
      formatted_address: businessData.location.formatted_address,
      // ... other fields
    })

  return { data, error }
}
```

### 3. Loading Existing Location

When editing an existing business:

```tsx
'use client'

import { useEffect, useState } from 'react'
import { LocationInput, LocationData } from '@/components/forms/inputs/LocationInput'

export default function EditBusinessForm({ businessId }: { businessId: string }) {
  const [location, setLocation] = useState<LocationData | null>(null)

  useEffect(() => {
    // Fetch business data
    const fetchBusiness = async () => {
      const { data } = await supabase
        .from('businesses')
        .select('latitude, longitude, formatted_address')
        .eq('id', businessId)
        .single()

      if (data && data.latitude && data.longitude) {
        setLocation({
          latitude: data.latitude,
          longitude: data.longitude,
          formatted_address: data.formatted_address || '',
        })
      }
    }

    fetchBusiness()
  }, [businessId])

  return (
    <LocationInput
      label="Business Location"
      name="location"
      value={location}
      onChange={setLocation}
      apiKey={process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY!}
    />
  )
}
```

## Advanced Usage

### With Form Validation

```tsx
import { useState } from 'react'
import { LocationInput, LocationData } from '@/components/forms/inputs/LocationInput'

export default function ValidatedForm() {
  const [location, setLocation] = useState<LocationData | null>(null)
  const [error, setError] = useState<string>('')

  const handleLocationChange = (newLocation: LocationData | null) => {
    setLocation(newLocation)

    // Clear error when location is selected
    if (newLocation) {
      setError('')
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate
    if (!location) {
      setError('Please select a location for your business')
      return
    }

    // Validate coordinates are within Guyana (optional)
    if (location.latitude < 1.0 || location.latitude > 8.6 ||
        location.longitude < -61.4 || location.longitude > -56.5) {
      setError('Location must be within Guyana')
      return
    }

    // Submit form
  }

  return (
    <form onSubmit={handleSubmit}>
      <LocationInput
        label="Business Location"
        name="location"
        value={location}
        onChange={handleLocationChange}
        apiKey={process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY!}
        required
        error={error}
        helperText="Select your business location in Guyana"
      />
    </form>
  )
}
```

### Multi-Step Form Integration

```tsx
import { LocationInput, LocationData } from '@/components/forms/inputs/LocationInput'
import { MultiStepFormWrapper } from '@/components/forms/multistep/MultiStepFormWrapper'
import { FormStep } from '@/components/forms/multistep/FormStep'

export default function BusinessRegistrationForm() {
  const [formData, setFormData] = useState({
    // Step 1
    businessName: '',
    category: '',

    // Step 2 - Location
    location: null as LocationData | null,

    // Step 3
    phone: '',
    whatsapp: '',
  })

  return (
    <MultiStepFormWrapper totalSteps={3}>
      <FormStep
        stepNumber={1}
        title="Basic Information"
        onNext={() => {
          // Validate step 1
          return true
        }}
      >
        {/* Basic info fields */}
      </FormStep>

      <FormStep
        stepNumber={2}
        title="Location"
        onNext={() => {
          // Validate location is selected
          if (!formData.location) {
            alert('Please select your business location')
            return false
          }
          return true
        }}
      >
        <LocationInput
          label="Business Location"
          name="location"
          value={formData.location}
          onChange={(value) => setFormData({ ...formData, location: value })}
          apiKey={process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY!}
          required
          helperText="This will help customers find you and get directions"
        />
      </FormStep>

      <FormStep
        stepNumber={3}
        title="Contact Information"
      >
        {/* Contact fields */}
      </FormStep>
    </MultiStepFormWrapper>
  )
}
```

## Props Reference

### LocationInput Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `label` | `string` | Yes | Label text displayed above the input |
| `name` | `string` | Yes | Input name for form handling |
| `value` | `LocationData \| null` | Yes | Current location value |
| `onChange` | `(value: LocationData \| null) => void` | Yes | Callback when location changes |
| `apiKey` | `string` | Yes | Geoapify API key |
| `required` | `boolean` | No | Whether the field is required (default: false) |
| `error` | `string` | No | Error message to display |
| `helperText` | `string` | No | Helper text displayed below input |
| `className` | `string` | No | Additional CSS classes |

### LocationData Type

```typescript
interface LocationData {
  latitude: number        // Decimal degrees
  longitude: number       // Decimal degrees
  formatted_address: string  // Human-readable address
}
```

### MapPreview Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `latitude` | `number` | Yes | Location latitude |
| `longitude` | `number` | Yes | Location longitude |
| `apiKey` | `string` | Yes | Geoapify API key |
| `onLocationChange` | `(lat: number, lon: number) => void` | No | Callback when marker is dragged |
| `draggable` | `boolean` | No | Allow marker dragging (default: true) |
| `zoom` | `number` | No | Map zoom level (default: 15) |
| `className` | `string` | No | Additional CSS classes |

## Features Explained

### Address Autocomplete

- Automatically suggests addresses as the user types (minimum 3 characters)
- Debounced to avoid excessive API calls (300ms delay)
- Biased towards Guyana locations (`countrycode:gy`)
- Keyboard navigation support (Arrow keys, Enter, Escape)
- Shows up to 5 suggestions at a time

### Map Preview

- Static map rendered using Geoapify's Static Maps API
- Shows selected location with a red pin marker
- "Open in Google Maps" button for detailed navigation
- Updates automatically when location changes

### Draggable Marker

- Drag the marker to fine-tune the exact location
- Visual feedback (scale animation) during drag
- Automatically recalculates coordinates
- Keeps the original formatted address text

## User Experience Tips

1. **Clear Instructions**: Use the `helperText` prop to guide users
   ```tsx
   helperText="Start typing your street address, building name, or landmark"
   ```

2. **Validation Feedback**: Show specific error messages
   ```tsx
   error="Please select a location from the suggestions"
   ```

3. **Loading State**: The component shows a spinner while fetching suggestions

4. **Empty State**: If no location is selected, no map is shown (cleaner interface)

5. **Mobile Optimization**: Touch targets are 44px minimum height on mobile

## Displaying Locations to Users

### Show Address on Business Profile

```tsx
export function BusinessProfile({ business }) {
  return (
    <div>
      <h1>{business.name}</h1>

      {business.formatted_address && (
        <div className="flex items-start gap-2 text-gray-700">
          <MapPin className="w-5 h-5 text-emerald-600 mt-0.5" />
          <div>
            <p>{business.formatted_address}</p>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${business.latitude},${business.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-emerald-600 hover:text-emerald-700"
            >
              Get Directions →
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
```

### Show Map on Business Detail Page

```tsx
import { MapPreview } from '@/components/forms/inputs/MapPreview'

export function BusinessDetailPage({ business }) {
  return (
    <div>
      <h1>{business.name}</h1>

      {business.latitude && business.longitude && (
        <MapPreview
          latitude={business.latitude}
          longitude={business.longitude}
          apiKey={process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY!}
          draggable={false}  // Users shouldn't drag on view-only page
          zoom={16}
        />
      )}
    </div>
  )
}
```

## API Rate Limits

Geoapify's free tier includes:
- 3,000 requests per day
- Autocomplete and Static Maps both count toward this limit
- Consider implementing client-side caching for production

## Troubleshooting

### "No suggestions appearing"
- Check that `NEXT_PUBLIC_GEOAPIFY_API_KEY` is set correctly
- Verify the API key is valid at [https://www.geoapify.com/](https://www.geoapify.com/)
- Check browser console for API errors
- Ensure you're typing at least 3 characters

### "Map not loading"
- Verify API key has access to Static Maps API
- Check network tab for failed image requests
- Ensure latitude/longitude values are valid

### "Marker drag not working"
- Ensure `draggable={true}` is set on MapPreview
- Check that `onLocationChange` callback is provided
- Verify the component is not in a read-only context

## Best Practices

1. **Always Provide Helper Text**: Users may not know how to use autocomplete
2. **Validate Coordinates**: Ensure locations are within expected bounds
3. **Store All Three Values**: latitude, longitude, AND formatted_address
4. **Allow Fine-Tuning**: Keep the draggable marker enabled for better accuracy
5. **Show Confirmation**: Display the selected address clearly before form submission
6. **Handle Errors Gracefully**: Provide fallback if API is unavailable
7. **Consider Offline**: Show existing location data even if API fails

## Example: Complete Business Form

See `components/forms/BusinessLocationForm.tsx` for a complete working example (you can create this next if needed).

## Support

For issues with the component, check:
- Component files: `components/forms/inputs/LocationInput.tsx` and `MapPreview.tsx`
- Database migration: `supabase/migrations/*_add_location_fields_to_businesses.sql`
- TypeScript types: `types/supabase.ts` (auto-generated)
