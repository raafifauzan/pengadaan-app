-- Enable RLS on pengajuan table
ALTER TABLE public.pengajuan ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view all pengajuan
CREATE POLICY "Anyone can view pengajuan"
ON public.pengajuan
FOR SELECT
USING (true);

-- Policy: Authenticated users can insert pengajuan
CREATE POLICY "Authenticated users can insert pengajuan"
ON public.pengajuan
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Policy: Admins and approvers can update pengajuan
CREATE POLICY "Admins and approvers can update pengajuan"
ON public.pengajuan
FOR UPDATE
USING (
  public.has_role(auth.uid(), 'admin') OR
  public.has_role(auth.uid(), 'sekretaris_perusahaan') OR
  public.has_role(auth.uid(), 'direktur') OR
  public.has_role(auth.uid(), 'evaluator')
);

-- Enable RLS on form_evaluasi table
ALTER TABLE public.form_evaluasi ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view form_evaluasi
CREATE POLICY "Anyone can view form_evaluasi"
ON public.form_evaluasi
FOR SELECT
USING (true);

-- Policy: Evaluators can insert form_evaluasi
CREATE POLICY "Evaluators can insert form_evaluasi"
ON public.form_evaluasi
FOR INSERT
WITH CHECK (
  public.has_role(auth.uid(), 'evaluator') OR
  public.has_role(auth.uid(), 'admin')
);

-- Policy: Evaluators can update form_evaluasi
CREATE POLICY "Evaluators can update form_evaluasi"
ON public.form_evaluasi
FOR UPDATE
USING (
  public.has_role(auth.uid(), 'evaluator') OR
  public.has_role(auth.uid(), 'admin')
);

-- Enable RLS on LACC table
ALTER TABLE public."LACC" ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view LACC
CREATE POLICY "Anyone can view LACC"
ON public."LACC"
FOR SELECT
USING (true);

-- Policy: Admins can manage LACC
CREATE POLICY "Admins can manage LACC"
ON public."LACC"
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));