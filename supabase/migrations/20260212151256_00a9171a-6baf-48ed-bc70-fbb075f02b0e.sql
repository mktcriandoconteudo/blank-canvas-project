-- Add unique constraint for blocked_dates upsert (auto-block after payment)
ALTER TABLE public.blocked_dates
ADD CONSTRAINT blocked_dates_resort_date_unique UNIQUE (resort_id, blocked_date);