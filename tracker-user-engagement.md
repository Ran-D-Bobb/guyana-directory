# User Engagement & Sign-Up Incentives Tracker

**Goal:** Add features that give regular users reasons to create accounts and return to the app

## Current Auth-Gated Features (Baseline)
- Write/edit/delete reviews on businesses
- Mark events as "Interested"
- Create listings (businesses, events, tourism, rentals)
- Access dashboard pages

---

## Phase 9A: Save/Favorite Businesses ✅
**Priority: HIGH | Effort: LOW | Impact: HIGH**

Create a simple favorites system for businesses.

### Database
- ✅ Create `saved_businesses` table
  ```sql
  create table saved_businesses (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references profiles(id) on delete cascade,
    business_id uuid references businesses(id) on delete cascade,
    created_at timestamptz default now(),
    unique(user_id, business_id)
  );
  ```
- ✅ Add RLS policies (users can manage own saves)
- ✅ Create index on user_id for fast lookups

### Components
- ✅ **SaveBusinessButton.tsx** - Heart icon toggle
  - Outline when not saved, filled when saved
  - Optimistic UI update
  - Sign-in prompt for anonymous users (redirects to home)
  - Reusable across BusinessCard and business detail page
  - Multiple variants: icon, icon-label, overlay
- ✅ Update **BusinessCard.tsx** - Add save button overlay
- ✅ Update **BusinessesPageClient.tsx** - Add save button to cards
- ✅ Update **business detail page** - Add save button to sidebar and mobile quick actions

### Pages
- ✅ **/dashboard/favorites** - Saved businesses page
  - Grid of saved businesses (BusinessCard components)
  - Empty state: "You haven't saved any businesses yet"
  - Remove from favorites button
  - Sorted by: Recently saved

### User Menu
- ✅ Add "My Favorites" link to UserMenu dropdown
  - Heart icon (rose color on hover)
  - Between "My Business" and "My Events"

---

## Phase 9B: Helpful Votes on Reviews ✅
**Priority: HIGH | Effort: LOW | Impact: MEDIUM**

Note: Database table `review_helpful_votes` already exists (Phase 1B.5.1).

### Components
- ✅ Verify **HelpfulVoteButtons.tsx** exists and works (in `ReviewItem.tsx`)
  - Thumbs up / thumbs down buttons
  - Vote count display
  - One vote per user per review
  - Users can change their vote
- ✅ Ensure votes display on business detail page reviews
- ✅ Add sign-in prompt for anonymous users trying to vote (dialog modal)

### Enhancements
- ✅ Sort reviews by "Most Helpful" option (via `ReviewList.tsx` dropdown)
- ✅ Show "X people found this helpful" text

---

## Phase 9C: Reviewer Badges & Reputation ✅
**Priority: MEDIUM | Effort: MEDIUM | Impact: HIGH**

Gamify the review system with badges.

### Database
- ✅ Add `review_count` field to profiles table (auto-updated via trigger)
- ✅ Create function to calculate badge based on review count
  - 0 reviews: No badge
  - 1-2 reviews: "Newcomer" (bronze)
  - 3-5 reviews: "Contributor" (silver)
  - 6-9 reviews: "Local Expert" (gold)
  - 10+ reviews: "Top Reviewer" (platinum)
- ✅ Database functions: `get_reviewer_badge()`, `get_reviews_to_next_badge()`
- ✅ Trigger to auto-update profile review_count on insert/delete

### Components
- ✅ **ReviewerBadge.tsx** - Badge display component
  - Icon + label (Star, Award, Trophy, Crown for tiers)
  - Color based on tier (bronze, silver, gold, platinum)
  - Tooltip with description ("Wrote 5+ reviews")
  - Helper functions: `getBadgeFromReviewCount()`, `getBadgeProgress()`
- ✅ **BadgeProgressCard.tsx** - Badge progress card for profile page
  - Shows current badge and progress to next tier
  - Visual progress bar
  - All badge tiers display with unlock status
- ✅ Update **ReviewItem.tsx** to show badge next to reviewer name
- ✅ Update **ReviewList.tsx** to pass review_count to ReviewItem
- ✅ Update profile page to show current badge and progress to next

### Gamification
- ✅ Show "X more reviews to reach [Next Badge]" on profile
- ⬜ Celebration animation when badge is earned (optional - deferred)

---

## Phase 9D: Recently Viewed History ✅
**Priority: MEDIUM | Effort: LOW | Impact: MEDIUM**

Track and display user's browsing history.

### Implementation (Local Storage Approach)
- ✅ Create `useRecentlyViewed` hook
  - Store last 20 viewed items in localStorage
  - Item structure: `{ type, id, slug, name, image, viewedAt }`
  - Types: business, event, tourism, rental
- ✅ Update detail pages to record views
  - Business detail: Add to recently viewed on mount
  - Event detail: Add to recently viewed on mount
  - Tourism detail: Add to recently viewed on mount
  - Rental detail: Add to recently viewed on mount

### Components
- ✅ **RecentlyViewed.tsx** - Horizontal scroll component
  - Shows last 10 items
  - Small cards with image, name, type badge
  - "Clear history" button
- ✅ Add to homepage (below filter bar)
- ⬜ Add to dashboard home (optional - deferred)

---

## Phase 9E: Personalized Homepage ✅
**Priority: LOW | Effort: MEDIUM | Impact: HIGH**

Show personalized recommendations based on user activity.

### Prerequisites
- Phase 9A (Saved Businesses) - for preference signals ✅
- Phase 9D (Recently Viewed) - for browsing signals ✅

### Algorithm
- ✅ Create `getRecommendations` function (`lib/recommendations.ts`)
  - Input: user_id, recentlyViewedCategories
  - Analyze: saved business categories (weight 3), reviewed business categories (weight 2), recently viewed categories (weight 1)
  - Output: weighted list of recommended businesses
- ✅ Fallback to featured/popular if no activity data

### Components
- ✅ **ForYouSection.tsx** (`components/home/ForYouSection.tsx`) - Personalized recommendations
  - "Recommended for You" header with sparkles icon
  - 6 businesses based on preferences (configurable)
  - "Based on your interest in [Category]" subtitle
  - Shows for signed-in users with activity OR anonymous users with recently viewed history
  - Sign-in prompt for anonymous users
- ✅ API route: `/api/recommendations` - Server-side recommendation fetching
- ✅ Add to homepage (between RecentlyViewed and UnifiedFeed)

---

## Phase 9F: Follow Categories ✅
**Priority: LOW | Effort: MEDIUM | Impact: MEDIUM**

Let users follow specific categories for updates.

### Database
- ✅ Create `followed_categories` table
  ```sql
  create table followed_categories (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references profiles(id) on delete cascade,
    category_id uuid references categories(id) on delete cascade,
    created_at timestamptz default now(),
    unique(user_id, category_id)
  );
  ```
- ✅ Add RLS policies
- ✅ Create `get_new_businesses_this_week()` function
- ✅ Create `get_followed_categories_with_counts()` function

### Components
- ✅ **FollowCategoryButton.tsx** - Follow/unfollow toggle
  - Bell icon with multiple variants (icon, icon-label, pill, compact)
  - Add to category pages (desktop and mobile headers)
  - Optimistic UI updates
  - Sign-in redirect for anonymous users
- ✅ **FollowedCategories.tsx** - List of followed categories
  - Multiple variants (grid, list, compact)
  - Show on profile/dashboard
  - Quick unfollow option
  - Shows "X new this week" for each category
- ✅ **NewInCategories.tsx** - Homepage section for followed categories
  - Shows new businesses from each followed category
  - Displays business cards with "New" badge
  - Link to view all businesses in category

### Features
- ✅ "New in [Category]" section on homepage for followers
- ✅ Show "X new businesses this week" count
- ✅ Followed categories display on profile page

---

## Implementation Priority Order

| Phase | Feature | Effort | Impact | Status |
|-------|---------|--------|--------|--------|
| 9A | Save/Favorite Businesses | Low | High | ✅ |
| 9B | Helpful Votes (verify) | Low | Medium | ✅ |
| 9C | Reviewer Badges | Medium | High | ✅ |
| 9D | Recently Viewed | Low | Medium | ✅ |
| 9E | Personalized Homepage | Medium | High | ✅ |
| 9F | Follow Categories | Medium | Medium | ✅ |

---

## Success Metrics
- **Sign-up conversion rate** increase (target: +20%)
- **Return user rate** increase (target: +30%)
- **Average session duration** increase
- **Reviews per user** increase
- **Favorites per user** (new metric, target: 5+ avg)
