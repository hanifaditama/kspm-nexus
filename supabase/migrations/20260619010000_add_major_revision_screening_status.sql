ALTER TABLE public.screening_items
  DROP CONSTRAINT IF EXISTS screening_items_status_check;

ALTER TABLE public.screening_items
  ADD CONSTRAINT screening_items_status_check
  CHECK (status IN (
    'SCREENING BY INVESTMENT CLUB',
    'MINOR REVISION',
    'MAJOR REVISION',
    'APPROVED BY INVESTMENT CLUB'
  ));
