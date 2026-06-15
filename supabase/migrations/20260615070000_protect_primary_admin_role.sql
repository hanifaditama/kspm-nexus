CREATE OR REPLACE FUNCTION public.protect_primary_administrator_role()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF OLD.role = 'admin' AND public.is_primary_administrator(OLD.user_id) THEN
    RAISE EXCEPTION 'The primary administrator role cannot be revoked. Transfer primary administrator access first.';
  END IF;
  RETURN OLD;
END;
$$;

CREATE TRIGGER protect_primary_administrator_role
  BEFORE DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.protect_primary_administrator_role();
