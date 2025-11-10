-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'sekretaris_perusahaan', 'direktur', 'staff', 'evaluator');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own roles
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Admins can manage all roles
CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.user_roles
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- Create approval_history table to track approval workflow
CREATE TABLE public.approval_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pengajuan_id UUID REFERENCES public.pengajuan(id) ON DELETE CASCADE NOT NULL,
  approver_id UUID REFERENCES auth.users(id) NOT NULL,
  approver_role app_role NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('approved', 'rejected', 'returned')),
  catatan TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on approval_history
ALTER TABLE public.approval_history ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view approval history
CREATE POLICY "Anyone can view approval history"
ON public.approval_history
FOR SELECT
USING (true);

-- Policy: Only users with proper roles can insert approval
CREATE POLICY "Approvers can insert approval"
ON public.approval_history
FOR INSERT
WITH CHECK (
  public.has_role(auth.uid(), approver_role) OR
  public.has_role(auth.uid(), 'admin')
);

-- Add approval fields to pengajuan table
ALTER TABLE public.pengajuan 
ADD COLUMN IF NOT EXISTS approved_by_sekretaris UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS approved_by_sekretaris_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS approved_by_direktur UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS approved_by_direktur_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS current_approver_role app_role DEFAULT 'sekretaris_perusahaan';

-- Create function to handle approval workflow
CREATE OR REPLACE FUNCTION public.handle_approval(
  _pengajuan_id UUID,
  _action TEXT,
  _catatan TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _current_role app_role;
  _user_id UUID;
  _result JSON;
BEGIN
  _user_id := auth.uid();
  
  -- Get current approver role needed
  SELECT current_approver_role INTO _current_role
  FROM pengajuan
  WHERE id = _pengajuan_id;
  
  -- Check if user has the required role
  IF NOT public.has_role(_user_id, _current_role) AND NOT public.has_role(_user_id, 'admin') THEN
    RAISE EXCEPTION 'User does not have permission to approve at this stage';
  END IF;
  
  -- Insert into approval history
  INSERT INTO approval_history (pengajuan_id, approver_id, approver_role, action, catatan)
  VALUES (_pengajuan_id, _user_id, _current_role, _action, _catatan);
  
  -- Update pengajuan based on action and role
  IF _action = 'approved' THEN
    IF _current_role = 'sekretaris_perusahaan' THEN
      UPDATE pengajuan
      SET approved_by_sekretaris = _user_id,
          approved_by_sekretaris_at = now(),
          current_approver_role = 'direktur',
          status = 'waiting_direktur'
      WHERE id = _pengajuan_id;
    ELSIF _current_role = 'direktur' THEN
      UPDATE pengajuan
      SET approved_by_direktur = _user_id,
          approved_by_direktur_at = now(),
          current_approver_role = NULL,
          status = 'approved'
      WHERE id = _pengajuan_id;
    END IF;
  ELSIF _action = 'rejected' THEN
    UPDATE pengajuan
    SET status = 'rejected',
        catatan = _catatan,
        current_approver_role = NULL
    WHERE id = _pengajuan_id;
  ELSIF _action = 'returned' THEN
    UPDATE pengajuan
    SET status = 'returned',
        catatan = _catatan,
        current_approver_role = 'sekretaris_perusahaan'
    WHERE id = _pengajuan_id;
  END IF;
  
  _result := json_build_object(
    'success', true,
    'message', 'Approval processed successfully'
  );
  
  RETURN _result;
END;
$$;