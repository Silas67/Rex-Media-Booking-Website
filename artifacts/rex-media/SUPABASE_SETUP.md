# Connect Rex Media to Supabase

The site uses your Supabase project for booking data, private creative-file storage, and admin sign-in. No database or account credentials are included in this project.

## 1. Create the tables and storage bucket

1. Open your Supabase project and go to **SQL Editor**.
2. Open `supabase/schema.sql` from this project, paste the full script into a new query, and run it.
3. The script creates the screen inventory, bookings, booked-month availability, admin membership table, booking RPC, security policies, and a private `ad-creatives` bucket.

The script is safe to re-run for its policies, bucket settings, and initial inventory. The inventory insert does not overwrite prices you later edit.

## 2. Add the browser environment values

Copy `.env.example` to `.env.local` for local development and fill in:

- `VITE_SUPABASE_URL`: Project URL from **Project Settings → API**.
- `VITE_SUPABASE_ANON_KEY`: the publishable/anon key from **Project Settings → API**.

For the hosted app, add the same two variables to the app's environment/secrets settings before publishing. These are browser-side values, so the anon key is intentionally public; the SQL policies are what protect the data. **Never put a Supabase service-role key in a `VITE_` variable or in frontend code.**

## 3. Create an admin account

1. In Supabase, enable email/password sign-in and create your admin user under **Authentication → Users**.
2. Copy that user's ID.
3. In SQL Editor, run the following after replacing the UUID:

```sql
insert into public.admin_users (user_id)
values ('PASTE_ADMIN_USER_UUID_HERE')
on conflict (user_id) do nothing;
```

Only users in `admin_users` can read customer booking details, update payment status, or access private creative files through the site.

## Creative upload rules

The private bucket accepts MP4, MOV, JPG, JPEG, and PNG files up to 100 MB. Recommended video: 15 seconds, 1920 × 1080, H.264 MP4. The public booking flow can upload only into the `incoming/` path and cannot read uploaded files. Admin users can read and replace creatives.

## Business details to fill in

The brief did not include the resort name, actual venue address, contact number, WhatsApp number, social accounts, or bank-transfer details. Update `venueConfig` in `src/lib/config.ts` with real details before publishing. Use an international-format phone number for WhatsApp and full HTTPS URLs for social links. Do not enter bank information into the app until the correct account details are available.

The first version confirms the booking on-screen. It does not send email or process online payments; an admin updates payment status after confirming a bank transfer.