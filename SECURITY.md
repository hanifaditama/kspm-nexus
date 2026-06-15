# Security Operations

## Supported deployment

- Frontend: Vercel
- Authentication, database, storage, and Edge Functions: Supabase
- Account email delivery: Resend
- Package manager: npm with `package-lock.json`

Do not commit `.env`, service-role keys, Resend keys, salts, or SMTP credentials. Frontend `VITE_SUPABASE_*` values may contain only the publishable Supabase URL/key.

## Required Supabase settings

1. Enable leaked-password protection in **Authentication > Sign In / Providers > Password**.
2. Require a minimum password length of 8 characters.
3. Set email OTP/recovery-link expiry to no more than one hour.
4. Configure `${APP_URL}/reset-password` as an allowed redirect URL.
5. Store `RESEND_API_KEY`, `APP_URL`, `ACCOUNT_FROM_EMAIL`, `KSPM_EMAIL_DOMAIN`, `ACCOUNT_HASH_SALT`, `RATE_LIMIT_SALT`, and `ALLOWED_ORIGINS` as Edge Function secrets.
6. Keep `REQUIRE_ADMIN_AAL2=false` until the application has an MFA enrollment screen and the primary administrator has enrolled. Then set it to `true` and redeploy `create-member` and `remove-member`.

## Deployment order

1. Back up the Supabase database and `member-files` storage bucket.
2. Apply migrations with `supabase db push`.
3. Deploy `market-data`, `create-member`, `account-recovery`, and `remove-member`.
4. Deploy the frontend to Vercel.
5. Verify activation, recovery, shared files, access control, and password changes using test accounts.
6. Review CSP report-only violations in production. Move the policy from `Content-Security-Policy-Report-Only` to `Content-Security-Policy` only after required sources are confirmed.

## Incident response

If a server-side secret is exposed:

1. Rotate it immediately in Supabase, Resend, and Vercel as applicable.
2. Revoke affected user sessions and reset administrator credentials.
3. Review `security_audit_logs`, Edge Function logs, authentication logs, and Vercel logs.
4. Remove the secret from Git history only after rotation.
5. Record the affected period, actions taken, and follow-up controls.

The Supabase publishable key and project URL are public frontend configuration and do not require Git history rewriting. They still rely on correct RLS policies.
