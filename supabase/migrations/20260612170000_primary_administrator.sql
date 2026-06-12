CREATE TABLE public.primary_administrator (
  id TEXT PRIMARY KEY DEFAULT 'main' CHECK (id = 'main'),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE RESTRICT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.primary_administrator (id, user_id)
SELECT 'main', user_id
FROM public.user_roles
WHERE role = 'admin'
ORDER BY created_at
LIMIT 1;

ALTER TABLE public.primary_administrator ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_primary_administrator(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.primary_administrator
    WHERE id = 'main' AND user_id = _user_id
  )
$$;

REVOKE ALL ON FUNCTION public.is_primary_administrator(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_primary_administrator(UUID) TO authenticated;

CREATE POLICY "Primary administrator can view own assignment"
  ON public.primary_administrator FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
CREATE POLICY "Primary administrator can view all roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (public.is_primary_administrator(auth.uid()));
CREATE POLICY "Primary administrator can manage roles"
  ON public.user_roles FOR ALL TO authenticated
  USING (public.is_primary_administrator(auth.uid()))
  WITH CHECK (public.is_primary_administrator(auth.uid()));

DROP POLICY IF EXISTS "Admins can view all content permissions" ON public.user_content_permissions;
DROP POLICY IF EXISTS "Admins can manage content permissions" ON public.user_content_permissions;
CREATE POLICY "Primary administrator can view all content permissions"
  ON public.user_content_permissions FOR SELECT TO authenticated
  USING (public.is_primary_administrator(auth.uid()));
CREATE POLICY "Primary administrator can manage content permissions"
  ON public.user_content_permissions FOR ALL TO authenticated
  USING (public.is_primary_administrator(auth.uid()))
  WITH CHECK (public.is_primary_administrator(auth.uid()));

DROP POLICY IF EXISTS "Admins can view all member profiles" ON public.member_profiles;
CREATE POLICY "Primary administrator can view all member profiles"
  ON public.member_profiles FOR SELECT TO authenticated
  USING (public.is_primary_administrator(auth.uid()));

CREATE OR REPLACE FUNCTION public.transfer_primary_administrator(_target_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  current_primary UUID;
BEGIN
  IF NOT public.is_primary_administrator(auth.uid()) THEN
    RAISE EXCEPTION 'Only the primary administrator can transfer ownership';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.member_profiles WHERE user_id = _target_user_id) THEN
    RAISE EXCEPTION 'The selected member does not exist';
  END IF;

  SELECT user_id INTO current_primary
  FROM public.primary_administrator
  WHERE id = 'main'
  FOR UPDATE;

  IF current_primary = _target_user_id THEN
    RETURN;
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (_target_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;

  UPDATE public.primary_administrator
  SET user_id = _target_user_id, updated_at = now()
  WHERE id = 'main';

  DELETE FROM public.user_roles
  WHERE user_id = current_primary AND role = 'admin';
END;
$$;

REVOKE ALL ON FUNCTION public.transfer_primary_administrator(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.transfer_primary_administrator(UUID) TO authenticated;
