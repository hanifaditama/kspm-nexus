ALTER TABLE public.member_profiles
  ADD COLUMN IF NOT EXISTS recovery_email TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS member_profiles_recovery_email_unique_idx
  ON public.member_profiles (lower(recovery_email))
  WHERE recovery_email IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.account_recovery_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier_hash TEXT NOT NULL,
  ip_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.account_recovery_requests ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS account_recovery_identifier_created_idx
  ON public.account_recovery_requests (identifier_hash, created_at DESC);

CREATE INDEX IF NOT EXISTS account_recovery_ip_created_idx
  ON public.account_recovery_requests (ip_hash, created_at DESC);
