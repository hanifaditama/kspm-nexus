ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS registration_url TEXT;

ALTER TABLE public.events
  DROP CONSTRAINT IF EXISTS events_registration_url_valid;

ALTER TABLE public.events
  ADD CONSTRAINT events_registration_url_valid
  CHECK (
    registration_url IS NULL
    OR registration_url ~* '^https?://[^\s]+$'
  );
