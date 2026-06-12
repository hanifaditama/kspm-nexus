ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS recruitment_eyebrow TEXT NOT NULL DEFAULT 'Now Accepting Applications',
  ADD COLUMN IF NOT EXISTS recruitment_title TEXT NOT NULL DEFAULT 'Open Recruitment CMP Division 2026',
  ADD COLUMN IF NOT EXISTS recruitment_description TEXT NOT NULL DEFAULT 'Join KSPM and kickstart your journey in capital markets. We''re looking for passionate, curious students ready to learn and grow.',
  ADD COLUMN IF NOT EXISTS recruitment_deadline DATE DEFAULT '2026-04-12',
  ADD COLUMN IF NOT EXISTS recruitment_requirements TEXT[] NOT NULL DEFAULT ARRAY[
    'Active university student (any major welcome)',
    'Minimum GPA of 3.00 out of 4.00',
    'Strong interest in capital markets, finance, or economics',
    'Committed to attend programs and activities for at least one academic year',
    'Willing to learn, collaborate, and contribute to the organization',
    'No prior finance experience required - we''ll teach you everything'
  ],
  ADD COLUMN IF NOT EXISTS recruitment_application_url TEXT;
