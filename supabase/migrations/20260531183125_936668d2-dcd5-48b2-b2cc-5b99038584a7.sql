CREATE TABLE public.site_settings (
  id TEXT PRIMARY KEY,
  recruitment_open BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT ALL ON public.site_settings TO service_role;

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Settings are public" ON public.site_settings
  FOR SELECT USING (true);

CREATE POLICY "Admins manage settings" ON public.site_settings
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

INSERT INTO public.site_settings (id, recruitment_open) VALUES ('main', true);