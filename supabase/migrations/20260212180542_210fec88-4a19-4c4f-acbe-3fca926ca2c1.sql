
-- Drop old table and recreate with full fields
DROP TABLE IF EXISTS public.reservation_guests;

-- Responsible person details on the reservation itself
ALTER TABLE public.reservations
  ADD COLUMN IF NOT EXISTS responsible_rg text,
  ADD COLUMN IF NOT EXISTS responsible_cpf text,
  ADD COLUMN IF NOT EXISTS responsible_civil_status text,
  ADD COLUMN IF NOT EXISTS responsible_street text,
  ADD COLUMN IF NOT EXISTS responsible_number text,
  ADD COLUMN IF NOT EXISTS responsible_cep text,
  ADD COLUMN IF NOT EXISTS responsible_neighborhood text,
  ADD COLUMN IF NOT EXISTS responsible_city text;

-- Adults: name + CPF
-- Children: name + age
CREATE TABLE public.reservation_guests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reservation_id uuid NOT NULL REFERENCES public.reservations(id) ON DELETE CASCADE,
  guest_type text NOT NULL DEFAULT 'adult', -- 'adult' or 'child'
  full_name text NOT NULL,
  cpf text,
  age integer, -- for children
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.reservation_guests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert reservation guests"
ON public.reservation_guests FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can manage reservation guests"
ON public.reservation_guests FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view reservation guests"
ON public.reservation_guests FOR SELECT
USING (true);
