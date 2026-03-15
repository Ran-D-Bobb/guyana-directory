-- Follow Event Organisers
-- Allows users to follow event organisers (businesses or community users)
-- so their upcoming events appear on the homepage

-- Create followed_organisers table
create table if not exists followed_organisers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  business_id uuid references businesses(id) on delete cascade,
  organiser_user_id uuid references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  -- Exactly one of business_id or organiser_user_id must be set
  constraint followed_organisers_one_target check (
    (business_id is not null and organiser_user_id is null) or
    (business_id is null and organiser_user_id is not null)
  ),
  -- Unique follow per organiser type
  constraint followed_organisers_unique_business unique (user_id, business_id),
  constraint followed_organisers_unique_user unique (user_id, organiser_user_id)
);

-- Indexes
create index if not exists idx_followed_organisers_user_id on followed_organisers(user_id);
create index if not exists idx_followed_organisers_business_id on followed_organisers(business_id);
create index if not exists idx_followed_organisers_organiser_user_id on followed_organisers(organiser_user_id);

-- Enable RLS
alter table followed_organisers enable row level security;

-- RLS Policies
drop policy if exists "Users can view own followed organisers" on followed_organisers;
create policy "Users can view own followed organisers"
  on followed_organisers for select
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can follow organisers" on followed_organisers;
create policy "Users can follow organisers"
  on followed_organisers for insert
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can unfollow organisers" on followed_organisers;
create policy "Users can unfollow organisers"
  on followed_organisers for delete
  using ((select auth.uid()) = user_id);

-- Function: get upcoming events from followed organisers
create or replace function get_followed_organiser_events(p_user_id uuid, p_limit integer default 10)
returns table (
  event_id uuid,
  event_title text,
  event_slug text,
  event_image_url text,
  event_start_date timestamptz,
  event_end_date timestamptz,
  event_location text,
  event_is_featured boolean,
  event_interest_count integer,
  organiser_name text,
  organiser_slug text,
  organiser_type text,
  category_name text,
  category_icon text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    e.id as event_id,
    e.title as event_title,
    e.slug as event_slug,
    e.image_url as event_image_url,
    e.start_date as event_start_date,
    e.end_date as event_end_date,
    e.location as event_location,
    coalesce(e.is_featured, false) as event_is_featured,
    coalesce(e.interest_count, 0) as event_interest_count,
    case
      when fo.business_id is not null then b.name
      else p.name
    end as organiser_name,
    case
      when fo.business_id is not null then b.slug
      else null
    end as organiser_slug,
    case
      when fo.business_id is not null then 'business'
      else 'user'
    end as organiser_type,
    ec.name as category_name,
    ec.icon as category_icon
  from followed_organisers fo
  join events e on (
    (fo.business_id is not null and e.business_id = fo.business_id) or
    (fo.organiser_user_id is not null and e.user_id = fo.organiser_user_id)
  )
  left join businesses b on b.id = fo.business_id
  left join profiles p on p.id = fo.organiser_user_id
  left join event_categories ec on ec.id = e.category_id
  where fo.user_id = p_user_id
    and e.end_date > now()
  order by e.start_date asc
  limit p_limit;
$$;
