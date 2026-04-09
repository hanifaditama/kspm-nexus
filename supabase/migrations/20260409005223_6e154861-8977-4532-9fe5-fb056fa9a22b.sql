-- Create member profiles table (linked to auth.users)
CREATE TABLE public.member_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  can_upload BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.member_profiles ENABLE ROW LEVEL SECURITY;

-- Members can view their own profile
CREATE POLICY "Members can view own profile"
  ON public.member_profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Create member_files table
CREATE TABLE public.member_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  file_type TEXT,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.member_files ENABLE ROW LEVEL SECURITY;

-- All authenticated members can view files
CREATE POLICY "Authenticated members can view files"
  ON public.member_files FOR SELECT
  TO authenticated
  USING (true);

-- Only members with can_upload can insert files
CREATE POLICY "Uploaders can insert files"
  ON public.member_files FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.member_profiles
      WHERE user_id = auth.uid() AND can_upload = true
    )
  );

-- Only the uploader can delete their files
CREATE POLICY "Uploaders can delete own files"
  ON public.member_files FOR DELETE
  TO authenticated
  USING (uploaded_by = auth.uid());

-- Create storage bucket for member files
INSERT INTO storage.buckets (id, name, public)
VALUES ('member-files', 'member-files', false);

-- Storage policies
CREATE POLICY "Authenticated users can view member files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'member-files');

CREATE POLICY "Uploaders can upload member files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'member-files'
    AND EXISTS (
      SELECT 1 FROM public.member_profiles
      WHERE user_id = auth.uid() AND can_upload = true
    )
  );

CREATE POLICY "Uploaders can delete own member files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'member-files'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Auto-create profile on signup via trigger
CREATE OR REPLACE FUNCTION public.handle_new_member()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.member_profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_member();