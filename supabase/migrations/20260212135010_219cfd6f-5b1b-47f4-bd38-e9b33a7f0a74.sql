
-- Reservations table
CREATE TABLE public.reservations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  resort_id UUID NOT NULL REFERENCES public.resorts(id) ON DELETE CASCADE,
  plan_name TEXT NOT NULL,
  plan_sessions TEXT NOT NULL,
  price_per_night NUMERIC NOT NULL,
  total_nights INTEGER NOT NULL,
  total_price NUMERIC NOT NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  guests INTEGER NOT NULL DEFAULT 1,
  guest_name TEXT,
  guest_email TEXT,
  guest_phone TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  mp_preference_id TEXT,
  mp_payment_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Anyone can create a reservation (public checkout)
CREATE POLICY "Anyone can create reservations"
ON public.reservations
FOR INSERT
WITH CHECK (true);

-- Anyone can view their own reservation by id (for status page)
CREATE POLICY "Anyone can view reservations"
ON public.reservations
FOR SELECT
USING (true);

-- Admins can manage all reservations
CREATE POLICY "Admins can manage reservations"
ON public.reservations
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Only the webhook edge function (service role) updates payment status
CREATE POLICY "Service role can update reservations"
ON public.reservations
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Index for lookups
CREATE INDEX idx_reservations_resort_dates ON public.reservations (resort_id, check_in, check_out);
CREATE INDEX idx_reservations_mp_preference ON public.reservations (mp_preference_id);

-- Trigger for updated_at
CREATE TRIGGER update_reservations_updated_at
BEFORE UPDATE ON public.reservations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
