
-- Table for blocked/unavailable dates per resort
CREATE TABLE public.blocked_dates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  resort_id UUID NOT NULL REFERENCES public.resorts(id) ON DELETE CASCADE,
  blocked_date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Unique constraint: one entry per resort per date
ALTER TABLE public.blocked_dates ADD CONSTRAINT unique_resort_blocked_date UNIQUE (resort_id, blocked_date);

-- Enable RLS
ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY;

-- Anyone can view blocked dates (needed for availability check)
CREATE POLICY "Anyone can view blocked dates"
ON public.blocked_dates
FOR SELECT
USING (true);

-- Admins can manage blocked dates
CREATE POLICY "Admins can manage blocked dates"
ON public.blocked_dates
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Index for fast lookups
CREATE INDEX idx_blocked_dates_resort_date ON public.blocked_dates (resort_id, blocked_date);
