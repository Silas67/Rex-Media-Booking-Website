-- Rex Media booking schema for a Supabase project.
-- Run this once in Supabase Dashboard > SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.screen_sections (
  key text primary key check (
    key in ('live-band-led', 'dj-section-led', 'lounge-led-1', 'lounge-led-2')
  ),
  name text not null,
  monthly_price_ngn integer not null check (monthly_price_ngn > 0),
  pilot_price_ngn integer check (pilot_price_ngn is null or pilot_price_ngn > 0),
  plays_per_day integer not null default 100 check (plays_per_day > 0),
  ad_duration_seconds integer not null default 15 check (ad_duration_seconds > 0),
  runtime_hours numeric(4, 2) not null default 9 check (runtime_hours > 0),
  display_order smallint not null
);

insert into public.screen_sections (
  key, name, monthly_price_ngn, pilot_price_ngn, plays_per_day,
  ad_duration_seconds, runtime_hours, display_order
) values
  ('live-band-led', 'Live Band LED', 800000, 400000, 100, 15, 9, 1),
  ('dj-section-led', 'DJ Section LED', 500000, 250000, 100, 15, 9, 2),
  ('lounge-led-1', 'Lounge LED — Screen 1', 800000, null, 100, 15, 9, 3),
  ('lounge-led-2', 'Lounge LED — Screen 2', 800000, null, 100, 15, 9, 4)
on conflict (key) do nothing;

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  section_key text not null references public.screen_sections(key),
  company_name text not null,
  contact_person text not null,
  phone text not null,
  email text not null,
  creative_path text not null,
  creative_filename text not null,
  monthly_price_ngn integer not null check (monthly_price_ngn > 0),
  total_price_ngn integer not null check (total_price_ngn > 0),
  payment_status text not null default 'unpaid'
    check (payment_status in ('unpaid', 'paid')),
  booking_status text not null default 'pending'
    check (booking_status in ('pending', 'confirmed', 'cancelled')),
  created_at timestamptz not null default now()
);

create table if not exists public.booking_months (
  booking_id uuid not null references public.bookings(id) on delete cascade,
  section_key text not null references public.screen_sections(key),
  month_start date not null check (
    month_start = date_trunc('month', month_start)::date
  ),
  primary key (booking_id, month_start),
  unique (section_key, month_start)
);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.screen_sections enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_months enable row level security;
alter table public.admin_users enable row level security;

grant select on public.screen_sections to anon, authenticated;
grant select (section_key, month_start) on public.booking_months to anon;
grant select on public.booking_months to authenticated;
grant select on public.bookings to authenticated;
grant update (payment_status, booking_status, creative_path, creative_filename)
  on public.bookings to authenticated;
grant select on public.admin_users to authenticated;

create or replace function public.is_rex_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  );
$$;

revoke all on function public.is_rex_admin() from public;
grant execute on function public.is_rex_admin() to authenticated;

drop policy if exists "Anyone can view screen sections" on public.screen_sections;
create policy "Anyone can view screen sections"
  on public.screen_sections for select
  to anon, authenticated
  using (true);

drop policy if exists "Anyone can view booked month pairs" on public.booking_months;
create policy "Anyone can view booked month pairs"
  on public.booking_months for select
  to anon
  using (true);

drop policy if exists "Admins can view booking months" on public.booking_months;
create policy "Admins can view booking months"
  on public.booking_months for select
  to authenticated
  using (public.is_rex_admin());

drop policy if exists "Admins can view bookings" on public.bookings;
create policy "Admins can view bookings"
  on public.bookings for select
  to authenticated
  using (public.is_rex_admin());

drop policy if exists "Admins can update bookings" on public.bookings;
create policy "Admins can update bookings"
  on public.bookings for update
  to authenticated
  using (public.is_rex_admin())
  with check (public.is_rex_admin());

drop policy if exists "Users can see their own admin membership" on public.admin_users;
create policy "Users can see their own admin membership"
  on public.admin_users for select
  to authenticated
  using (user_id = auth.uid());

create or replace function public.create_booking(
  section_key text,
  month_starts date[],
  company_name text,
  contact_person text,
  phone text,
  email text,
  creative_path text,
  creative_filename text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
#variable_conflict use_variable
declare
  booking_uuid uuid;
  rate_ngn integer;
  selected_month_count integer;
  distinct_month_count integer;
  selected_month date;
begin
  if month_starts is null or cardinality(month_starts) < 1
    or cardinality(month_starts) > 12 then
    raise exception 'Select between 1 and 12 months.';
  end if;

  selected_month_count := cardinality(month_starts);

  select count(distinct picked.month_start)::integer
    into distinct_month_count
    from unnest(month_starts) as picked(month_start);

  if distinct_month_count <> selected_month_count then
    raise exception 'A month was selected more than once.';
  end if;

  if exists (
    select 1
    from unnest(month_starts) as picked(month_start)
    where picked.month_start is null
      or picked.month_start <> date_trunc('month', picked.month_start)::date
  ) then
    raise exception 'Months must use the first day of each month.';
  end if;

  select coalesce(sections.pilot_price_ngn, sections.monthly_price_ngn)
    into rate_ngn
    from public.screen_sections as sections
    where sections.key = section_key;

  if rate_ngn is null then
    raise exception 'The selected screen section is not available.';
  end if;

  if length(trim(company_name)) not between 1 and 180
    or length(trim(contact_person)) not between 1 and 140
    or length(trim(phone)) not between 5 and 40
    or length(trim(email)) not between 3 and 254
    or email !~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    or creative_path not like 'incoming/%'
    or length(trim(creative_filename)) not between 1 and 255 then
    raise exception 'Check the company, contact, email, and creative details.';
  end if;

  insert into public.bookings (
    section_key, company_name, contact_person, phone, email,
    creative_path, creative_filename, monthly_price_ngn, total_price_ngn
  ) values (
    section_key, trim(company_name), trim(contact_person), trim(phone), lower(trim(email)),
    creative_path, trim(creative_filename), rate_ngn, rate_ngn * selected_month_count
  )
  returning id into booking_uuid;

  foreach selected_month in array month_starts loop
    insert into public.booking_months (booking_id, section_key, month_start)
    values (booking_uuid, section_key, selected_month);
  end loop;

  return jsonb_build_object(
    'booking_id', booking_uuid,
    'total_price_ngn', rate_ngn * selected_month_count
  );
exception
  when unique_violation then
    raise exception 'One or more selected months were just booked. Refresh availability and try again.'
      using errcode = '23505';
end;
$$;

revoke all on function public.create_booking(
  text, date[], text, text, text, text, text, text
) from public;
grant execute on function public.create_booking(
  text, date[], text, text, text, text, text, text
) to anon, authenticated;

insert into storage.buckets (
  id, name, public, file_size_limit, allowed_mime_types
) values (
  'ad-creatives',
  'ad-creatives',
  false,
  104857600,
  array['video/mp4', 'video/quicktime', 'image/jpeg', 'image/png']
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can upload incoming ad creatives" on storage.objects;
create policy "Public can upload incoming ad creatives"
  on storage.objects for insert
  to anon
  with check (
    bucket_id = 'ad-creatives'
    and name like 'incoming/%'
    and lower(storage.extension(name)) in ('mp4', 'mov', 'jpg', 'jpeg', 'png')
  );

drop policy if exists "Public can remove incoming ad creatives" on storage.objects;
create policy "Public can remove incoming ad creatives"
  on storage.objects for delete
  to anon
  using (bucket_id = 'ad-creatives' and name like 'incoming/%');

drop policy if exists "Admins can read ad creatives" on storage.objects;
create policy "Admins can read ad creatives"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'ad-creatives' and public.is_rex_admin());

drop policy if exists "Admins can upload ad creatives" on storage.objects;
create policy "Admins can upload ad creatives"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'ad-creatives'
    and public.is_rex_admin()
    and lower(storage.extension(name)) in ('mp4', 'mov', 'jpg', 'jpeg', 'png')
  );

drop policy if exists "Admins can replace ad creatives" on storage.objects;
create policy "Admins can replace ad creatives"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'ad-creatives' and public.is_rex_admin())
  with check (bucket_id = 'ad-creatives' and public.is_rex_admin());

drop policy if exists "Admins can delete ad creatives" on storage.objects;
create policy "Admins can delete ad creatives"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'ad-creatives' and public.is_rex_admin());