# LocationInput Setup Checklist

Follow this checklist to start using the LocationInput component in your application.

## ✅ Setup Steps

### Step 1: Get Geoapify API Key
- [ ] Go to https://www.geoapify.com/
- [ ] Sign up for a free account
- [ ] Navigate to "API Keys" in your dashboard
- [ ] Copy your API key

**Free Tier Limits:**
- 3,000 requests per day
- No credit card required
- Includes Autocomplete API and Static Maps API

### Step 2: Configure Environment
- [ ] Open `.env.local` in your project root
- [ ] Add the following line:
  ```bash
  NEXT_PUBLIC_GEOAPIFY_API_KEY=your-actual-api-key-here
  ```
- [ ] Save the file
- [ ] Restart your development server (`npm run dev`)

**Note:** The `.env.local` file is git-ignored, so your API key stays private.

### Step 3: Verify Database Migration
- [ ] Check that the migration was applied:
  ```bash
  # You should see the migration in your local database
  supabase migration list
  ```
- [ ] The following columns should exist in the `businesses` table:
  - `latitude` (DECIMAL)
  - `longitude` (DECIMAL)
  - `formatted_address` (TEXT)

**Already done:** ✅ Migration applied during implementation

### Step 4: Test the Component
- [ ] Import and use the component in a test page:
  ```tsx
  // app/test-location/page.tsx
  'use client'

  import { useState } from 'react'
  import { LocationInput, LocationData } from '@/components/forms/inputs'

  export default function TestPage() {
    const [location, setLocation] = useState<LocationData | null>(null)

    return (
      <div className="max-w-2xl mx-auto p-6">
        <LocationInput
          label="Test Location"
          name="test"
          value={location}
          onChange={setLocation}
          apiKey={process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY!}
          required
        />

        {location && (
          <pre className="mt-4 p-4 bg-gray-100 rounded">
            {JSON.stringify(location, null, 2)}
          </pre>
        )}
      </div>
    )
  }
  ```
- [ ] Visit http://localhost:3000/test-location
- [ ] Type an address in Guyana (e.g., "Georgetown Guyana")
- [ ] Select a suggestion
- [ ] Verify the map appears with a pin
- [ ] Try dragging the pin
- [ ] Check that coordinates update

### Step 5: Integrate into Your Forms

#### Option A: Add to Existing Business Form
- [ ] Find your business registration form
- [ ] Import LocationInput:
  ```tsx
  import { LocationInput, LocationData } from '@/components/forms/inputs'
  ```
- [ ] Add location state:
  ```tsx
  const [location, setLocation] = useState<LocationData | null>(null)
  ```
- [ ] Add the component to your form:
  ```tsx
  <LocationInput
    label="Business Location"
    name="location"
    value={location}
    onChange={setLocation}
    apiKey={process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY!}
    required
  />
  ```
- [ ] Update form submission to include location data

#### Option B: Use the Example Form
- [ ] Copy `components/forms/BusinessLocationForm.tsx`
- [ ] Adapt it to your needs
- [ ] Connect it to your database

### Step 6: Update Form Submission
- [ ] Add location fields to your database insert/update:
  ```tsx
  const { data, error } = await supabase
    .from('businesses')
    .insert({
      // ... existing fields
      latitude: location?.latitude,
      longitude: location?.longitude,
      formatted_address: location?.formatted_address,
    })
  ```

### Step 7: Display Locations (Optional)
- [ ] Show address on business profiles:
  ```tsx
  {business.formatted_address && (
    <div className="flex items-center gap-2">
      <MapPin className="w-5 h-5" />
      <span>{business.formatted_address}</span>
    </div>
  )}
  ```
- [ ] Add "Get Directions" link:
  ```tsx
  {business.latitude && business.longitude && (
    <a
      href={`https://www.google.com/maps/search/?api=1&query=${business.latitude},${business.longitude}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      Get Directions
    </a>
  )}
  ```
- [ ] Show map on detail pages using MapPreview component

## 🧪 Testing Checklist

### Functional Testing
- [ ] Address autocomplete works
- [ ] Suggestions appear after typing 3+ characters
- [ ] Can select suggestion with mouse
- [ ] Can select suggestion with keyboard (arrows + enter)
- [ ] Map appears after selection
- [ ] Pin is in correct location
- [ ] Can drag pin to adjust location
- [ ] Coordinates update when pin is dragged
- [ ] Clear button works
- [ ] Form validation works (required field)
- [ ] Error messages display correctly
- [ ] Data saves to database correctly

### Mobile Testing
- [ ] Component is responsive on mobile
- [ ] Touch targets are large enough (44px min)
- [ ] Suggestions dropdown works on mobile
- [ ] Map is visible on small screens
- [ ] Dragging works on touch devices

### Edge Cases
- [ ] Works when API key is missing (shows error)
- [ ] Handles no results gracefully
- [ ] Handles network errors
- [ ] Works with very long addresses
- [ ] Works when location is null/empty
- [ ] Works when editing existing location

## 📚 Resources

- **Full Documentation:** `docs/LocationInput-Usage.md`
- **Implementation Summary:** `docs/LocationInput-Implementation-Summary.md`
- **Example Form:** `components/forms/BusinessLocationForm.tsx`
- **Component Source:**
  - `components/forms/inputs/LocationInput.tsx`
  - `components/forms/inputs/MapPreview.tsx`

## 🐛 Troubleshooting

### Issue: Component not found
**Solution:** Make sure you've imported from the correct path:
```tsx
import { LocationInput, LocationData } from '@/components/forms/inputs'
```

### Issue: API key not working
**Solution:**
1. Check `.env.local` has the correct key
2. Restart dev server (`npm run dev`)
3. Verify the key at https://www.geoapify.com/

### Issue: No suggestions appearing
**Solution:**
1. Check browser console for errors
2. Verify API key in `.env.local`
3. Make sure you're typing at least 3 characters
4. Check network tab for API responses

### Issue: Map not loading
**Solution:**
1. Same as above - check API key
2. Verify latitude and longitude are valid numbers
3. Check network tab for failed image requests

### Issue: TypeScript errors
**Solution:**
1. Make sure you're using the `LocationData` type from the import
2. Run `npm install` to ensure all types are available
3. Restart TypeScript server in your editor

## ✨ You're Ready!

Once you've completed this checklist, you're ready to start collecting accurate location data from your users!

**Next steps:**
1. Add to business registration form
2. Add to business edit form
3. Display locations on business profiles
4. (Optional) Add to events/rentals/tourism forms

**Questions?** Check the full documentation in `docs/LocationInput-Usage.md`
