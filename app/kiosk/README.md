# Tourism Kiosk Mode

An immersive, touch-optimized kiosk interface for showcasing Guyana's tourism experiences in public spaces like airports, hotels, and tourist information centers.

## Overview

Kiosk mode is a full-screen, self-service interface designed to attract and engage tourists with beautiful visuals, smooth animations, and intuitive navigation. It automatically cycles through featured experiences when idle and returns to the home screen after periods of inactivity.

## Features

### 🎭 Attraction Loop (Home Screen)
- **Auto-rotating hero carousel** showing top-rated tourism experiences
- **6-second transitions** with Ken Burns animation effects
- **Large, pulsing "TAP TO EXPLORE" button** to enter interactive mode
- **Beautiful gradient overlays** and frosted glass effects
- **Experience highlights**: rating, duration, difficulty, price

### 🗂️ Category Grid
- **12 tourism categories** with stunning photography
- **Hover animations** and scale effects
- **Experience count badges** per category
- **Touch-optimized cards** with large tap targets
- **Auto-return to attraction loop** after 60 seconds of inactivity

### 📸 Category Slideshows
- **Full-screen immersive displays** for each category
- **Auto-advance every 10 seconds** (manual navigation available)
- **Dual-pane layout**:
  - Left: Large photo gallery with thumbnails
  - Right: Experience details, stats, and actions
- **Progress indicator** showing position in slideshow
- **QR code generation** for "Save to Phone" functionality
- **Auto-return to home** after 90 seconds of inactivity

### 🌟 Experience Showcase
- **3-column responsive layout**:
  - Left (2 columns): Photo gallery, description, reviews, inclusions
  - Right (1 column): Booking details, stats, actions
- **Multi-photo galleries** with navigation (up to 10 photos)
- **Comprehensive information**:
  - Pricing, duration, difficulty, group size
  - What's included/excluded
  - Safety information
  - Accessibility details
  - Languages offered
  - What to bring
- **Recent reviews** with star ratings
- **QR codes** for both page URL and WhatsApp contact
- **Auto-return to home** after 2 minutes of inactivity

### 📱 QR Code Integration
- **"Save to Phone"** - Visitors can scan QR codes to continue browsing on their devices
- **WhatsApp booking** - Direct WhatsApp QR codes for instant inquiries
- **Large, scannable codes** optimized for quick capture
- **Clear instructions** for scanning

### 🧭 Navigation
- **Fixed bottom navigation bar** with:
  - Home button (returns to attraction loop)
  - Interaction instructions
  - Language selector (placeholder for future multi-language support)
- **Glassmorphism design** with backdrop blur
- **Always accessible** for easy navigation

### ⏱️ Idle Timeout System
- **Smart inactivity detection** across all pages:
  - Home (category grid): 60 seconds → Attraction loop
  - Category slideshow: 90 seconds → Home
  - Experience details: 120 seconds → Home
- **Automatic reset** on any user interaction (touch, mouse, keyboard)
- **Session-based** tracking for analytics

### 📊 Analytics Tracking
- **Kiosk-specific analytics** API endpoint
- **Session ID tracking** for visitor journey analysis
- **Interaction types**:
  - `view` - Experience page views
  - `whatsapp_click` - WhatsApp inquiry clicks
  - `qr_scan` - QR code displays
  - `category_view` - Category browsing
- **Device type**: Automatically labeled as 'kiosk'
- **Integration** with existing tourism analytics tables

## Routes

```
/kiosk                              → Attraction loop & category grid
/kiosk/category/[slug]              → Category slideshow
/kiosk/experience/[slug]            → Individual experience showcase
```

## API Endpoints

```
POST /api/track-kiosk-interaction
```

**Request Body:**
```json
{
  "experience_id": "uuid (optional)",
  "interaction_type": "view | qr_scan | whatsapp_click | category_view",
  "session_id": "kiosk_timestamp_random",
  "metadata": {} // optional
}
```

## Components

### Core Components (`/components/kiosk/`)

| Component | Purpose |
|-----------|---------|
| `KioskAttractionLoop.tsx` | Auto-rotating hero carousel for home screen |
| `KioskCategoryGrid.tsx` | Grid of tourism categories with hover effects |
| `KioskCategorySlideshow.tsx` | Category-specific experience slideshow |
| `KioskExperienceShowcase.tsx` | Detailed experience display page |
| `KioskQRCode.tsx` | QR code modal for "Save to Phone" |
| `KioskNavBar.tsx` | Bottom navigation with home & language selector |

### Utilities (`/utils/kiosk.ts`)

- `generateKioskSessionId()` - Creates unique session IDs
- `getKioskSessionId()` - Retrieves or creates session ID from sessionStorage
- `trackKioskInteraction()` - Sends analytics to API

### Hooks (`/hooks/useIdleTimer.ts`)

- `useIdleTimer(onIdle, idleTime)` - Detects user inactivity and triggers callback

## Design System

### Color Palette
- **Primary gradients**: Emerald, teal, cyan (representing Guyana's nature)
- **Accent gradients**: Yellow, orange, pink (for CTAs)
- **Backgrounds**: Dark slate with gradients
- **Overlays**: Black with opacity, glassmorphism

### Typography
- **Headings**: 5xl-7xl, font-black (900 weight)
- **Body**: xl-2xl, readable line heights
- **Stats/Numbers**: 2xl-5xl, font-bold

### Animations
- **Ken Burns effect** on hero images (subtle zoom & pan)
- **Hover scale transforms** (105-110%)
- **Fade-in animations** for page loads
- **Slide-up animations** for content
- **Pulse animations** for CTAs
- **Smooth transitions** (300-700ms)

### Touch Optimization
- **Large tap targets** (minimum 44x44px, most 64x64px+)
- **Generous padding** (8-12 units)
- **Clear hover states** (even for touch devices)
- **Swipe-friendly layouts**

## Deployment Considerations

### Hardware Requirements
- **Display**: 1920x1080 minimum (Full HD), touchscreen recommended
- **Orientation**: Landscape
- **Browser**: Modern browser with ES6 support, fullscreen API

### Kiosk Setup

1. **Browser Configuration**:
   ```javascript
   // Launch in kiosk/fullscreen mode
   // For Chrome: --kiosk --app=https://yourdomain.com/kiosk
   ```

2. **Session Management**:
   - Clear cookies/cache daily to reset
   - Session IDs stored in sessionStorage (auto-clears on browser restart)

3. **Network**:
   - Stable internet connection required for images
   - Consider caching strategies for offline resilience

4. **Physical Setup**:
   - Position at tourist-friendly heights (approx. 40-48 inches)
   - Ensure good lighting (avoid glare on screen)
   - Provide hand sanitizer nearby for hygiene

### Security

- **No authentication required** - fully public interface
- **Read-only operations** - no user data collection
- **Rate limiting** recommended on API endpoints
- **Analytics only** - no PII collected

## Future Enhancements

- [ ] **Multi-language support** (EN, ES, PT, NL, ZH)
- [ ] **Video autoplay** in attraction loop
- [ ] **Weather integration** - suggest experiences based on current weather
- [ ] **Map integration** - show experience locations
- [ ] **Print itineraries** - physical QR code printouts
- [ ] **Email to self** - alternative to QR codes
- [ ] **Photo booth mode** - Take photos with Guyana overlays
- [ ] **Virtual tour previews** - 360° photos/videos
- [ ] **Accessibility mode** - High contrast, larger text
- [ ] **Voice narration** - Audio descriptions of experiences

## Analytics & Insights

Track kiosk performance via admin dashboard:
- **Total interactions** per session
- **Most viewed categories**
- **Most popular experiences**
- **Average session duration**
- **QR code scan rates**
- **WhatsApp conversion rates**
- **Peak usage times**

## Testing Checklist

- [ ] Attraction loop auto-rotates every 6 seconds
- [ ] Tap to explore transitions to category grid
- [ ] All 12 categories display with correct counts
- [ ] Category slideshow auto-advances every 10 seconds
- [ ] Manual navigation (arrows) works in slideshows
- [ ] QR codes generate correctly for all experiences
- [ ] Idle timeout returns to home screen
- [ ] Navigation bar Home button works
- [ ] Language selector opens modal
- [ ] Experience photos load and navigate properly
- [ ] WhatsApp QR codes include correct phone numbers
- [ ] Analytics track interactions correctly
- [ ] Responsive on different screen sizes
- [ ] Touch interactions smooth and responsive
- [ ] No console errors

## Credits

Built with Next.js 15, Tailwind CSS v4, and qrcode.react.
Designed for the Guyana Tourism Authority.
