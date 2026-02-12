CREATE TABLE public.pricing_plans (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  resort_id uuid NOT NULL REFERENCES public.resorts(id) ON DELETE CASCADE,
  name text NOT NULL,
  sessions text NOT NULL,
  price_per_night numeric NOT NULL,
  total_nights integer NOT NULL DEFAULT 2,
  is_popular boolean DEFAULT false,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.pricing_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view pricing plans"
ON public.pricing_plans FOR SELECT USING (true);

CREATE POLICY "Admins can manage pricing plans"
ON public.pricing_plans FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Pre-populate for existing resort
INSERT INTO public.pricing_plans (resort_id, name, sessions, price_per_night, total_nights, is_popular, display_order) VALUES
('cac83c4d-61e7-42c9-9346-c19bf54e5a58', 'Essencial', '2 diárias', 620, 2, false, 1),
('cac83c4d-61e7-42c9-9346-c19bf54e5a58', 'Premium', '5 diárias', 550, 5, true, 2),
('cac83c4d-61e7-42c9-9346-c19bf54e5a58', 'VIP', '10 diárias', 480, 10, false, 3);