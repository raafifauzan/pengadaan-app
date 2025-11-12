-- Relax access control by removing role-based requirements

-- Drop policies that relied on custom roles (if they exist)
DROP POLICY IF EXISTS "Admins and approvers can update pengajuan" ON public.pengajuan;
DROP POLICY IF EXISTS "Authenticated users can insert pengajuan" ON public.pengajuan;
DROP POLICY IF EXISTS "Anyone can view pengajuan" ON public.pengajuan;
ALTER TABLE public.pengajuan DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Evaluators can insert form_evaluasi" ON public.form_evaluasi;
DROP POLICY IF EXISTS "Evaluators can update form_evaluasi" ON public.form_evaluasi;
DROP POLICY IF EXISTS "Anyone can view form_evaluasi" ON public.form_evaluasi;
ALTER TABLE public.form_evaluasi DISABLE ROW LEVEL SECURITY;

-- Convert columns so they no longer depend on the app_role enum
ALTER TABLE public.pengajuan
  ALTER COLUMN current_approver_role DROP DEFAULT,
  ALTER COLUMN current_approver_role TYPE text USING current_approver_role::text;

ALTER TABLE public.approval_history
  ALTER COLUMN approver_role TYPE text USING approver_role::text;

-- Clean up helper objects that enforced roles
DROP FUNCTION IF EXISTS public.handle_approval(uuid, text, text);
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);
DROP TABLE IF EXISTS public.user_roles;
DROP TYPE IF EXISTS public.app_role;
