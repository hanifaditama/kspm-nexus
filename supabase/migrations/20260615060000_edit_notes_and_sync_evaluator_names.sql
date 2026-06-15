GRANT UPDATE ON public.screening_notes TO authenticated;

CREATE POLICY "Authors can update own screening notes"
  ON public.screening_notes FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.sync_screening_evaluator_name()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE public.screening_evaluators
  SET display_name = split_part(trim(NEW.display_name), ' ', 1)
  WHERE user_id = NEW.user_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER sync_screening_evaluator_name
  AFTER UPDATE OF display_name ON public.member_profiles
  FOR EACH ROW EXECUTE FUNCTION public.sync_screening_evaluator_name();

UPDATE public.screening_evaluators evaluator
SET display_name = split_part(trim(profile.display_name), ' ', 1)
FROM public.member_profiles profile
WHERE evaluator.user_id = profile.user_id;
