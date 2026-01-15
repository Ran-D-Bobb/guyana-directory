-- Phase 9F: Follow Categories
-- Allows users to follow specific categories for updates

-- Create followed_categories table
create table if not exists followed_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  category_id uuid references categories(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(user_id, category_id)
);

-- Create indexes for fast lookups
create index if not exists idx_followed_categories_user_id on followed_categories(user_id);
create index if not exists idx_followed_categories_category_id on followed_categories(category_id);

-- Enable RLS
alter table followed_categories enable row level security;

-- RLS Policies
-- Users can view their own followed categories
create policy "Users can view own followed categories"
  on followed_categories for select
  using (auth.uid() = user_id);

-- Users can follow categories (insert)
create policy "Users can follow categories"
  on followed_categories for insert
  with check (auth.uid() = user_id);

-- Users can unfollow categories (delete)
create policy "Users can unfollow categories"
  on followed_categories for delete
  using (auth.uid() = user_id);

-- Function to get count of new businesses in a category this week
create or replace function get_new_businesses_this_week(p_category_id uuid)
returns integer
language sql
stable
as $$
  select count(*)::integer
  from businesses
  where category_id = p_category_id
    and created_at >= now() - interval '7 days';
$$;

-- Function to get user's followed categories with new business counts
create or replace function get_followed_categories_with_counts(p_user_id uuid)
returns table (
  category_id uuid,
  category_name text,
  category_slug text,
  category_icon text,
  new_this_week integer,
  followed_at timestamptz
)
language sql
stable
security definer
as $$
  select
    c.id as category_id,
    c.name as category_name,
    c.slug as category_slug,
    c.icon as category_icon,
    get_new_businesses_this_week(c.id) as new_this_week,
    fc.created_at as followed_at
  from followed_categories fc
  join categories c on c.id = fc.category_id
  where fc.user_id = p_user_id
  order by fc.created_at desc;
$$;
