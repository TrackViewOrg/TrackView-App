# Supabase Setup Handoff

Configure a new Supabase project so this app works without code changes.

After setup is complete, the app owner should only need to update these local environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL` if the app is not running on `http://localhost:3000`

## 1. Create the project

- [ ] Create a new Supabase project in the correct region.
- [ ] Send back the project URL and the anon/public key.
- [ ] Do not send the service role key for frontend app setup.

## 2. Configure auth

- [ ] Enable Email/Password auth.
- [ ] Keep email confirmation enabled.
- [ ] Enable TOTP MFA / authenticator app support.
- [ ] Add these redirect URLs in Supabase Auth:
- [ ] `http://localhost:3000/auth/callback`
- [ ] `http://127.0.0.1:3000/auth/callback`
- [ ] `https://YOUR-PRODUCTION-DOMAIN/auth/callback`
- [ ] `https://YOUR-PREVIEW-DOMAIN/auth/callback` if preview deployments are used
- [ ] Set the Site URL to the real app origin when production is ready.

## 3. Configure Google auth if the Google button should work

- [ ] Enable the Google provider in Supabase Auth.
- [ ] Configure the Google OAuth app with Supabase's callback URL:
- [ ] `https://<SUPABASE_PROJECT_REF>.supabase.co/auth/v1/callback`
- [ ] Test Google sign-in end to end.
- [ ] If Google auth is not configured, the Google sign-in button in the app will not work.

## 4. Create storage buckets

- [ ] Create a public bucket named `avatars`.
- [ ] Create a private bucket named `telemetry`.
- [ ] Make sure avatar files can be stored as `<user_id>.jpeg`.
- [ ] Make sure telemetry files can be stored as `<user_id>/<session_id>/<lap_number>.json`.

## 5. Create the database tables with these exact names

- [ ] `profiles`
- [ ] Columns: `id uuid primary key references auth.users(id) on delete cascade`, `display_name text`, `avatar_url text`, `plan text default 'DEFAULT'`, `created_at timestamptz default now()`, `updated_at timestamptz default now()`, `profile_visible boolean default false`
- [ ] Add a unique index for `lower(display_name)` if usernames must stay unique

- [ ] `games`
- [ ] Columns: `id uuid primary key default gen_random_uuid()`, `name text not null`, `image_url text`, `more_props jsonb`, `created_at timestamptz default now()`

- [ ] `cars`
- [ ] Columns: `id uuid primary key default gen_random_uuid()`, `internal_name text not null`, `display_name text not null`, `car_image text`, `more_props jsonb`, `created_at timestamptz default now()`

- [ ] `tracks`
- [ ] Columns: `id uuid primary key default gen_random_uuid()`, `internal_name text not null`, `display_name text not null`, `track_flag text`, `created_at timestamptz default now()`, `sectors jsonb`, `sections jsonb`, `drs_zones jsonb`

- [ ] `sessions`
- [ ] Columns: `id uuid primary key default gen_random_uuid()`, `user_id uuid not null references auth.users(id) on delete cascade`, `game_id uuid not null references games(id)`, `car_id uuid not null references cars(id)`, `track_id uuid not null references tracks(id)`, `best_lap_time double precision not null`, `gap_to_pb double precision not null default 0`, `total_laps integer not null default 0`, `weather_data jsonb`, `created_at timestamptz default now()`, `bookmarked boolean not null default false`

- [ ] `laps`
- [ ] Columns: `id uuid primary key default gen_random_uuid()`, `session_id uuid not null references sessions(id) on delete cascade`, `lap_number integer not null`, `lap_time double precision not null`, `telemetry_path text not null`, `is_valid boolean not null default true`, `created_at timestamptz default now()`, `sections jsonb`
- [ ] Add `unique(session_id, lap_number)`

## 6. Add the profile creation trigger

- [ ] On every new `auth.users` row, automatically insert a matching row into `public.profiles`
- [ ] `profiles.id = auth.users.id`
- [ ] `profiles.display_name = raw_user_meta_data->>'username'` when present
- [ ] If `username` is missing, fall back to the email prefix
- [ ] `profiles.plan = 'DEFAULT'`
- [ ] `profiles.profile_visible = false`
- [ ] `profiles.avatar_url = null`

## 7. Enable RLS and add policies

- [ ] Enable RLS on `profiles`
- [ ] Allow authenticated users to read and update only their own profile row

- [ ] Enable RLS on `sessions`
- [ ] Allow authenticated users to read, update, and delete only rows where `user_id = auth.uid()`
- [ ] If sessions are created from the app, also allow insert only when `user_id = auth.uid()`

- [ ] Enable RLS on `laps`
- [ ] Allow authenticated users to read only laps that belong to their own sessions

- [ ] Allow authenticated reads on `games`, `cars`, and `tracks`

- [ ] For storage bucket `avatars`, allow public reads and allow authenticated users to write only their own avatar object
- [ ] For storage bucket `telemetry`, do not make it public
- [ ] For storage bucket `telemetry`, allow authenticated users to read only objects inside their own `<user_id>/...` folder

## 8. Seed or migrate data before handoff

- [ ] If this new project is replacing an old one, migrate all existing data:
- [ ] `profiles`
- [ ] `games`
- [ ] `cars`
- [ ] `tracks`
- [ ] `sessions`
- [ ] `laps`
- [ ] storage objects from `avatars`
- [ ] storage objects from `telemetry`

- [ ] If this is a brand-new empty project, at minimum seed `games`, `cars`, and `tracks`
- [ ] `tracks.internal_name` and `tracks.sections` must be populated for the track map to work correctly

## 9. Verify the full flow before handing it back

- [ ] Email signup works
- [ ] Email verification lands on `/auth/callback` and reaches the app correctly
- [ ] Forgot password lands on `/auth/callback` and then `/update-password`
- [ ] MFA enrollment and MFA verification work
- [ ] Avatar upload works and returns a public URL from `avatars`
- [ ] A test user can load sessions
- [ ] A test session can load laps
- [ ] Telemetry JSON downloads correctly from the private `telemetry` bucket
- [ ] Google sign-in works if Google auth was configured

## 10. Handoff back to app owner

- [ ] Send the Supabase project URL
- [ ] Send the anon/public key
- [ ] Confirm whether Google auth was configured
- [ ] Confirm whether old data was migrated or if this project is empty except for seed data
- [ ] Confirm the redirect URLs, storage buckets, tables, trigger, and RLS policies are done

