DELETE FROM public.user_content_permissions
WHERE permission = 'screening';

ALTER TABLE public.user_content_permissions
  DROP CONSTRAINT IF EXISTS user_content_permissions_permission_check;

ALTER TABLE public.user_content_permissions
  ADD CONSTRAINT user_content_permissions_permission_check
  CHECK (permission IN ('recruitment', 'articles', 'events', 'team', 'programs'));
