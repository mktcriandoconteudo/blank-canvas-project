
ALTER TABLE public.resort_payment_config
ADD COLUMN checkin_time TEXT DEFAULT '14:00',
ADD COLUMN checkout_time TEXT DEFAULT '10:00';
