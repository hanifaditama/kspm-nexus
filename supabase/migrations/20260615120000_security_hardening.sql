CREATE TABLE IF NOT EXISTS public.security_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL CHECK (length(action) BETWEEN 1 AND 100),
  key_hash TEXT NOT NULL CHECK (length(key_hash) = 64),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS security_rate_limits_lookup_idx
  ON public.security_rate_limits (action, key_hash, created_at DESC);

ALTER TABLE public.security_rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.security_rate_limits FROM anon, authenticated;
GRANT ALL ON public.security_rate_limits TO service_role;

CREATE TABLE IF NOT EXISTS public.security_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID,
  action TEXT NOT NULL CHECK (length(action) BETWEEN 1 AND 120),
  target_user_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS security_audit_logs_created_idx
  ON public.security_audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS security_audit_logs_actor_idx
  ON public.security_audit_logs (actor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS security_audit_logs_target_idx
  ON public.security_audit_logs (target_user_id, created_at DESC);

ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.security_audit_logs FROM anon, authenticated;
GRANT SELECT ON public.security_audit_logs TO authenticated;
GRANT ALL ON public.security_audit_logs TO service_role;

CREATE POLICY "Primary administrator can view security audit logs"
  ON public.security_audit_logs FOR SELECT TO authenticated
  USING (public.is_primary_administrator(auth.uid()));

CREATE OR REPLACE FUNCTION public.prevent_security_audit_log_changes()
RETURNS TRIGGER
LANGUAGE plpgsql SET search_path = public
AS $$
BEGIN
  RAISE EXCEPTION 'Security audit logs are immutable';
END;
$$;

CREATE TRIGGER prevent_security_audit_log_update
  BEFORE UPDATE OR DELETE ON public.security_audit_logs
  FOR EACH ROW EXECUTE FUNCTION public.prevent_security_audit_log_changes();

CREATE OR REPLACE FUNCTION public.audit_access_control_change()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  target UUID;
  details JSONB;
BEGIN
  IF TG_OP = 'DELETE' THEN
    target := OLD.user_id;
  ELSE
    target := NEW.user_id;
  END IF;
  details := jsonb_build_object(
    'table', TG_TABLE_NAME,
    'operation', TG_OP,
    'old', CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
    'new', CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
  );

  INSERT INTO public.security_audit_logs (actor_id, action, target_user_id, metadata)
  VALUES (auth.uid(), 'access_control.' || lower(TG_OP), target, details);
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER audit_user_roles
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.audit_access_control_change();
CREATE TRIGGER audit_user_content_permissions
  AFTER INSERT OR UPDATE OR DELETE ON public.user_content_permissions
  FOR EACH ROW EXECUTE FUNCTION public.audit_access_control_change();
CREATE TRIGGER audit_primary_administrator
  AFTER UPDATE ON public.primary_administrator
  FOR EACH ROW EXECUTE FUNCTION public.audit_access_control_change();

DROP POLICY IF EXISTS "Admins can view all member profiles" ON public.member_profiles;
DROP POLICY IF EXISTS "Primary administrator can view all member profiles" ON public.member_profiles;
CREATE POLICY "Primary administrator can view all member profiles"
  ON public.member_profiles FOR SELECT TO authenticated
  USING (public.is_primary_administrator(auth.uid()));

DROP POLICY IF EXISTS "Members can view own profile" ON public.member_profiles;
CREATE POLICY "Members can view own profile"
  ON public.member_profiles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

UPDATE storage.buckets
SET
  file_size_limit = 26214400,
  allowed_mime_types = ARRAY[
    'application/json',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'audio/mpeg',
    'audio/ogg',
    'audio/wav',
    'image/gif',
    'image/jpeg',
    'image/png',
    'image/webp',
    'text/csv',
    'text/plain',
    'video/mp4',
    'video/webm'
  ]
WHERE id = 'member-files';

UPDATE storage.buckets
SET
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/gif', 'image/jpeg', 'image/png', 'image/webp']
WHERE id = 'content-images';

CREATE OR REPLACE FUNCTION public.is_primary_administrator_aal2()
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT public.is_primary_administrator(auth.uid())
    AND COALESCE(auth.jwt()->>'aal', '') = 'aal2'
$$;

REVOKE ALL ON FUNCTION public.is_primary_administrator_aal2() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_primary_administrator_aal2() TO authenticated;
