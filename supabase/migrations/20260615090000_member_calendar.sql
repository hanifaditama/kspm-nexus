ALTER TABLE public.user_content_permissions
  DROP CONSTRAINT IF EXISTS user_content_permissions_permission_check;

ALTER TABLE public.user_content_permissions
  ADD CONSTRAINT user_content_permissions_permission_check
  CHECK (permission IN ('recruitment', 'articles', 'events', 'team', 'programs', 'calendar'));

CREATE TABLE public.calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL CHECK (length(trim(title)) BETWEEN 1 AND 200),
  event_date DATE NOT NULL,
  end_date DATE,
  color TEXT NOT NULL DEFAULT '#2563eb' CHECK (color ~ '^#[0-9A-Fa-f]{6}$'),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (end_date IS NULL OR end_date >= event_date)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.calendar_events TO authenticated;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated members can view calendar"
  ON public.calendar_events FOR SELECT TO authenticated USING (true);

CREATE POLICY "Calendar managers can manage calendar"
  ON public.calendar_events FOR ALL TO authenticated
  USING (public.has_content_permission(auth.uid(), 'calendar'))
  WITH CHECK (public.has_content_permission(auth.uid(), 'calendar'));

CREATE TRIGGER calendar_events_updated_at
  BEFORE UPDATE ON public.calendar_events
  FOR EACH ROW EXECUTE FUNCTION public.set_screening_updated_at();

INSERT INTO public.calendar_events (title, event_date, end_date, color) VALUES
  ('New Year''s Day', '2026-01-01', NULL, '#dc2626'),
  ('First Day of Class 25/Even', '2026-01-05', NULL, '#2563eb'),
  ('Isra Mi''raj Prophet Muhammad SAW', '2026-01-16', NULL, '#dc2626'),
  ('Chinese New Year''s Day', '2026-02-16', '2026-02-17', '#dc2626'),
  ('Quiet Week', '2026-02-15', '2026-02-22', '#2563eb'),
  ('Mid Exam', '2026-02-23', '2026-02-27', '#2563eb'),
  ('Eid Al Fitr Holiday', '2026-03-17', '2026-03-23', '#dc2626'),
  ('Nyepi', '2026-03-19', NULL, '#dc2626'),
  ('Eid Al Fitr', '2026-03-20', NULL, '#dc2626'),
  ('Good Friday', '2026-04-03', NULL, '#dc2626'),
  ('Easter Sunday', '2026-04-05', NULL, '#dc2626'),
  ('Seminar', '2026-04-10', NULL, '#059669'),
  ('Quiet Week', '2026-04-19', '2026-04-26', '#2563eb'),
  ('Final Exam', '2026-04-27', '2026-04-30', '#2563eb'),
  ('International Labour Day', '2026-05-01', NULL, '#dc2626'),
  ('Final Exam', '2026-05-04', NULL, '#2563eb'),
  ('Sucor Visit', '2026-05-05', NULL, '#059669'),
  ('Ascension Day of Jesus Christ', '2026-05-14', NULL, '#dc2626'),
  ('Semester Break', '2026-05-15', NULL, '#2563eb'),
  ('First Day Accelerate', '2026-05-18', NULL, '#2563eb'),
  ('Member Development Program Batch 2', '2026-05-20', NULL, '#059669'),
  ('Internal Competition', '2026-05-22', NULL, '#059669'),
  ('Eid Al-Adha', '2026-05-27', NULL, '#dc2626'),
  ('UPH Stock Valuation', '2026-05-28', NULL, '#059669'),
  ('Pancasila Day', '2026-06-01', NULL, '#dc2626'),
  ('Mini Comp Internal', '2026-06-10', NULL, '#059669'),
  ('Islamic New Year''s Day', '2026-06-16', NULL, '#dc2626'),
  ('Sekolah Pasar Modal (Tentative)', '2026-06-17', NULL, '#059669'),
  ('Last Day of Accelerate', '2026-07-24', NULL, '#2563eb'),
  ('Semester Break', '2026-07-25', NULL, '#2563eb'),
  ('UPH Festival (Tentative)', '2026-08-13', '2026-08-15', '#7c3aed'),
  ('Independence Day', '2026-08-17', NULL, '#dc2626'),
  ('First Day Odd', '2026-08-18', NULL, '#2563eb'),
  ('Birthday of the Prophet Muhammad SAW', '2026-08-25', NULL, '#dc2626');
