ALTER TABLE public.resorts DROP COLUMN important_info;
ALTER TABLE public.resorts ADD COLUMN important_info text[] DEFAULT '{}'::text[];