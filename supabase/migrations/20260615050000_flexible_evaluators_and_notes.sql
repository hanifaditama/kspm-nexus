DELETE FROM public.screening_evaluators
WHERE user_id IS NULL;

ALTER TABLE public.screening_evaluators
  DROP CONSTRAINT IF EXISTS screening_evaluators_division_display_name_key;

UPDATE public.screening_evaluators evaluator
SET display_name = split_part(trim(profile.display_name), ' ', 1)
FROM public.member_profiles profile
WHERE evaluator.user_id = profile.user_id;

GRANT INSERT, DELETE ON public.screening_evaluators TO authenticated;

CREATE POLICY "Primary administrator can add screening evaluators"
  ON public.screening_evaluators FOR INSERT TO authenticated
  WITH CHECK (public.is_primary_administrator(auth.uid()));

CREATE POLICY "Primary administrator can remove screening evaluators"
  ON public.screening_evaluators FOR DELETE TO authenticated
  USING (public.is_primary_administrator(auth.uid()));

CREATE TABLE public.screening_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  screening_item_id UUID NOT NULL REFERENCES public.screening_items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL CHECK (length(trim(message)) BETWEEN 1 AND 2000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, DELETE ON public.screening_notes TO authenticated;
ALTER TABLE public.screening_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated members can view screening notes"
  ON public.screening_notes FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Division evaluators can add screening notes"
  ON public.screening_notes FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.screening_items item
      WHERE item.id = screening_item_id
        AND public.can_manage_screening_item(auth.uid(), item.division)
    )
  );

CREATE POLICY "Authors and executives can delete screening notes"
  ON public.screening_notes FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR public.is_screening_executive(auth.uid()));

CREATE OR REPLACE FUNCTION public.set_screening_note_author()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
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

CREATE TRIGGER set_screening_note_author
  BEFORE INSERT ON public.screening_notes
  FOR EACH ROW EXECUTE FUNCTION public.set_screening_note_author();
