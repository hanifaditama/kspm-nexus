ALTER TABLE public.team_members
  ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX team_members_user_id_unique
  ON public.team_members (user_id)
  WHERE user_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.is_screening_executive(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.team_members
    WHERE user_id = _user_id
      AND upper(regexp_replace(trim(role), '[-_]+', ' ', 'g')) IN ('PRESIDENT', 'VICE PRESIDENT')
  )
$$;

CREATE OR REPLACE FUNCTION public.can_create_screening_item(_user_id UUID, _division TEXT)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT public.is_screening_executive(_user_id)
    OR EXISTS (
      SELECT 1
      FROM public.team_members
      WHERE user_id = _user_id
        AND (
          upper(trim(division)) = upper(trim(_division))
          OR upper(trim(division)) LIKE '%' || upper(trim(_division)) || '%'
        )
    )
$$;

CREATE OR REPLACE FUNCTION public.can_manage_screening_item(_user_id UUID, _division TEXT)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT public.is_screening_executive(_user_id)
    OR EXISTS (
      SELECT 1
      FROM public.screening_evaluators
      WHERE user_id = _user_id AND division = _division
    )
$$;

REVOKE ALL ON FUNCTION public.is_screening_executive(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.can_create_screening_item(UUID, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.can_manage_screening_item(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_screening_executive(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_create_screening_item(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_manage_screening_item(UUID, TEXT) TO authenticated;

DROP POLICY IF EXISTS "Screening managers can manage screening items" ON public.screening_items;

CREATE POLICY "Division members can create screening items"
  ON public.screening_items FOR INSERT TO authenticated
  WITH CHECK (
    created_by = auth.uid()
    AND public.can_create_screening_item(auth.uid(), division)
  );

CREATE POLICY "Division evaluators can update screening items"
  ON public.screening_items FOR UPDATE TO authenticated
  USING (public.can_manage_screening_item(auth.uid(), division))
  WITH CHECK (public.can_manage_screening_item(auth.uid(), division));

CREATE POLICY "Division evaluators can delete screening items"
  ON public.screening_items FOR DELETE TO authenticated
  USING (public.can_manage_screening_item(auth.uid(), division));

CREATE OR REPLACE FUNCTION public.protect_team_member_account_assignment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF (
      (TG_OP = 'INSERT' AND NEW.user_id IS NOT NULL)
      OR (TG_OP = 'UPDATE' AND NEW.user_id IS DISTINCT FROM OLD.user_id)
    )
    AND auth.uid() IS NOT NULL
    AND NOT public.is_primary_administrator(auth.uid()) THEN
    RAISE EXCEPTION 'Only the primary administrator can assign team member accounts';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER protect_team_member_account_assignment
  BEFORE INSERT OR UPDATE ON public.team_members
  FOR EACH ROW EXECUTE FUNCTION public.protect_team_member_account_assignment();

UPDATE public.team_members team
SET user_id = profile.user_id
FROM public.member_profiles profile
WHERE team.user_id IS NULL
  AND (
    lower(regexp_replace(team.name, '[^a-zA-Z0-9]', '', 'g'))
      = lower(regexp_replace(profile.display_name, '[^a-zA-Z0-9]', '', 'g'))
    OR lower(regexp_replace(team.name, '[^a-zA-Z0-9]', '', 'g'))
      = lower(regexp_replace(split_part(profile.email, '@', 1), '[^a-zA-Z0-9]', '', 'g'))
    OR (
      lower(trim(team.name)) = 'hanif'
      AND lower(split_part(profile.email, '@', 1)) = 'hanifaditama'
    )
  );
