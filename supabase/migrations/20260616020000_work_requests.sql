CREATE OR REPLACE FUNCTION public.add_business_days(_start_date DATE, _days INT)
RETURNS DATE
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
  result_date DATE := _start_date;
  added_days INT := 0;
BEGIN
  IF _start_date IS NULL THEN
    RETURN NULL;
  END IF;

  WHILE added_days < _days LOOP
    result_date := result_date + 1;
    IF EXTRACT(ISODOW FROM result_date) < 6 THEN
      added_days := added_days + 1;
    END IF;
  END LOOP;

  RETURN result_date;
END;
$$;

CREATE TABLE IF NOT EXISTS public.work_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_division TEXT NOT NULL CHECK (target_division IN ('BPH', 'CMP', 'EVENT', 'RESEARCH')),
  requesting_division TEXT NOT NULL,
  task TEXT NOT NULL,
  details TEXT,
  work_link TEXT,
  submission_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL DEFAULT public.add_business_days(CURRENT_DATE, 5),
  status TEXT NOT NULL DEFAULT 'Submitted' CHECK (status IN ('Submitted', 'On Progress', 'Upscreening', 'Needs Revision', 'Completed', 'Cancelled')),
  responsible_person TEXT,
  requested_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (char_length(trim(requesting_division)) BETWEEN 2 AND 80),
  CHECK (char_length(trim(task)) BETWEEN 3 AND 180),
  CHECK (work_link IS NULL OR work_link ~* '^https?://[^\s]+$')
);

CREATE INDEX IF NOT EXISTS work_requests_target_due_idx
  ON public.work_requests (target_division, due_date DESC);

CREATE INDEX IF NOT EXISTS work_requests_requested_by_idx
  ON public.work_requests (requested_by, created_at DESC);

ALTER TABLE public.work_requests ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.prepare_work_request_dates()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.submission_date IS NULL THEN
    NEW.submission_date := CURRENT_DATE;
  END IF;
  NEW.due_date := public.add_business_days(NEW.submission_date, 5);
  RETURN NEW;
END;
$$;

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

REVOKE ALL ON FUNCTION public.add_business_days(DATE, INT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.can_manage_work_request(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.add_business_days(DATE, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_manage_work_request(UUID, TEXT) TO authenticated;

DROP POLICY IF EXISTS "Members can read work requests" ON public.work_requests;
CREATE POLICY "Members can read work requests"
  ON public.work_requests FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Members can submit work requests" ON public.work_requests;
CREATE POLICY "Members can submit work requests"
  ON public.work_requests FOR INSERT TO authenticated
  WITH CHECK (
    requested_by = auth.uid()
    AND status = 'Submitted'
    AND work_link IS NULL
    AND responsible_person IS NULL
  );

DROP POLICY IF EXISTS "Request owners and division managers can update work requests" ON public.work_requests;
CREATE POLICY "Request owners and division managers can update work requests"
  ON public.work_requests FOR UPDATE TO authenticated
  USING (
    requested_by = auth.uid()
    OR public.can_manage_work_request(auth.uid(), target_division)
  )
  WITH CHECK (
    requested_by = auth.uid()
    OR public.can_manage_work_request(auth.uid(), target_division)
  );

DROP POLICY IF EXISTS "Request owners and division managers can delete work requests" ON public.work_requests;
CREATE POLICY "Request owners and division managers can delete work requests"
  ON public.work_requests FOR DELETE TO authenticated
  USING (
    requested_by = auth.uid()
    OR public.can_manage_work_request(auth.uid(), target_division)
  );

DROP TRIGGER IF EXISTS work_requests_updated_at ON public.work_requests;
CREATE TRIGGER work_requests_updated_at
  BEFORE UPDATE ON public.work_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS work_requests_prepare_dates ON public.work_requests;
CREATE TRIGGER work_requests_prepare_dates
  BEFORE INSERT OR UPDATE OF submission_date ON public.work_requests
  FOR EACH ROW EXECUTE FUNCTION public.prepare_work_request_dates();

INSERT INTO public.work_requests (
  target_division,
  requesting_division,
  task,
  details,
  work_link,
  submission_date,
  due_date,
  status,
  responsible_person,
  requested_by
)
SELECT target_division, requesting_division, task, details, work_link, submission_date, public.add_business_days(submission_date, 5), status, responsible_person, primary_admin.user_id
FROM (
  VALUES
    ('CMP', 'Research', 'Market Report #1', 'Sesuai dengan moodboard UPH Investment Club', 'https://example.com/market-report-1', DATE '2026-06-01', 'On Progress', NULL),
    ('CMP', 'Research', 'Template DEEP DIVE LinkedIn profesional semiformal', 'Sesuai dengan design sebelumnya dan komen tertera di dokumen, output sebagai PPTX.', 'https://example.com/deep-dive-template', DATE '2026-06-11', 'Submitted', NULL),
    ('RESEARCH', 'Research', 'Biweekly 1', NULL, 'https://example.com/market-report-1', DATE '2026-05-27', 'Upscreening', 'Beatrice'),
    ('RESEARCH', 'Research', 'TINS.IJ', 'Comprof + TA', 'https://example.com/tins-output', DATE '2026-05-31', 'Upscreening', 'Vincent')
) AS seed(target_division, requesting_division, task, details, work_link, submission_date, status, responsible_person)
CROSS JOIN LATERAL (
  SELECT user_id FROM public.primary_administrator LIMIT 1
) AS primary_admin
WHERE NOT EXISTS (
  SELECT 1 FROM public.work_requests existing
  WHERE existing.target_division = seed.target_division
    AND existing.task = seed.task
    AND existing.submission_date = seed.submission_date
);
