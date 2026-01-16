# Admin Improvements Tracker

## Overview
Enhancing admin functionality for maximum oversight with a 3-person team in mind.

---

## Phase 1: Audit Logging
**Status:** Completed

### Database
- [x] Create `admin_audit_logs` table
  - `id` (uuid)
  - `admin_id` (uuid, references profiles)
  - `action` (enum: create, update, delete, verify, unverify, feature, unfeature, approve, unapprove, suspend, ban, reactivate, dismiss_flag)
  - `entity_type` (enum: business, review, event, tourism, rental, user, photo, category, region, timeline)
  - `entity_id` (uuid)
  - `entity_name` (text, for display after deletion)
  - `before_data` (jsonb, nullable)
  - `after_data` (jsonb, nullable)
  - `created_at` (timestamp)
  - Migration: `20260116100000_admin_audit_logs.sql`

### Backend
- [x] Create audit logging utility function (`lib/audit.ts`)
  - `logAdminAction()` - client-side logging
  - `logAdminActionServer()` - server-side logging
  - `createUpdateSnapshot()` - helper for before/after data
- [x] Integrate logging into all existing admin actions
  - BusinessActions: verify, unverify, feature, unfeature, delete
  - TourismActions: approve, unapprove, feature, unfeature, delete
  - RentalActions: feature, unfeature, approve, unapprove, dismiss_flag, delete
  - EventActions: feature, unfeature, delete
  - ReviewActions: delete
  - TimelineActions: approve, unapprove, delete

### Frontend
- [x] Create `/admin/audit-log` page
- [x] Filters: admin, action type, entity type, date range
- [x] Search by entity name
- [x] Pagination (25 items per page)
- [x] Added Audit Log link to admin sidebar

---

## Phase 2: User Suspend/Ban
**Status:** Completed

### Database
- [x] Add to `profiles` table:
  - `status` (enum: active, suspended, banned) default 'active'
  - `status_reason` (text, nullable)
  - `status_expires_at` (timestamp, nullable, for suspensions)
  - `status_updated_at` (timestamp, nullable)
  - `status_updated_by` (uuid, references profiles, nullable)
  - Migration: `20260116110000_user_status.sql`

### Backend
- [x] Create suspend user function (with expiry) - `lib/user-status.ts`
- [x] Create ban user function - `lib/user-status.ts`
- [x] Create reactivate user function - `lib/user-status.ts`
- [x] Add middleware to check user status on auth - `middleware.ts`
- [x] Handle content deletion options when banning (delete reviews, remove business ownership)

### Frontend
- [x] Update `/admin/users` page with actions
- [x] Add suspend dialog (reason + duration options: 1-90 days or indefinite)
- [x] Add ban dialog (reason + content removal options)
- [x] Add reactivate button for suspended/banned users
- [x] Show status badges on user list (`UserStatusBadge` component)
- [x] Create blocked user page/message - `/blocked`
- [x] Added status filter to users page
- [x] Added suspended/banned stats to users page

---

## Phase 3: Photo Flagging
**Status:** Completed

### Database
- [x] Add to `business_photos` table:
  - `flag_count` (integer, default 0)
  - `is_flagged` (boolean, default false)
  - Migration: `20260116120000_photo_flagging.sql`
- [x] Create `photo_flags` table (for tracking who flagged)
  - `id` (uuid)
  - `photo_id` (uuid, references business_photos)
  - `user_id` (uuid, references profiles)
  - `created_at` (timestamp)
  - Unique constraint on photo_id + user_id

### Backend
- [x] Create flag photo function (`lib/photo-flag.ts`)
  - `flagPhoto()` - allows authenticated users to flag photos
  - `hasUserFlaggedPhoto()` - check if user already flagged
  - `dismissPhotoFlags()` - admin function to dismiss all flags
  - `deletePhoto()` - admin function to delete flagged photos
- [x] Created PostgreSQL functions for flagging (`flag_photo`, `dismiss_photo_flags`)

### Frontend
- [x] Add flag button to business photos (public)
  - `PhotoFlagButton` component with confirmation dialog
  - `PhotoGallery` component with lightbox and flag buttons
  - `HeroPhotoFlagButton` for hero images
- [x] Create `/admin/photos` page for flagged photos
  - Grid view of flagged photos with previews
  - High priority alert for photos with 3+ flags
  - Filter by minimum flag count and search by business name
  - Stats cards for total, high priority, and pending
- [x] Admin actions: dismiss flag, delete photo (`PhotoActions` component)
- [x] Add flagged photos count to admin sidebar badge

---

## Phase 4: Category/Region Management
**Status:** Completed

### Database
- [x] Add `display_order` to `categories` if not exists
- [x] Add `display_order` to `regions` if not exists
- [x] Add RLS policies for admin CRUD operations
- [x] Create `reorder_category()` and `reorder_region()` functions
- [x] Migration: `20260116130000_category_region_management.sql`

### Frontend
- [x] Create `/admin/categories` page
  - List all categories with icons
  - Create new category form
  - Edit category (name, slug, icon, description)
  - Reorder via up/down buttons
  - Delete with protection (check for linked businesses)
  - Stats cards for total, with businesses, empty categories
  - Search functionality
- [x] Create `/admin/regions` page
  - List all regions with type badges (city, town, village, region)
  - Create new region form
  - Edit region (name, slug, type)
  - Reorder via up/down buttons
  - Delete with protection (check for linked businesses)
  - Filter by region type
  - Stats cards by region type
  - Search functionality
- [x] Add to admin sidebar (Categories and Regions links)

---

## Phase 5: Bulk Operations
**Status:** Completed

### Components
- [x] Create reusable `BulkActionBar` component (`components/admin/BulkSelection.tsx`)
- [x] Create `BulkSelectionProvider` context for managing selection state
- [x] Create `BulkSelectCheckbox` for individual row selection
- [x] Create `BulkSelectAllCheckbox` for selecting all items
- [x] Implement "select all on page" checkbox
- [x] Created bulk action utility functions (`lib/bulk-actions.ts`)

### Business Bulk Actions (`components/admin/BusinessList.tsx`)
- [x] Bulk verify
- [x] Bulk unverify
- [x] Bulk feature
- [x] Bulk unfeature
- [x] Bulk delete (with confirmation)

### Review Bulk Actions (`components/admin/ReviewList.tsx`)
- [x] Bulk delete (with confirmation)

### Tourism Bulk Actions (`components/admin/TourismList.tsx`)
- [x] Bulk approve
- [x] Bulk unapprove
- [x] Bulk feature
- [x] Bulk unfeature
- [x] Bulk delete (with confirmation)

### Rental Bulk Actions (`components/admin/RentalList.tsx`)
- [x] Bulk dismiss flags (with confirmation)
- [x] Bulk hide
- [x] Bulk show
- [x] Bulk feature
- [x] Bulk unfeature
- [x] Bulk delete (with confirmation)
- [x] Separate FlaggedRentalList component for flagged listings section

---

## Phase 6: Data Quality Reports
**Status:** Completed

### Backend
- [x] Create data quality query functions (`lib/data-quality.ts`)
  - `getIncompleteListings()` - finds businesses missing photos, short description, no hours, no phone
  - `getStaleListings()` - finds businesses not updated in 6/12 months
  - `getPotentialDuplicates()` - finds similar names in same region using Levenshtein distance
  - `getLowEngagementListings()` - finds businesses with 5 or fewer views after 30+ days
  - `getDataQualityStats()` - aggregated counts for all categories

### Frontend
- [x] Create `/admin/data-quality` page
- [x] Incomplete Listings section
  - Missing photos, short description, no hours, no phone, no category, no region
  - Combined severity score (0-6)
  - Color-coded badges for each issue type
  - Link to edit each listing
- [x] Stale Listings section
  - 6+ months (warning - yellow)
  - 12+ months (critical - red)
  - Last updated date and days since update shown
  - Grouped by severity level
- [x] Potential Duplicates section
  - Groups similar names using normalized string comparison
  - Shows region for each group
  - Displays verification status and view counts
  - Edit link for each listing
- [x] Low Engagement section
  - Businesses with 5 or fewer views after 30+ days
  - Shows view count and age of listing
  - Edit link for each listing
- [x] Tab-based navigation between sections
- [x] Stats overview cards at top
- [x] Critical alert banner for 12+ month stale listings

---

## Phase 7: Analytics Dashboard
**Status:** Completed

### Backend
- [x] Create analytics query functions (`lib/analytics.ts`)
  - `getOverviewMetrics()` - key metrics with comparison to previous period
  - `getViewsOverTime()` - views aggregated by day
  - `getRegistrationsOverTime()` - user registrations by day
  - `getReviewsByRating()` - review distribution by rating
  - `getCategoryPerformance()` - top categories by views
  - `getRegionPerformance()` - top regions by views
  - `getContactActionStats()` - WhatsApp clicks and inquiries
  - `exportAnalyticsCSV()` - generate CSV export
  - `getAllAnalytics()` - fetch all data at once
- [x] Views aggregation by time period
- [x] User registration trends
- [x] Review statistics
- [x] Category performance
- [x] Region performance
- [x] Contact action tracking (WhatsApp clicks, tourism/rental inquiries)

### Frontend
- [x] Replace `/admin/analytics` placeholder
- [x] Time period selector (7d, 30d, 90d)
- [x] Key metrics cards with % change
  - Total views
  - New businesses
  - New users
  - New reviews
  - Contact actions
- [x] Charts (using recharts library)
  - Views over time (line)
  - Registrations over time (line)
  - Reviews by rating (horizontal bar)
  - Top categories (progress bars)
  - Top regions (progress bars)
- [x] Contact actions breakdown section
- [x] Export data option (CSV via API route `/api/admin/analytics/export`)

---

## Sidebar Updates
- [x] Add Categories link
- [x] Add Regions link
- [x] Add Audit Log link
- [x] Add Data Quality link
- [x] Add Photos link (with badge for flagged count)
- [ ] Update Analytics link (remove "coming soon")

---

## Notes
- All admin actions should trigger audit logging after Phase 1 is complete
- Photo flagging uses single reason: "Inappropriate content"
- User status message format: "Account disabled for [reason]"
- Suspended users can have expiry dates; banned users are permanent
- When banning: admin chooses whether to delete reviews/remove business ownership
- Logs retained forever
- Stale thresholds: 6 months (warning), 12 months (critical)
- Incomplete = missing photos OR description < 50 chars OR no hours
