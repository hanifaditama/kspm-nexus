ALTER TABLE public.work_requests
  ADD COLUMN IF NOT EXISTS responsible_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS public.work_request_assignees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  division TEXT NOT NULL CHECK (division IN ('BPH', 'CMP', 'EVENT', 'RESEARCH')),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (division, user_id)
);

GRANT SELECT, INSERT, DELETE ON public.work_request_assignees TO authenticated;
ALTER TABLE public.work_request_assignees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated members can view work request assignees"
  ON public.work_request_assignees FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Primary administrator can add work request assignees"
  ON public.work_request_assignees FOR INSERT TO authenticated
  WITH CHECK (public.is_primary_administrator(auth.uid()));

CREATE POLICY "Primary administrator can remove work request assignees"
  ON public.work_request_assignees FOR DELETE TO authenticated
  USING (public.is_primary_administrator(auth.uid()));

CREATE OR REPLACE FUNCTION public.can_manage_work_request(_user_id UUID, _division TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'admin')
    OR (
      _division = 'BPH'
      AND public.is_screening_executive(_user_id)
    )
    OR EXISTS (
      SELECT 1
      FROM public.work_request_assignees assignee
      WHERE assignee.user_id = _user_id
        AND assignee.division = _division
    )
    OR EXISTS (
      SELECT 1
      FROM public.team_members
      WHERE user_id = _user_id
        AND (
          upper(trim(division)) = upper(trim(_division))
          OR upper(trim(division)) LIKE '%' || upper(trim(_division)) || '%'
          OR (_division = 'EVENT' AND upper(trim(division)) LIKE '%EVENT%')
          OR (_division = 'CMP' AND (
            upper(trim(division)) LIKE '%CREATIVE%'
            OR upper(trim(division)) LIKE '%MEDIA%'
            OR upper(trim(division)) LIKE '%PUBLICATION%'
          ))
        )
    )
$$;

CREATE TABLE IF NOT EXISTS public.work_request_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_request_id UUID NOT NULL REFERENCES public.work_requests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL CHECK (length(trim(message)) BETWEEN 1 AND 2000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.work_request_comments TO authenticated;
ALTER TABLE public.work_request_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated members can view work request comments"
  ON public.work_request_comments FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Request collaborators can add work request comments"
  ON public.work_request_comments FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.work_requests request
      WHERE request.id = work_request_id
        AND (
          request.requested_by = auth.uid()
          OR request.responsible_user_id = auth.uid()
          OR public.can_manage_work_request(auth.uid(), request.target_division)
        )
    )
  );

CREATE POLICY "Authors can update own work request comments"
  ON public.work_request_comments FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Authors can delete own work request comments"
  ON public.work_request_comments FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.set_work_request_comment_author()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  SELECT display_name INTO NEW.author_name
  FROM public.member_profiles
  WHERE user_id = NEW.user_id;

  IF NEW.author_name IS NULL THEN
    RAISE EXCEPTION 'Member profile not found';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_work_request_comment_author ON public.work_request_comments;
CREATE TRIGGER set_work_request_comment_author
  BEFORE INSERT ON public.work_request_comments
  FOR EACH ROW EXECUTE FUNCTION public.set_work_request_comment_author();

CREATE OR REPLACE FUNCTION public.sync_work_request_assignee_name()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.work_request_assignees
  SET display_name = split_part(trim(NEW.display_name), ' ', 1)
  WHERE user_id = NEW.user_id;

  UPDATE public.work_requests
  SET responsible_person = split_part(trim(NEW.display_name), ' ', 1)
  WHERE responsible_user_id = NEW.user_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_work_request_assignee_name ON public.member_profiles;
CREATE TRIGGER sync_work_request_assignee_name
  AFTER UPDATE OF display_name ON public.member_profiles
  FOR EACH ROW EXECUTE FUNCTION public.sync_work_request_assignee_name();

INSERT INTO public.work_request_assignees (division, user_id, display_name, display_order)
SELECT DISTINCT item.target_division, profile.user_id, split_part(trim(profile.display_name), ' ', 1), 1
FROM public.work_requests item
JOIN public.member_profiles profile
  ON lower(split_part(profile.display_name, ' ', 1)) = lower(item.responsible_person)
WHERE item.responsible_person IS NOT NULL
  AND item.responsible_user_id IS NULL
ON CONFLICT (division, user_id) DO NOTHING;

UPDATE public.work_requests item
SET responsible_user_id = assignee.user_id,
    responsible_person = assignee.display_name
FROM public.work_request_assignees assignee
WHERE item.responsible_user_id IS NULL
  AND item.responsible_person IS NOT NULL
  AND item.target_division = assignee.division
  AND lower(item.responsible_person) = lower(assignee.display_name);
