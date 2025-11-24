# Multistep Forms Implementation Plan

## Overview
This document outlines the complete plan for converting all listing creation forms into mobile-first, multistep experiences with perfect UI/UX.

## Current Form Analysis

### Business Form (BusinessCreateForm.tsx)
- **Fields**: 10 total
- **Sections**: Basic Info + Contact
- **Complexity**: Simple
- **Key Fields**: name*, whatsapp_number*, description, category, region, phone, email, website, address

### Rental Form (RentalCreateForm.tsx)
- **Fields**: 30+ total
- **Sections**: 6 major sections
- **Complexity**: High
- **Key Fields**: property_type*, category_id*, name*, description*, region_id*, bedrooms*, bathrooms*, max_guests*, price_per_month*, whatsapp_number*, plus amenities arrays, utilities, house rules

### Event Form (EventCreateForm.tsx)
- **Fields**: 13 total
- **Sections**: Mixed (basic + datetime + contact)
- **Complexity**: Medium
- **Key Fields**: title*, description*, category_id*, start_date*, start_time*, end_date*, end_time*, location, business_id, whatsapp_number, email, image

### Tourism Form (TourismExperienceCreateForm.tsx)
- **Fields**: 40+ total
- **Sections**: 8 major sections
- **Complexity**: Very High
- **Key Fields**: name*, description*, whatsapp_number*, tourism_category_id, experience_type, duration, difficulty_level, region_id, price_from, operator info, what_to_bring (array), languages (array), tags (array)

---

## Architecture Design

### Component Structure
```
components/
├── forms/
│   ├── multistep/
│   │   ├── MultiStepFormWrapper.tsx       # Main orchestrator with state management
│   │   ├── FormProgressBar.tsx            # Mobile-optimized progress indicator
│   │   ├── FormStep.tsx                   # Individual step container
│   │   ├── FormNavigation.tsx             # Next/Back/Skip buttons
│   │   └── FormStepIndicator.tsx          # Dot indicators (mobile)
│   │
│   ├── business/
│   │   ├── BusinessFormSteps.tsx          # Step configuration & orchestration
│   │   └── steps/
│   │       ├── BasicInfoStep.tsx
│   │       ├── CategoryLocationStep.tsx
│   │       └── ContactInfoStep.tsx
│   │
│   ├── rental/
│   │   ├── RentalFormSteps.tsx
│   │   └── steps/
│   │       ├── PropertyTypeStep.tsx
│   │       ├── PropertyDetailsStep.tsx
│   │       ├── LocationStep.tsx
│   │       ├── PricingStep.tsx
│   │       ├── AmenitiesStep.tsx
│   │       └── ContactStep.tsx
│   │
│   ├── event/
│   │   ├── EventFormSteps.tsx
│   │   └── steps/
│   │       ├── BasicInfoStep.tsx
│   │       ├── DateTimeStep.tsx
│   │       ├── LocationStep.tsx
│   │       └── ContactStep.tsx
│   │
│   └── tourism/
│       ├── TourismFormSteps.tsx
│       └── steps/
│           ├── BasicInfoStep.tsx
│           ├── ExperienceDetailsStep.tsx
│           ├── LocationStep.tsx
│           ├── ContactOperatorStep.tsx
│           ├── PricingInclusionsStep.tsx
│           ├── AvailabilityStep.tsx
│           └── AdditionalInfoStep.tsx
```

---

## Step Breakdown by Form Type

### Business Form (3 Steps - Simple)

**Step 1: Business Basics**
- Fields: name*, description, category
- Visual: Large text inputs, category dropdown with icons
- Validation: Name required, min 3 characters

**Step 2: Location & Region**
- Fields: region*, address
- Visual: Region selector with map preview (optional)
- Validation: Region required

**Step 3: Contact Information**
- Fields: whatsapp_number*, phone, email, website
- Visual: Contact input with country code selector for WhatsApp
- Validation: WhatsApp required, email format validation

---

### Rental Form (6 Steps - Complex)

**Step 1: Property Basics**
- Fields: property_type*, category_id*, name*, description*
- Visual: Cards for property type selection (apartment, house, vacation_home, room, office, commercial, shared_housing, land)
- Validation: All required, description max 500 chars

**Step 2: Location**
- Fields: region_id*, address, location_details
- Visual: Region dropdown, text inputs for address details
- Validation: Region required

**Step 3: Property Details**
- Fields: bedrooms* (1-10), bathrooms* (0.5-10), max_guests* (1-50), square_feet
- Visual: Number steppers with +/- buttons
- Validation: Min/max ranges enforced

**Step 4: Pricing**
- Fields: price_per_night, price_per_week, price_per_month*, security_deposit
- Visual: Currency-formatted inputs with GYD prefix
- Validation: At least price_per_month required

**Step 5: Amenities & Features**
- Fields: amenities[] (20 options), utilities_included[] (4 options), house_rules[] (4 options)
- Visual: Icon-based checkbox grid (2 columns mobile, 3-4 desktop)
- Validation: None required
- Options: WiFi, Air Conditioning, Parking, Pool, Kitchen, Washer/Dryer, TV, Hot Water, Furnished, Security, Generator, Garden, Balcony, Gym, Elevator, Pet Friendly, Wheelchair Accessible, Smoke Detector, Fire Extinguisher, First Aid Kit

**Step 6: Contact Information**
- Fields: whatsapp_number*, phone, email
- Visual: Phone input with validation, country code helper
- Validation: WhatsApp required with country code (592)

---

### Event Form (4 Steps - Medium)

**Step 1: Event Basics**
- Fields: title*, description*, category_id*
- Visual: Large text area for description (max 2000 chars)
- Validation: Title max 200 chars, description required

**Step 2: Schedule**
- Fields: start_date*, start_time*, end_date*, end_time*
- Visual: Date/time picker with calendar UI (native on mobile)
- Validation: End must be after start, can't be in past

**Step 3: Location & Association**
- Fields: location, business_id
- Visual: Location input + optional business dropdown
- Validation: None required (both optional)

**Step 4: Contact & Photo**
- Fields: whatsapp_number, email, image_file
- Visual: Image upload preview + contact inputs
- Validation: At least one contact method required (WhatsApp OR email)

---

### Tourism Form (7 Steps - Most Complex)

**Step 1: Experience Basics**
- Fields: name*, description*, tourism_category_id, experience_type
- Visual: Large inputs with character counter
- Validation: Name and description required
- Experience types: tour, activity, attraction, accommodation, service

**Step 2: Experience Details**
- Fields: duration, difficulty_level, group_size_min, group_size_max, age_requirement
- Visual: Visual difficulty selector with icons (easy/moderate/challenging/extreme), number inputs
- Validation: Min/max group size logic

**Step 3: Location**
- Fields: region_id, location_details, meeting_point
- Visual: Multi-field location with map integration potential
- Validation: Optional but recommended

**Step 4: Contact & Operator**
- Fields: whatsapp_number*, phone, email, website, operator_name, operator_license
- Visual: Grouped contact fields, operator info section
- Validation: WhatsApp required

**Step 5: Pricing & Inclusions**
- Fields: price_from, price_currency (GYD), price_notes, includes, excludes
- Visual: Price input + dual text areas for inclusions/exclusions
- Validation: Optional but important for tourists

**Step 6: Availability & Requirements**
- Fields: best_season, booking_required (checkbox), advance_booking_days, accessibility_info, safety_requirements
- Visual: Checkbox + number inputs, text areas
- Validation: Booking days conditional on booking_required

**Step 7: Additional Details**
- Fields: what_to_bring (comma-separated → array), languages (comma-separated → array, default: English), tags (comma-separated → array)
- Visual: Tag input with suggestions, text areas
- Validation: Parse CSV to arrays on submit

---

## Mobile-First Design Patterns

### Progress Indication

**Mobile (320px-768px):**
- Dot indicators at top (e.g., ●●○○○)
- Current step text below dots ("Step 2 of 6: Location")
- No step labels to save space
- Sticky position at top

**Tablet/Desktop (768px+):**
- Horizontal step bar with labels
- Icons for each step
- Completed steps show checkmark ✓
- Current step highlighted
- Future steps grayed out

### Navigation Patterns

**Mobile:**
- Sticky bottom navigation bar
- Full-width "Continue" button (primary color)
- "Back" link in top-left corner
- Auto-save draft on step change
- Exit confirmation if leaving mid-form

**Desktop:**
- Bottom-right aligned buttons
- "Back" and "Continue" side by side
- Progress saved in session storage
- Keyboard shortcuts (Enter = next, Escape = cancel)

### Input Optimization

**Mobile:**
- Single column layout
- Larger touch targets (44px minimum height)
- Native input types (tel, email, date, time)
- Floating labels to save space
- Collapsible sections for checkbox groups
- Bottom sheet for long select lists

**Desktop:**
- Two-column grid where logical
- Larger form fields (more comfortable)
- Inline validation messages
- Hover states on interactive elements

### Validation Strategy

- Real-time validation on blur (not on every keystroke)
- Visual indicators (green checkmark ✓ for valid fields)
- Red border + error message for invalid
- Can't proceed to next step if required fields empty
- Show error summary at top of step
- Scroll to first error on attempted submit
- Toast notification for successful step completion

---

## Technical Implementation Details

### State Management

```typescript
// Context-based state management
interface MultiStepFormState<T> {
  currentStep: number
  totalSteps: number
  formData: Partial<T>
  completedSteps: Set<number>
  errors: Record<string, string>
  isSubmitting: boolean
}

// Actions
- setFormData(data: Partial<T>)
- goToStep(step: number)
- nextStep()
- previousStep()
- validateStep(step: number): boolean
- submitForm()
- saveDraft()
- loadDraft()
```

**Storage:**
- React Context for form state
- localStorage for draft saving (key: `draft_${formType}_${userId}`)
- Session storage for temporary data
- Zustand for complex forms (optional, if Context becomes unwieldy)

### Routing Strategy

- Query params for step tracking: `?step=2`
- Browser back/forward support (sync with query params)
- Direct URL access to specific step (if draft data exists)
- Redirect to step 1 if no data and accessing later step

### Animations

```typescript
// Framer Motion variants
- Slide transitions between steps (x: -100% to 0, then 0 to 100%)
- Duration: 150ms ease-in-out
- Progress bar fill animation
- Success confetti on completion
- Micro-interactions on input focus
- Skeleton loading for draft restoration
```

### Accessibility

- ARIA labels for progress (`aria-label="Step 2 of 6"`)
- ARIA live regions for validation errors
- Keyboard navigation (Tab, Shift+Tab, Enter, Escape)
- Screen reader announcements for step changes
- Focus management between steps (focus first field on step load)
- Skip links for screen readers
- Proper form labels and fieldsets

---

## Shared Reusable Components

### Core Multistep Components

**MultiStepFormWrapper**
```typescript
interface MultiStepFormWrapperProps<T> {
  steps: FormStepConfig[]
  initialData?: Partial<T>
  onSubmit: (data: T) => Promise<void>
  onSaveDraft?: (data: Partial<T>) => void
  formType: 'business' | 'rental' | 'event' | 'tourism'
  userId: string
}
```

**FormStep**
```typescript
interface FormStepProps {
  title: string
  description?: string
  children: React.ReactNode
  isActive: boolean
  validate?: () => boolean
  onValidate?: (errors: Record<string, string>) => void
}
```

**FormProgressBar**
```typescript
interface FormProgressBarProps {
  currentStep: number
  totalSteps: number
  steps: Array<{ label: string; icon?: React.ReactNode }>
  variant: 'dots' | 'bar' // 'dots' for mobile, 'bar' for desktop
}
```

**FormNavigation**
```typescript
interface FormNavigationProps {
  onBack: () => void
  onNext: () => void
  onSkip?: () => void
  canGoBack: boolean
  canGoNext: boolean
  isLastStep: boolean
  isSubmitting: boolean
  nextLabel?: string // Default: "Continue" / "Submit" on last step
}
```

### Input Components

**TextInput**
```typescript
interface TextInputProps {
  label: string
  name: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  error?: string
  placeholder?: string
  maxLength?: number
  helperText?: string
  icon?: React.ReactNode
}
```

**TextArea**
```typescript
interface TextAreaProps extends Omit<TextInputProps, 'icon'> {
  rows?: number
  showCharCount?: boolean
  maxLength?: number
}
```

**Select**
```typescript
interface SelectProps {
  label: string
  name: string
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string; icon?: React.ReactNode }>
  required?: boolean
  error?: string
  searchable?: boolean
}
```

**NumberStepper**
```typescript
interface NumberStepperProps {
  label: string
  name: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  required?: boolean
  error?: string
}
```

**CheckboxGrid**
```typescript
interface CheckboxGridProps {
  label: string
  name: string
  options: Array<{ value: string; label: string; icon?: React.ReactNode }>
  selected: string[]
  onChange: (selected: string[]) => void
  columns?: number // Responsive: 2 on mobile, 3-4 on desktop
}
```

**DateTimePicker**
```typescript
interface DateTimePickerProps {
  label: string
  name: string
  value: string // ISO string
  onChange: (value: string) => void
  mode: 'date' | 'time' | 'datetime'
  required?: boolean
  error?: string
  min?: string // Min date/time
  max?: string // Max date/time
}
```

**PhoneInput**
```typescript
interface PhoneInputProps {
  label: string
  name: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  error?: string
  defaultCountryCode?: string // Default: '592' for Guyana
  helperText?: string
}
```

**ImageUpload**
```typescript
interface ImageUploadProps {
  label: string
  name: string
  value: File | null
  onChange: (file: File | null) => void
  preview?: string // URL for preview
  maxSize?: number // In MB
  acceptedFormats?: string[] // Default: ['image/jpeg', 'image/png', 'image/webp']
  required?: boolean
  error?: string
}
```

**TagInput**
```typescript
interface TagInputProps {
  label: string
  name: string
  value: string[] // Array of tags
  onChange: (tags: string[]) => void
  suggestions?: string[]
  placeholder?: string
  maxTags?: number
  helperText?: string
}
```

---

## Visual Design System

### Color Coding by Listing Type

- **Business**: Emerald (`emerald-600`, `emerald-50`)
- **Rental**: Blue (`blue-600`, `blue-50`)
- **Event**: Purple (`purple-600`, `purple-50`)
- **Tourism**: Purple (`purple-600`, `purple-50`)

### Step Transitions

- Slide animation: 150ms ease-in-out
- Fade in for error messages: 200ms
- Progress bar fill: 300ms ease
- Button hover: 150ms

### Spacing (Mobile-First)

```css
/* Mobile (320px-768px) */
--form-padding: 16px;
--input-gap: 16px;
--section-gap: 24px;
--button-height: 48px;

/* Desktop (768px+) */
--form-padding: 24px;
--input-gap: 20px;
--section-gap: 32px;
--button-height: 44px;
```

### Typography

```css
/* Step title */
--step-title: text-2xl font-bold (mobile), text-3xl (desktop)

/* Step description */
--step-description: text-base text-gray-600

/* Input label */
--label: text-sm font-medium text-gray-700

/* Helper text */
--helper: text-sm text-gray-500

/* Error text */
--error: text-sm text-red-600
```

---

## Implementation Phases

### Phase 1: Foundation (Start Here)

**Tasks:**
1. Create `components/forms/multistep/` directory structure
2. Build `MultiStepFormWrapper.tsx` (core orchestrator)
3. Implement state management (Context + hooks)
4. Create `FormProgressBar.tsx` (mobile + desktop variants)
5. Build `FormNavigation.tsx` (back/next/skip buttons)
6. Implement draft saving/loading logic
7. Add localStorage utilities

**Files to Create:**
- `components/forms/multistep/MultiStepFormWrapper.tsx`
- `components/forms/multistep/FormProgressBar.tsx`
- `components/forms/multistep/FormNavigation.tsx`
- `components/forms/multistep/FormStep.tsx`
- `components/forms/multistep/FormStepIndicator.tsx`
- `hooks/useMultiStepForm.ts`
- `lib/formDraftStorage.ts`

### Phase 2: Reusable Input Components

**Tasks:**
1. Create input component directory
2. Build each input component with validation
3. Add Storybook stories for each (optional)
4. Ensure mobile-first responsive design
5. Implement accessibility features

**Files to Create:**
- `components/forms/inputs/TextInput.tsx`
- `components/forms/inputs/TextArea.tsx`
- `components/forms/inputs/Select.tsx`
- `components/forms/inputs/NumberStepper.tsx`
- `components/forms/inputs/CheckboxGrid.tsx`
- `components/forms/inputs/DateTimePicker.tsx`
- `components/forms/inputs/PhoneInput.tsx`
- `components/forms/inputs/ImageUpload.tsx`
- `components/forms/inputs/TagInput.tsx`

### Phase 3: Business Form (Simplest - 3 Steps)

**Tasks:**
1. Create `components/forms/business/` directory
2. Create 3 step components
3. Build `BusinessFormSteps.tsx` orchestrator
4. Wire up to existing page at `app/dashboard/my-business/create/page.tsx`
5. Test mobile experience thoroughly
6. Validate form submission

**Files to Create:**
- `components/forms/business/BusinessFormSteps.tsx`
- `components/forms/business/steps/BasicInfoStep.tsx`
- `components/forms/business/steps/CategoryLocationStep.tsx`
- `components/forms/business/steps/ContactInfoStep.tsx`

**Files to Update:**
- `app/dashboard/my-business/create/page.tsx` (replace BusinessCreateForm)
- Archive `components/BusinessCreateForm.tsx` (rename to `.old.tsx`)

### Phase 4: Event Form (Medium - 4 Steps)

**Tasks:**
1. Create `components/forms/event/` directory
2. Create 4 step components
3. Build `EventFormSteps.tsx` orchestrator
4. Wire up to existing page
5. Test datetime picker on mobile
6. Validate image upload

**Files to Create:**
- `components/forms/event/EventFormSteps.tsx`
- `components/forms/event/steps/BasicInfoStep.tsx`
- `components/forms/event/steps/DateTimeStep.tsx`
- `components/forms/event/steps/LocationStep.tsx`
- `components/forms/event/steps/ContactStep.tsx`

**Files to Update:**
- `app/dashboard/my-events/create/page.tsx`
- Archive `components/EventCreateForm.tsx`

### Phase 5: Rental Form (Complex - 6 Steps)

**Tasks:**
1. Create `components/forms/rental/` directory
2. Create 6 step components
3. Build `RentalFormSteps.tsx` orchestrator
4. Test amenities checkbox grid on mobile
5. Validate pricing inputs with currency formatting
6. Test photo redirect flow

**Files to Create:**
- `components/forms/rental/RentalFormSteps.tsx`
- `components/forms/rental/steps/PropertyTypeStep.tsx`
- `components/forms/rental/steps/PropertyDetailsStep.tsx`
- `components/forms/rental/steps/LocationStep.tsx`
- `components/forms/rental/steps/PricingStep.tsx`
- `components/forms/rental/steps/AmenitiesStep.tsx`
- `components/forms/rental/steps/ContactStep.tsx`

**Files to Update:**
- `app/dashboard/my-rentals/create/page.tsx`
- Archive `components/RentalCreateForm.tsx`

### Phase 6: Tourism Form (Most Complex - 7 Steps)

**Tasks:**
1. Create `components/forms/tourism/` directory
2. Create 7 step components
3. Build `TourismFormSteps.tsx` orchestrator
4. Test tag input functionality
5. Validate CSV-to-array parsing (what_to_bring, languages, tags)
6. Test all field interactions

**Files to Create:**
- `components/forms/tourism/TourismFormSteps.tsx`
- `components/forms/tourism/steps/BasicInfoStep.tsx`
- `components/forms/tourism/steps/ExperienceDetailsStep.tsx`
- `components/forms/tourism/steps/LocationStep.tsx`
- `components/forms/tourism/steps/ContactOperatorStep.tsx`
- `components/forms/tourism/steps/PricingInclusionsStep.tsx`
- `components/forms/tourism/steps/AvailabilityStep.tsx`
- `components/forms/tourism/steps/AdditionalInfoStep.tsx`

**Files to Update:**
- `app/dashboard/my-tourism/create/page.tsx`
- Archive `components/tourism/TourismExperienceCreateForm.tsx`

### Phase 7: Polish & Optimization

**Tasks:**
1. Add Framer Motion animations
2. Accessibility audit (screen reader, keyboard nav)
3. Performance optimization (lazy loading, code splitting)
4. Cross-browser testing (Chrome, Safari, Firefox, Edge)
5. Mobile device testing (iOS Safari, Android Chrome)
6. Error handling improvements
7. Success animations (confetti, celebration)
8. Add analytics tracking for step completion

---

## Key UX Considerations

### What Makes This Perfect:

1. **No Overwhelming Scrolling**: Each step fits on one mobile screen (viewport height)
2. **Clear Progress**: Users always know how far they've come and how much is left
3. **Save Drafts**: Auto-save on step change, manual save button, return later without losing work
4. **Smart Defaults**: Pre-fill common values (e.g., region based on IP, English for languages)
5. **Skip Optional Steps**: "Skip" button for non-required steps to speed up flow
6. **Validation Feedback**: Immediate, helpful error messages (not generic)
7. **Mobile-Native**: Uses native date/time pickers on mobile for better UX
8. **Fast Navigation**: Can jump to specific steps if needed (edit mode)
9. **Review Step**: Optional final "Review & Submit" step with edit links to each section
10. **Success Celebration**: Confetti/animation on completion to delight users

### Error Handling:

- Network errors: Retry button, save draft locally
- Validation errors: Inline + summary at top
- Server errors: Friendly message + support contact
- Duplicate slug: Suggest alternatives
- Image upload failures: Allow skip, can upload later from dashboard

### Performance:

- Lazy load step components (React.lazy + Suspense)
- Debounce validation (300ms)
- Optimize image previews (compress before upload)
- Minimize re-renders (React.memo on step components)
- Code split by form type

---

## Testing Checklist

### Functionality:
- [ ] Can navigate forward/backward between steps
- [ ] Validation prevents invalid next step
- [ ] Draft saving/loading works correctly
- [ ] Form submission succeeds
- [ ] Error handling works for all scenarios
- [ ] Browser back/forward buttons work
- [ ] Direct URL access to steps works (with data)
- [ ] Mobile native inputs work correctly

### UI/UX:
- [ ] Progress indicator updates correctly
- [ ] Animations are smooth (60fps)
- [ ] Mobile layout fits viewport without scrolling (per step)
- [ ] Touch targets are 44px minimum
- [ ] Error messages are clear and helpful
- [ ] Success feedback is satisfying
- [ ] Loading states are clear

### Accessibility:
- [ ] Screen reader navigation works
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Focus management works between steps
- [ ] ARIA labels are correct
- [ ] Color contrast meets WCAG AA
- [ ] Error announcements work

### Performance:
- [ ] Initial load < 2s
- [ ] Step transitions < 200ms
- [ ] No layout shifts
- [ ] No memory leaks
- [ ] Works on slow 3G connection

### Browser/Device:
- [ ] Chrome desktop
- [ ] Safari desktop
- [ ] Firefox desktop
- [ ] Edge desktop
- [ ] iOS Safari
- [ ] Android Chrome
- [ ] Small screens (320px width)
- [ ] Large screens (1920px+ width)

---

## Notes for Future Implementation

### Nice-to-Have Features (Post-MVP):

1. **AI-Powered Assistance**: Help users write better descriptions
2. **Image Optimization**: Auto-crop, resize, compress on upload
3. **Location Autocomplete**: Google Places API integration
4. **Price Suggestions**: Based on similar listings
5. **Multi-Language Support**: Forms in English, Spanish, Portuguese
6. **Voice Input**: For description fields on mobile
7. **QR Code Sharing**: Share draft form link via QR
8. **Conditional Logic**: Show/hide fields based on previous answers
9. **Progress Saving Indicator**: Show "Saving..." toast on draft save
10. **Step Time Tracking**: Analytics on how long users spend per step

### Technical Debt to Avoid:

- Don't hardcode step numbers (use dynamic calculation)
- Don't duplicate validation logic (centralize in shared validators)
- Don't skip TypeScript types (maintain strict typing)
- Don't forget to clean up localStorage drafts after submission
- Don't ignore mobile Safari quirks (especially with inputs)

---

## Quick Start Guide for Next Developer

### To Continue Implementation:

1. **Start with Phase 1**: Build the core multistep framework first
2. **Reference existing forms**: Keep the old form files as reference for field names and validation logic
3. **Test on real devices**: Use your phone to test mobile experience constantly
4. **Follow mobile-first**: Build mobile layout first, then enhance for desktop
5. **Use TypeScript strictly**: Define all types, avoid `any`
6. **Commit incrementally**: Commit after each component is complete
7. **Test accessibility**: Use screen reader to test as you build

### First Files to Create:

```
1. components/forms/multistep/MultiStepFormWrapper.tsx
2. hooks/useMultiStepForm.ts
3. lib/formDraftStorage.ts
4. components/forms/multistep/FormProgressBar.tsx
5. components/forms/multistep/FormNavigation.tsx
```

### Reference the Old Forms:

Keep these files for reference:
- `components/BusinessCreateForm.tsx` → Field names, validation rules
- `components/RentalCreateForm.tsx` → Complex amenities logic
- `components/EventCreateForm.tsx` → Image upload flow
- `components/tourism/TourismExperienceCreateForm.tsx` → CSV-to-array parsing

---

## End of Plan Document

This document contains everything needed to implement the multistep form system. Update this document as implementation progresses with learnings and adjustments.

**Last Updated**: 2025-11-24
**Status**: Planning Complete → Ready for Implementation
**Next Step**: Phase 1 - Build Core Multistep Framework
