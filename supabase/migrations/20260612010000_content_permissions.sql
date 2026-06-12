ALTER TABLE public.member_profiles
  ADD COLUMN IF NOT EXISTS email TEXT;

UPDATE public.member_profiles AS profile
SET email = users.email
FROM auth.users AS users
WHERE profile.user_id = users.id
  AND profile.email IS NULL;

CREATE TABLE IF NOT EXISTS public.user_content_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permission TEXT NOT NULL CHECK (permission IN ('recruitment', 'articles', 'events', 'team', 'programs')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, permission)
);

GRANT SELECT, INSERT, DELETE ON public.user_content_permissions TO authenticated;

ALTER TABLE public.user_content_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_content_permissions REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_content_permissions;

CREATE OR REPLACE FUNCTION public.has_content_permission(_user_id UUID, _permission TEXT)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT
    public.has_role(_user_id, 'admin')
    OR EXISTS (
      SELECT 1
      FROM public.user_content_permissions
      WHERE user_id = _user_id AND permission = _permission
    )
$$;

REVOKE ALL ON FUNCTION public.has_content_permission(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_content_permission(UUID, TEXT) TO authenticated;

CREATE POLICY "Users can view own content permissions"
  ON public.user_content_permissions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all content permissions"
  ON public.user_content_permissions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage content permissions"
  ON public.user_content_permissions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all member profiles"
  ON public.member_profiles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.handle_new_member()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.member_profiles (user_id, display_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email), NEW.email);
  RETURN NEW;
END;
$$;

DROP POLICY IF EXISTS "Admins manage articles" ON public.articles;
CREATE POLICY "Authorized users manage articles" ON public.articles FOR ALL TO authenticated
  USING (public.has_content_permission(auth.uid(), 'articles'))
  WITH CHECK (public.has_content_permission(auth.uid(), 'articles'));

DROP POLICY IF EXISTS "Admins manage events" ON public.events;
CREATE POLICY "Authorized users manage events" ON public.events FOR ALL TO authenticated
  USING (public.has_content_permission(auth.uid(), 'events'))
  WITH CHECK (public.has_content_permission(auth.uid(), 'events'));

DROP POLICY IF EXISTS "Admins manage team" ON public.team_members;
CREATE POLICY "Authorized users manage team" ON public.team_members FOR ALL TO authenticated
  USING (public.has_content_permission(auth.uid(), 'team'))
  WITH CHECK (public.has_content_permission(auth.uid(), 'team'));

DROP POLICY IF EXISTS "Admins manage programs" ON public.programs;
CREATE POLICY "Authorized users manage programs" ON public.programs FOR ALL TO authenticated
  USING (public.has_content_permission(auth.uid(), 'programs'))
  WITH CHECK (public.has_content_permission(auth.uid(), 'programs'));

DROP POLICY IF EXISTS "Admins manage settings" ON public.site_settings;
CREATE POLICY "Authorized users manage settings" ON public.site_settings FOR ALL TO authenticated
  USING (public.has_content_permission(auth.uid(), 'recruitment'))
  WITH CHECK (public.has_content_permission(auth.uid(), 'recruitment'));

DROP POLICY IF EXISTS "Admins upload content images" ON storage.objects;
CREATE POLICY "Authorized users upload content images" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'content-images'
    AND (
      public.has_content_permission(auth.uid(), 'articles')
      OR public.has_content_permission(auth.uid(), 'events')
      OR public.has_content_permission(auth.uid(), 'team')
      OR public.has_content_permission(auth.uid(), 'programs')
    )
  );

DROP POLICY IF EXISTS "Admins update content images" ON storage.objects;
CREATE POLICY "Authorized users update content images" ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'content-images'
    AND (
      public.has_content_permission(auth.uid(), 'articles')
      OR public.has_content_permission(auth.uid(), 'events')
      OR public.has_content_permission(auth.uid(), 'team')
      OR public.has_content_permission(auth.uid(), 'programs')
    )
  );

DROP POLICY IF EXISTS "Admins delete content images" ON storage.objects;
CREATE POLICY "Authorized users delete content images" ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'content-images'
    AND (
      public.has_content_permission(auth.uid(), 'articles')
      OR public.has_content_permission(auth.uid(), 'events')
      OR public.has_content_permission(auth.uid(), 'team')
      OR public.has_content_permission(auth.uid(), 'programs')
    )
  );
