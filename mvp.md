# Guyana Business Directory PWA - MVP Functional Plan

## Project Overview

A WhatsApp-first Progressive Web App that helps Guyanese residents and tourists discover local businesses and connect with them instantly via WhatsApp. The app progressively builds from a simple directory to a comprehensive platform.

**Core Value Proposition:** Every business listing has a prominent "Contact via WhatsApp" button - the primary way users interact with businesses.

---

## Technical Foundation (Non-Negotiable)

### Stack Decision
- **Next.js 15** (App Router) - Modern React framework with built-in PWA support
- **Supabase Local CLI** - PostgreSQL database running locally for development
- **shadcn/ui** - Copy-paste component library (you own the code)
- **Tailwind CSS v4** - Utility-first styling
- **Vercel** - Deployment platform

### Why This Stack?
- **Local-first development** - Work offline, no cloud costs during development
- **Modern & Fast** - Latest technologies, no legacy baggage
- **No over-engineering** - Native PWA support, no extra dependencies
- **Developer-friendly** - Great DX with TypeScript, hot reload, type safety

---

## Phase 0: Foundation (Setup Only)

**Goal:** Get the development environment working and create the basic structure.

### What Needs to Be Done

1. **Project Initialization**
   - Create Next.js project with TypeScript
   - Install shadcn/ui and core dependencies
   - Set up Tailwind CSS

2. **Supabase Local Setup**
   - Initialize local database (runs in Docker)
   - Create initial database schema (tables for businesses, categories, regions, etc.)
   - Set up authentication (Google OAuth)

3. **PWA Configuration**
   - Create manifest.ts file (defines app name, icons, colors)
   - Generate PWA icons (192x192, 384x384, 512x512)
   - Configure metadata for mobile installation

4. **Basic File Structure**
   - Set up project folders
   - Create reusable utility functions
   - Configure environment variables

**Deliverable:** A working development environment that runs locally.

---

## Phase 1: MVP Business Directory (4-6 Weeks)

This is the **minimum viable product** that you'll launch first.

---

### PART A: Public Browsing (Week 1-2)

**Who:** Anyone visiting the site (no login required)

#### 1. Home Page

**Purpose:** Entry point - help users quickly find what they're looking for.

**What It Shows:**
- Hero section with search bar
- Grid of main categories 
- 6 featured businesses
- Simple, mobile-first design

**User Actions:**
- Search for businesses by name
- Click a category to browse
- Click a featured business to view details
- Install the app (PWA install prompt, for web only)

#### 2. Category Browse Page

**Purpose:** Show all businesses in a specific category.

**URL Pattern:** `/businesses/category/restaurants-food`

**What It Shows:**
- Category name and description
- Grid of business cards (3 columns on desktop, 1 on mobile)
- Simple filters: Region dropdown
- Sort options: Featured first, Highest rated, Newest

**Each Business Card Shows:**
- Primary photo (or placeholder if none)
- Business name
- Category badge
- Star rating + review count
- Location (region/city)
- "Verified" badge (if applicable)
- "Featured" badge (if applicable)

**User Actions:**
- Filter by region
- Sort results
- Click any business to view full details

#### 3. Search Results Page

**Purpose:** Show businesses matching search query.

**URL Pattern:** `/search?q=pizza`

**What It Shows:**
- Search query displayed
- Number of results found
- Same business card grid as category page
- Same filters and sorting

**Search Matches:**
- Business name
- Business description
- Category name

#### 4. Business Detail Page

**Purpose:** Full information about a single business + primary conversion point (WhatsApp click).

**URL Pattern:** `/businesses/joes-pizza`

**What It Shows:**

**Top Section:**
- Business name (large heading)
- Category and location
- Star rating 
- Photo gallery (if multiple photos uploaded)
- Primary photo (large, prominent)

**Main Content Area:**
- Full description
- Business hours (displayed nicely)
- Address (text only, no map)
- Phone number (if provided)
- Email (if provided)
- Website link (if provided)

**Sidebar (Right Column on Desktop, Below on Mobile):**
- **PRIMARY:** Giant green "Contact via WhatsApp" button
  - This is the MOST important element
  - When clicked:
    - Track the click in database
    - Open WhatsApp with pre-filled message
    - Message template: "Hi! I found you on Guyana Directory and I'm interested in [business name]"



#### 5. WhatsApp Click Tracking

**Purpose:** Measure which businesses are getting engagement.

**What Happens When User Clicks WhatsApp Button:**
1. Log the click in database:
   - Which business
   - When (timestamp)
   - Basic analytics (device type, etc.)
2. Increment business's total click count
3. Open WhatsApp:
   - On mobile: Opens WhatsApp app
   - On desktop: Opens web.whatsapp.com
   - Pre-filled message ready to send

**Why This Matters:** 
- Business owners can see if listing is working
- You can show "Popular" businesses
- Future: Charge businesses for featured placement based on clicks

---

### PART B: User Accounts & Reviews (Week 3)

**Who:** Users who want to save favorites.

#### 6. Authentication

**Sign In Options:**
- Google OAuth (one-click sign in)
- No password to remember
- No email verification needed

**What Gets Created:**
- User profile with:
  - Name (from Google)
  - Email (from Google)
  - Photo (from Google)
  - Account creation date

#### 7. Review System

**Leave a Review (Must Be Signed In):**
- star rating 


**Review Display:**
- Shows on business detail page
- Automatically updates business's average rating

**Review Rules:**
- Must be signed in
- Must rate 1-5 stars
- Text is optional
- No spam filtering (for MVP)
- No moderation (for MVP)

---

### PART C: Business Owner Features (Week 4)

**Who:** People who own or manage businesses listed on the platform.

#### 8. Business Claiming

**The Flow:**
1. User signs in with Google
2. Searches for their business
3. Clicks "Claim This Business" button
4. Submits claim request with:
   - Verification info (business license, phone number, etc.)
   - Contact details

**What Happens:**
- Claim goes to admin approval queue
- User gets notification when approved/rejected
- Once approved, business is linked to their account

#### 9. Business Dashboard

**URL:** `/dashboard/my-business`

**Who Can Access:** Business owners who have claimed a business.

**What They Can See:**

**Stats Section:**
- Total WhatsApp clicks (all time)
- WhatsApp clicks this week
- WhatsApp clicks today
- Total views
- Average rating

**Click Analytics:**
- Simple chart showing clicks over last 30 days
- Just a line graph, nothing fancy

**Business Info Management:**
- Edit business description
- Update phone/WhatsApp number
- Update email
- Update website
- Change business hours
- Change address

**Photo Management:**
- Upload new photos (max 3 for free tier)
- Delete existing photos
- Set primary photo
- Simple drag-and-drop or file picker


**What They CANNOT Do (MVP):**
- Cannot message customers directly
- Cannot see customer contact info
- Cannot see who clicked WhatsApp

---

### PART D: Admin Features (Week 5-6)

**Who:** You (the platform admin).

#### 10. Admin Dashboard

**URL:** `/admin`

**Access:** Restricted to admin users only.

**Business Management:**
- Add new businesses manually
  - Enter all business info
  - Upload photos
  - Assign to category and region
  - Set as verified/featured
- Edit any business
- Delete businesses
- Approve/reject claim requests

**Claim Approval Queue:**
- List of pending claims
- View claim details
- Approve with one click (links business to user account)
- Reject with reason

**Category Management:**
- Add/edit/delete categories
- Reorder categories
- Change category icons

**Region Management:**
- Add/edit/delete regions
- Set region type (city, town, village)

**Featured Business Management:**
- Mark businesses as "featured"
- Unmark featured
- Reorder featured businesses on homepage

**Verified Badge Management:**
- Mark businesses as "verified"
- Remove verified badge

**Basic Analytics:**
- Total businesses
- Total users
- Total WhatsApp clicks
- Top 10 businesses by clicks
- Top 10 businesses by views
- Recent activity feed

---

## Database Structure (What Needs to Be Stored)

### Tables Needed

1. **profiles** - User accounts
   - ID, email, name, photo, phone
   - Linked to authentication

2. **categories** - Business categories
   - ID, name, slug, icon, description
   - 8 categories for MVP

3. **regions** - Geographic locations
   - ID, name, slug, type (city/town/village)
   - You'll provide the list

4. **businesses** - The core listings
   - Basic info: name, slug, description
   - Category and region (linked)
   - Contact: phone, WhatsApp, email, website, address
   - Hours: stored as structured data
   - Status: is_claimed, is_verified, is_featured
   - Owner: linked to user who claimed it
   - Stats: rating, review_count, whatsapp_clicks, view_count
   - Timestamps

5. **business_photos** - Photos for businesses
   - Linked to business
   - URL to image file
   - Order and "is_primary" flag

   - Linked to business and user
   - Rating (1-5 stars)

7. **whatsapp_clicks** - Click tracking
   - Linked to business
   - Timestamp
   - Basic analytics data

---

## User Flows

### Flow 1: Tourist Finding a Restaurant

1. Opens guyanadirectory.com on phone
2. Sees home page with categories
3. Taps "Restaurants & Food"
4. Sees list of restaurants in Georgetown
5. Filters to "Georgetown" region
6. Taps a restaurant that looks good
7. Views photos and description
9. Taps big green "Contact via WhatsApp" button
10. WhatsApp opens with message ready
11. Sends message to restaurant
12. Restaurant responds with availability

**Success Metric:** WhatsApp click happened.

### Flow 2: Local Leaving a Review

1. Just ate at a great restaurant
2. Opens app (already installed on phone)
3. Searches for restaurant name
4. Opens restaurant page
6. Taps "Write a Review"
7. Prompted to sign in with Google
8. Signs in
9. Taps 5 stars
10. Writes "Best roti in Georgetown!"
11. Submits review
12. Review appears on page immediately

**Success Metric:** Review submitted and visible.

### Flow 3: Business Owner Claiming Listing

1. Restaurant owner hears about the directory
2. Opens site and searches for their restaurant
3. Finds their listing (you added it manually)
4. Signs in with Google
5. Clicks "Claim This Business"
6. Fills out claim form with business license info
7. Submits claim
8. Gets email: "Claim pending approval"
9. You (admin) approve the claim
10. They get email: "Claim approved!"
11. Opens dashboard
12. Sees their WhatsApp click stats
13. Uploads 2 more photos
14. Updates their description

**Success Metric:** Business owner has access to their dashboard and can manage listing.

### Flow 4: Admin Adding Business

1. You log into admin dashboard
2. Click "Add New Business"
3. Fill out form:
   - Name: "Joe's Pizza"
   - Category: Select "Restaurants & Food"
   - Region: Select "Georgetown"
   - Description: Copy from their Facebook page
   - WhatsApp: Enter their number
   - Hours: Enter their hours
4. Upload 1 photo from their Facebook
5. Check "Verified" badge
6. Save
7. Business goes live immediately
8. Searchable and browsable

**Success Metric:** Business appears on site within seconds.

---

## What You Need to Provide

Before development starts, you'll need to decide on:

### 1. Categories (8 for MVP)
Example:
- Restaurants & Food
- Shopping & Retail
- Hotels & Lodging
- Professional Services
- Health & Wellness
- Home Services
- Beauty & Personal Care
- Automotive

**For each category:**
- Name
- Short description
- Icon name (from lucide-react library)

### 2. Regions
Example:
- Georgetown (city)
- Demerara-Mahaica (region)
- New Amsterdam (town)
- Linden (town)
- etc.

**For each region:**
- Name
- Type (city, town, village, region)

### 3. Initial Businesses (Target: 100)
You'll manually add these to kickstart the platform.

**For each business:**
- Name
- Category
- Region
- Description (2-3 sentences)
- WhatsApp number (required)
- Phone (optional)
- Email (optional)
- Website (optional)
- Address
- Business hours
- 1-3 photos (if available)
- Should it be "Verified"?
- Should it be "Featured"?

---

## PWA Features (What Makes It an App)

### 1. Installable
- Users see "Install App" prompt in browser
- Click to install on phone home screen
- Opens like a native app (no browser chrome)
- App icon and splash screen

### 2. Offline Capability (Basic)
- Previously viewed pages load offline
- Photos cached automatically
- Shows "You're offline" message if trying to load new content
- WhatsApp button still works offline (opens app)

### 3. Mobile-Optimized
- Bottom navigation bar (Home, Search, Events, Marketplace, Account)
- Touch-friendly buttons
- Fast tap responses
- Swipe gestures (where appropriate)
- Full-screen mode

### 4. Performance
- Pages load in under 2 seconds
- Images optimized automatically
- Lazy loading (images load as you scroll)
- Minimal JavaScript bundle

---
---

## What's NOT in MVP

**DO NOT BUILD (For Later Phases):**
- ❌ Events calendar
- ❌ Marketplace listings
- ❌ Tourism guides
- ❌ In-app messaging
- ❌ Payment processing
- ❌ Email notifications
- ❌ Social media integration beyond sharing
- ❌ Advanced search filters
- ❌ Maps integration
- ❌ Multi-language support
- ❌ Business analytics dashboard (just basic stats)
- ❌ Review moderation tools
- ❌ Automated onboarding
- ❌ API for third parties
- ❌ Mobile apps (iOS/Android) - PWA only

---

## Development Timeline (MVP Only)

### Week 1-2: Foundation
- Set up Next.js + Supabase + shadcn
- Create database schema
- Deploy development environment

### Week 3-4: Public Features
- Home page with categories
- Category browse pages
- Search functionality
- Business detail page
- WhatsApp button + tracking
- PWA setup

### Week 5: User Features
- Google OAuth
- User profiles
- Review system

### Week 6-7: Business Owner Features
- Claim flow
- Business dashboard
- Photo uploads
- Business info editing

### Week 8-9: Admin Features
- Admin dashboard
- Manual business creation
- Claim approval
- Analytics

### Week 10: Polish & Testing
- Mobile testing
- Performance optimization
- Bug fixes
- Add first 50 businesses manually

### Week 11: Beta Launch
- Deploy to production
- Add remaining 50 businesses
- Soft launch to friends/family
- Gather feedback

### Week 12: Public Launch
- Fix any issues
- Marketing push
- Monitor metrics

**Total MVP Timeline: 12 weeks (3 months)**

---

## Post-MVP Roadmap (Brief)

**Phase 2 (Month 4-5): Events**
- Event listings
- Event categories
- Flyer uploads
- "I'm Interested" button
- Featured events (paid)

**Phase 3 (Month 6-7): Tourism**
- Destination guides
- Tourism-friendly badges
- USD pricing option
- Curated content

**Phase 4 (Month 8-10): Marketplace**
- Peer-to-peer listings
- Item categories
- Photo uploads
- Price in GYD/USD
- WhatsApp contact only

---

## Key Principles for MVP

1. **Mobile-First:** Design for phones, adapt for desktop
2. **WhatsApp-Centric:** Every business interaction happens via WhatsApp
3. **Simple is Better:** Remove features, don't add them
4. **Manual Before Automated:** You manually add businesses at first
5. **Launch Fast:** 3 months max to public beta
6. **Measure Everything:** Track clicks, views, sign-ups
7. **No Fancy Features:** Stick to the basics
8. **Local-First:** Georgetown focus initially

---

## Questions to Answer Before Starting

1. **Categories:** Finalize your 8 category list
2. **Regions:** How many regions to include initially?
3. **Business Data:** Where will you source the first 100 businesses?
4. **Photos:** Will you gather photos manually or scrape from Facebook?
5. **Branding:** App name, colors, logo?
6. **Domain:** What URL? (guyanadirectory.com, guidegy.com, etc.)
7. **Launch Date:** When do you want to launch publicly?
8. **Marketing:** How will you promote once live?

---

## Next Steps

1. **Finalize lists:** Categories, regions, initial businesses
2. **Set up development environment:** ~30 minutes
3. **Create database schema:** ~2 hours
4. **Start building features:** Follow the timeline
5. **Test continuously:** On real mobile devices
6. **Gather initial data:** Prepare your first 100 businesses
7. **Soft launch:** Get feedback from small group
8. **Public launch:** Go live to all of Guyana!

---

**This is a focused, achievable MVP that you can build in 3 months and launch with confidence.**