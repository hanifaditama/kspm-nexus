ALTER TABLE public.screening_items
  DROP CONSTRAINT IF EXISTS screening_items_division_check;

ALTER TABLE public.screening_items
  ADD CONSTRAINT screening_items_division_check
  CHECK (division IN ('BPH', 'CMP', 'EVENT', 'RESEARCH'));

ALTER TABLE public.screening_evaluators
  DROP CONSTRAINT IF EXISTS screening_evaluators_division_check;

ALTER TABLE public.screening_evaluators
  ADD CONSTRAINT screening_evaluators_division_check
  CHECK (division IN ('BPH', 'CMP', 'EVENT', 'RESEARCH'));

ALTER TABLE public.screening_evaluators
  ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX screening_evaluators_division_user_unique
  ON public.screening_evaluators (division, user_id)
  WHERE user_id IS NOT NULL;

GRANT UPDATE ON public.screening_evaluators TO authenticated;

CREATE POLICY "Primary administrator can assign screening evaluators"
  ON public.screening_evaluators FOR UPDATE TO authenticated
  USING (public.is_primary_administrator(auth.uid()))
  WITH CHECK (public.is_primary_administrator(auth.uid()));

CREATE OR REPLACE FUNCTION public.can_update_screening_check(_evaluator_id UUID, _screening_item_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.screening_evaluators evaluator
    JOIN public.screening_items item ON item.id = _screening_item_id
    WHERE evaluator.id = _evaluator_id
      AND evaluator.division = item.division
      AND evaluator.user_id = auth.uid()
  )
$$;

INSERT INTO public.screening_evaluators (division, display_name, display_order) VALUES
  ('BPH', 'Hanif', 1),
  ('BPH', 'Elvin', 2),
  ('BPH', 'Calysta', 3),
  ('BPH', 'Keishya', 4);

UPDATE public.screening_evaluators
SET user_id = (
  SELECT profile.user_id
  FROM public.member_profiles profile
  WHERE lower(trim(profile.display_name)) IN ('hanif', 'hanifaditama')
    OR lower(split_part(profile.email, '@', 1)) = 'hanifaditama'
  ORDER BY CASE WHEN lower(split_part(profile.email, '@', 1)) = 'hanifaditama' THEN 0 ELSE 1 END
  LIMIT 1
)
WHERE display_name = 'Hanif'
  AND EXISTS (
    SELECT 1
    FROM public.member_profiles profile
    WHERE lower(trim(profile.display_name)) IN ('hanif', 'hanifaditama')
      OR lower(split_part(profile.email, '@', 1)) = 'hanifaditama'
  );
