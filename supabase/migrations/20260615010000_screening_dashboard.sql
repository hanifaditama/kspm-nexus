ALTER TABLE public.user_content_permissions
  DROP CONSTRAINT IF EXISTS user_content_permissions_permission_check;

ALTER TABLE public.user_content_permissions
  ADD CONSTRAINT user_content_permissions_permission_check
  CHECK (permission IN ('recruitment', 'articles', 'events', 'team', 'programs', 'screening'));

CREATE TABLE public.screening_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  division TEXT NOT NULL CHECK (division IN ('CMP', 'EVENT', 'RESEARCH')),
  sequence_no INTEGER NOT NULL CHECK (sequence_no > 0),
  material TEXT NOT NULL,
  submitted_at DATE,
  due_at DATE,
  link TEXT,
  status TEXT NOT NULL DEFAULT 'SCREENING BY KSPM'
    CHECK (status IN ('SCREENING BY KSPM', 'MINOR REVISION', 'APPROVED BY KSPM')),
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (division, sequence_no)
);

CREATE TABLE public.screening_evaluators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  division TEXT NOT NULL CHECK (division IN ('CMP', 'EVENT', 'RESEARCH')),
  display_name TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  UNIQUE (division, display_name)
);

CREATE TABLE public.screening_checks (
  screening_item_id UUID NOT NULL REFERENCES public.screening_items(id) ON DELETE CASCADE,
  evaluator_id UUID NOT NULL REFERENCES public.screening_evaluators(id) ON DELETE CASCADE,
  checked BOOLEAN NOT NULL DEFAULT false,
  checked_at TIMESTAMPTZ,
  PRIMARY KEY (screening_item_id, evaluator_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.screening_items TO authenticated;
GRANT SELECT ON public.screening_evaluators TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.screening_checks TO authenticated;

ALTER TABLE public.screening_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.screening_evaluators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.screening_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated members can view screening items"
  ON public.screening_items FOR SELECT TO authenticated USING (true);

CREATE POLICY "Screening managers can manage screening items"
  ON public.screening_items FOR ALL TO authenticated
  USING (public.has_content_permission(auth.uid(), 'screening'))
  WITH CHECK (public.has_content_permission(auth.uid(), 'screening'));

CREATE POLICY "Authenticated members can view screening evaluators"
  ON public.screening_evaluators FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated members can view screening checks"
  ON public.screening_checks FOR SELECT TO authenticated USING (true);

CREATE OR REPLACE FUNCTION public.can_update_screening_check(_evaluator_id UUID, _screening_item_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.screening_evaluators evaluator
    JOIN public.screening_items item ON item.id = _screening_item_id
    JOIN public.member_profiles profile ON profile.user_id = auth.uid()
    WHERE evaluator.id = _evaluator_id
      AND evaluator.division = item.division
      AND lower(trim(evaluator.display_name)) = lower(trim(profile.display_name))
  )
$$;

REVOKE ALL ON FUNCTION public.can_update_screening_check(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_update_screening_check(UUID, UUID) TO authenticated;

CREATE POLICY "Evaluators can insert own screening checks"
  ON public.screening_checks FOR INSERT TO authenticated
  WITH CHECK (public.can_update_screening_check(evaluator_id, screening_item_id));

CREATE POLICY "Evaluators can update own screening checks"
  ON public.screening_checks FOR UPDATE TO authenticated
  USING (public.can_update_screening_check(evaluator_id, screening_item_id))
  WITH CHECK (public.can_update_screening_check(evaluator_id, screening_item_id));

CREATE POLICY "Evaluators can delete own screening checks"
  ON public.screening_checks FOR DELETE TO authenticated
  USING (public.can_update_screening_check(evaluator_id, screening_item_id));

CREATE OR REPLACE FUNCTION public.set_screening_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER screening_items_updated_at
  BEFORE UPDATE ON public.screening_items
  FOR EACH ROW EXECUTE FUNCTION public.set_screening_updated_at();

INSERT INTO public.screening_evaluators (division, display_name, display_order) VALUES
  ('CMP', 'Hanif', 1), ('CMP', 'Elvin', 2), ('CMP', 'Calysta', 3), ('CMP', 'Keishya', 4),
  ('CMP', 'Fillmore', 5), ('CMP', 'Vincent', 6), ('CMP', 'Beatrice', 7),
  ('EVENT', 'Hanif', 1), ('EVENT', 'Elvin', 2), ('EVENT', 'Calysta', 3), ('EVENT', 'Keishya', 4),
  ('EVENT', 'Veline', 5), ('EVENT', 'Vincent', 6), ('EVENT', 'Fillmore', 7),
  ('RESEARCH', 'Hanif', 1), ('RESEARCH', 'Vincent', 2), ('RESEARCH', 'Beatrice', 3);

INSERT INTO public.screening_items
  (division, sequence_no, material, submitted_at, due_at, link, status, notes)
VALUES
  ('CMP', 1, 'Postingan Market Report #1', NULL, NULL, 'https://canva.link/uk1xzqfnqx3nhmf', 'SCREENING BY KSPM', 'Beatrice: Komentar ada di dalam canva; Hanif: Komen tertera di canva'),
  ('RESEARCH', 1, 'Market Report #1', '2026-05-27', '2026-05-30', 'https://docs.google.com/document/d/1CrgybnrSCzvBk3zVcI0GOzBvZPqwsDmKxL73MfPKvYI/edit?tab=t.0', 'MINOR REVISION', 'Vincent: Komen tertera di dokumen'),
  ('RESEARCH', 2, 'TINS.IJ Stock Info', '2026-05-31', '2026-06-03', 'https://docs.google.com/document/d/1Q_QT_kCxZ4pQlaG7GJO5A1UEwoL1AKtgoy6vCrWZfVI/edit?tab=t.7rjvzgda5fyy', 'APPROVED BY KSPM', NULL),
  ('RESEARCH', 3, 'Market Report #1 R1', '2026-06-01', '2026-06-04', 'https://docs.google.com/document/d/1CrgybnrSCzvBk3zVcI0GOzBvZPqwsDmKxL73MfPKvYI/edit?tab=t.0', 'APPROVED BY KSPM', NULL),
  ('RESEARCH', 4, 'MBMA.IJ Stock Info', '2026-06-07', '2026-06-10', 'https://docs.google.com/document/d/1WQ1giqowBZ2_iUU7AxYPb1nJcG7hvVR_uPWHmEkwydE/edit?tab=t.0', 'MINOR REVISION', NULL),
  ('RESEARCH', 5, 'MBMA.IJ Stock Info R1', '2026-06-08', '2026-06-11', 'https://docs.google.com/document/d/1WQ1giqowBZ2_iUU7AxYPb1nJcG7hvVR_uPWHmEkwydE/edit?tab=t.0', 'SCREENING BY KSPM', NULL),
  ('RESEARCH', 6, 'Deep Dive #1', '2026-06-09', '2026-06-12', 'https://docs.google.com/document/d/1bf9YuPuieeB8N6txmBNVDRNktByk7_AoZ1FQiE4M0uA/edit?usp=sharing', 'SCREENING BY KSPM', NULL);

INSERT INTO public.screening_checks (screening_item_id, evaluator_id, checked, checked_at)
SELECT item.id, evaluator.id, true, now()
FROM public.screening_items item
JOIN public.screening_evaluators evaluator ON evaluator.division = item.division
WHERE
  (item.division = 'CMP' AND item.sequence_no = 1 AND evaluator.display_name = 'Hanif')
  OR (item.division = 'RESEARCH' AND item.sequence_no IN (1, 3, 4) AND evaluator.display_name IN ('Hanif', 'Vincent', 'Beatrice'))
  OR (item.division = 'RESEARCH' AND item.sequence_no = 2 AND evaluator.display_name IN ('Hanif', 'Vincent'))
  OR (item.division = 'RESEARCH' AND item.sequence_no = 5 AND evaluator.display_name = 'Vincent');
