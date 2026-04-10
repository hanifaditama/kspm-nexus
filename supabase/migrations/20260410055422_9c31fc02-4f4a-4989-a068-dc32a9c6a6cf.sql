
-- Create folders table
CREATE TABLE public.member_folders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  user_id UUID NOT NULL,
  parent_id UUID REFERENCES public.member_folders(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.member_folders ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Authenticated members can view folders"
ON public.member_folders FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Users can create folders"
ON public.member_folders FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own folders"
ON public.member_folders FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own folders"
ON public.member_folders FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- Add folder_id to member_files
ALTER TABLE public.member_files
ADD COLUMN folder_id UUID REFERENCES public.member_folders(id) ON DELETE SET NULL;
