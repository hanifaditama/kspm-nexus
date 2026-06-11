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

Apply migrations and deploy the contact function with the Supabase CLI:

```bash
supabase db push
supabase functions deploy contact
supabase secrets set RESEND_API_KEY=... CONTACT_FROM_EMAIL=... CONTACT_HASH_SALT=...
```

`CONTACT_FROM_EMAIL` must use a sender/domain verified in Resend. Contact messages are sent to `investment.club@uph.edu`. If Resend is not configured, valid messages are still stored in `contact_submissions` and the UI clearly reports that email delivery is awaiting configuration.

## Security notes

- `.env` is ignored and must never be committed.
- Rotate any Supabase key that previously appeared in Git history.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` in a `VITE_` variable or frontend deployment setting.
- Admin CRUD access is enforced by both frontend route guards and Supabase RLS.
- Public `USING (true)` policies are limited to intentionally public-read content. Member files and folders remain readable only to authenticated members.

## Sanity Studio

The `kspm-content/` directory is a separate Sanity Studio retained for historical content work. The current app reads and writes articles, events, programs, and team members through Supabase. Decide whether to archive the Studio before removing it.
