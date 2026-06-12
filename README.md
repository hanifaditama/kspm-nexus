# KSPM Nexus

KSPM Nexus is the public website, member file manager, and admin content panel for KSPM UPH. The main app uses Vite, React, TypeScript, Supabase, and React Query. `kspm-content/` is a separate legacy Sanity Studio and is not used by the current public content flow.

## Local setup

1. Copy `.env.example` to `.env`.
2. Set the frontend-safe `VITE_SUPABASE_*` values. Use only the Supabase anon/publishable key in the frontend.
3. Install and run:

```bash
npm install
npm run dev
```

## Verification

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Supabase deployment

Apply migrations and deploy the Edge Functions with the Supabase CLI:

```bash
supabase db push
supabase functions deploy market-data
supabase functions deploy create-member
supabase functions deploy account-recovery
supabase secrets set RESEND_API_KEY=... APP_URL=... KSPM_EMAIL_DOMAIN=kspm.uph.edu ACCOUNT_FROM_EMAIL=... ACCOUNT_HASH_SALT=...
```

Administrators can create member accounts from **Admin > Access Control**. The account uses a KSPM login email and a separate recovery email. Initial credentials and custom password recovery links are delivered to the recovery email through Resend. New members must replace their temporary password on first sign-in. `APP_URL` must match the deployed frontend URL, and `ACCOUNT_FROM_EMAIL` must use a sender/domain verified in Resend.

Add `${APP_URL}/reset-password` to the Supabase Auth redirect URL allow list so generated recovery links can open the password form.

The market ticker uses free public Yahoo Finance chart data through the `market-data` Edge Function, cached for 60 seconds. IDX top gainers are calculated from the liquid-stock watchlist in the function and are not a full-exchange ranking.

## Security notes

- `.env` is ignored and must never be committed.
- Rotate any Supabase key that previously appeared in Git history.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` in a `VITE_` variable or frontend deployment setting.
- Admin CRUD access is enforced by both frontend route guards and Supabase RLS.
- Public `USING (true)` policies are limited to intentionally public-read content. Member files and folders remain readable only to authenticated members.

## Sanity Studio

The `kspm-content/` directory is a separate Sanity Studio retained for historical content work. The current app reads and writes articles, events, programs, and team members through Supabase. Decide whether to archive the Studio before removing it.
