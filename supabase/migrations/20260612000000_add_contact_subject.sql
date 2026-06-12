ALTER TABLE public.contact_submissions
  ADD COLUMN IF NOT EXISTS subject TEXT NOT NULL DEFAULT 'General inquiry'
  CHECK (char_length(subject) BETWEEN 3 AND 160);
