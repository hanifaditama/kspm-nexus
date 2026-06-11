-- Contact submissions are written only by the contact Edge Function using service_role.
CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 2 AND 100),
  email TEXT NOT NULL CHECK (char_length(email) <= 254),
  message TEXT NOT NULL CHECK (char_length(message) BETWEEN 10 AND 5000),
  ip_hash TEXT NOT NULL,
  email_sent BOOLEAN NOT NULL DEFAULT false,
  delivery_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view contact submissions"
  ON public.contact_submissions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX contact_submissions_ip_created_idx
  ON public.contact_submissions (ip_hash, created_at DESC);

DROP POLICY IF EXISTS "Uploaders can insert files" ON public.member_files;
CREATE POLICY "Uploaders can insert own files"
  ON public.member_files FOR INSERT TO authenticated
  WITH CHECK (
    uploaded_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.member_profiles
      WHERE user_id = auth.uid() AND can_upload = true
    )
  );

DROP POLICY IF EXISTS "Uploaders can upload member files" ON storage.objects;
CREATE POLICY "Uploaders can upload own member files"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'member-files'
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND EXISTS (
      SELECT 1 FROM public.member_profiles
      WHERE user_id = auth.uid() AND can_upload = true
    )
  );

DROP POLICY IF EXISTS "Users can create folders" ON public.member_folders;
CREATE POLICY "Users can create own folders"
  ON public.member_folders FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND (
      parent_id IS NULL
      OR EXISTS (
        SELECT 1 FROM public.member_folders parent
        WHERE parent.id = parent_id AND parent.user_id = auth.uid()
      )
    )
  );
