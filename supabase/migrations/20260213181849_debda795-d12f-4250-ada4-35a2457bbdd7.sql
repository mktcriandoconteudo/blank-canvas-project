-- Add toggle to resorts table
ALTER TABLE public.resorts ADD COLUMN use_available_dates boolean NOT NULL DEFAULT false;

-- Create available_dates table for date ranges
CREATE TABLE public.available_dates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  resort_id uuid NOT NULL REFERENCES public.resorts(id) ON DELETE CASCADE,
  start_date date NOT NULL,
  end_date date NOT NULL,
  label text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.available_dates ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view available dates"
  ON public.available_dates FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage available dates"
  ON public.available_dates FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Owners can manage own resort available dates"
  ON public.available_dates FOR ALL
  USING (EXISTS (SELECT 1 FROM resorts WHERE resorts.id = available_dates.resort_id AND resorts.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM resorts WHERE resorts.id = available_dates.resort_id AND resorts.owner_id = auth.uid()));

-- Index for performance
CREATE INDEX idx_available_dates_resort ON public.available_dates(resort_id);