ALTER TABLE public.screening_items
  DROP CONSTRAINT IF EXISTS screening_items_status_check;

UPDATE public.screening_items
SET status = CASE status
  WHEN 'SCREENING BY KSPM' THEN 'SCREENING BY INVESTMENT CLUB'
  WHEN 'APPROVED BY KSPM' THEN 'APPROVED BY INVESTMENT CLUB'
  ELSE status
END;

ALTER TABLE public.screening_items
  ALTER COLUMN status SET DEFAULT 'SCREENING BY INVESTMENT CLUB';

ALTER TABLE public.screening_items
  ADD CONSTRAINT screening_items_status_check
  CHECK (status IN ('SCREENING BY INVESTMENT CLUB', 'MINOR REVISION', 'APPROVED BY INVESTMENT CLUB'));

UPDATE public.site_settings
SET
  recruitment_title = replace(recruitment_title, 'KSPM', 'UPH Investment Club'),
  recruitment_description = replace(recruitment_description, 'KSPM', 'UPH Investment Club');

UPDATE public.articles
SET
  title = replace(title, 'KSPM', 'UPH Investment Club'),
  excerpt = replace(excerpt, 'KSPM', 'UPH Investment Club'),
  content = replace(content, 'KSPM', 'UPH Investment Club'),
  author_name = replace(author_name, 'KSPM', 'UPH Investment Club')
WHERE
  title LIKE '%KSPM%'
  OR excerpt LIKE '%KSPM%'
  OR content LIKE '%KSPM%'
  OR author_name LIKE '%KSPM%';

UPDATE public.programs
SET
  title = 'Investment Fundamentals Training',
  description = 'A structured learning series that builds a practical foundation in financial markets, investment instruments, risk, and portfolio thinking.',
  icon = 'BookOpen',
  features = ARRAY['Capital market fundamentals', 'Risk and return', 'Portfolio basics', 'Interactive case discussions'],
  display_order = 1
WHERE lower(title) = 'training';

INSERT INTO public.programs (title, description, icon, features, display_order)
SELECT
  'Equity Research Lab',
  'A hands-on research program where members study industries, analyze listed companies, and communicate evidence-based investment ideas.',
  'BarChart3',
  ARRAY['Industry and company analysis', 'Financial statement review', 'Investment thesis development', 'Research report writing'],
  2
WHERE NOT EXISTS (SELECT 1 FROM public.programs WHERE lower(title) = 'equity research lab');

INSERT INTO public.programs (title, description, icon, features, display_order)
SELECT
  'Financial Modeling and Valuation',
  'Practical workshops focused on turning company information into financial projections and defensible valuations.',
  'TrendingUp',
  ARRAY['Three-statement modeling', 'DCF valuation', 'Comparable company analysis', 'Scenario and sensitivity analysis'],
  3
WHERE NOT EXISTS (SELECT 1 FROM public.programs WHERE lower(title) = 'financial modeling and valuation');

INSERT INTO public.programs (title, description, icon, features, display_order)
SELECT
  'Market Discussion Forum',
  'Recurring discussions that help members connect economic developments, market movements, and company-specific news.',
  'FileText',
  ARRAY['Weekly market review', 'Macroeconomic discussion', 'Investment idea exchange', 'Presentation practice'],
  4
WHERE NOT EXISTS (SELECT 1 FROM public.programs WHERE lower(title) = 'market discussion forum');

INSERT INTO public.programs (title, description, icon, features, display_order)
SELECT
  'Stock Pitch and Competition Preparation',
  'An intensive program for members preparing investment pitches, case competitions, and collaborative market projects.',
  'BarChart3',
  ARRAY['Stock pitch structure', 'Presentation coaching', 'Competition simulations', 'Feedback from peers and mentors'],
  5
WHERE NOT EXISTS (SELECT 1 FROM public.programs WHERE lower(title) = 'stock pitch and competition preparation');

UPDATE public.events
SET
  title = 'UPH Investment Club Competition',
  description = 'An internal investment challenge where participants present market analysis and investment ideas.',
  slug = 'uph-investment-club-competition'
WHERE title = 'KSPM Competition';

INSERT INTO public.events (slug, title, description, event_date, event_time, location, type)
VALUES
  (
    'capital-market-career-talk-2026',
    'Capital Market Career Talk',
    'Learn about career paths in equity research, investment banking, asset management, and capital markets from industry professionals.',
    '2026-07-18 06:00:00+00',
    '13:00 - 15:30 WIB',
    'UPH Lippo Village',
    'seminar'
  ),
  (
    'equity-research-workshop-2026',
    'Equity Research Workshop',
    'A practical workshop covering company analysis, investment thesis development, and the foundations of writing an equity research report.',
    '2026-08-08 02:00:00+00',
    '09:00 - 13:00 WIB',
    'Galeri Investasi UPH',
    'workshop'
  ),
  (
    'market-outlook-forum-q4-2026',
    'Market Outlook Forum: Navigating Q4 2026',
    'Discuss the macroeconomic outlook, key market themes, and sectors to watch with fellow students and invited speakers.',
    '2026-09-19 06:00:00+00',
    '13:00 - 16:00 WIB',
    'UPH Lippo Village',
    'seminar'
  ),
  (
    'uph-stock-pitch-challenge-2026',
    'UPH Stock Pitch Challenge',
    'Teams develop and present a complete investment recommendation while receiving feedback from judges and industry practitioners.',
    '2026-11-07 02:00:00+00',
    '09:00 - 16:00 WIB',
    'UPH Lippo Village',
    'competition'
  )
ON CONFLICT (slug) DO NOTHING;
