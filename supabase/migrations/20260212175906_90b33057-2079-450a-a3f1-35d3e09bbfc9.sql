
-- Storage bucket for payment receipts
INSERT INTO storage.buckets (id, name, public) VALUES ('payment-receipts', 'payment-receipts', false)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for receipts bucket
CREATE POLICY "Anyone can upload receipts"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'payment-receipts');

CREATE POLICY "Admins can view receipts"
ON storage.objects FOR SELECT
USING (bucket_id = 'payment-receipts' AND EXISTS (
  SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Authenticated users can view own receipts"
ON storage.objects FOR SELECT
USING (bucket_id = 'payment-receipts' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add receipt_url to reservations
ALTER TABLE public.reservations ADD COLUMN IF NOT EXISTS receipt_url text;

-- Guest details per reservation
CREATE TABLE public.reservation_guests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reservation_id uuid NOT NULL REFERENCES public.reservations(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  is_minor boolean NOT NULL DEFAULT false,
  document text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.reservation_guests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert reservation guests"
ON public.reservation_guests FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can manage reservation guests"
ON public.reservation_guests FOR ALL
USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Anyone can view reservation guests"
ON public.reservation_guests FOR SELECT
USING (true);
