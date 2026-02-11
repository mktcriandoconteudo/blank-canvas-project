
-- Create enum for roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS: only admins can read user_roles
CREATE POLICY "Admins can read roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Resorts table
CREATE TABLE public.resorts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT NOT NULL DEFAULT 'Caldas Novas, GO',
  description TEXT,
  price_per_night NUMERIC(10,2),
  rating NUMERIC(3,2) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  beds INTEGER DEFAULT 1,
  max_guests INTEGER DEFAULT 2,
  tag TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.resorts ENABLE ROW LEVEL SECURITY;

-- Public can read active resorts
CREATE POLICY "Anyone can view active resorts"
ON public.resorts FOR SELECT
USING (is_active = true);

-- Admins can do everything
CREATE POLICY "Admins can manage resorts"
ON public.resorts FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Resort photos table
CREATE TABLE public.resort_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resort_id UUID REFERENCES public.resorts(id) ON DELETE CASCADE NOT NULL,
  storage_path TEXT NOT NULL,
  url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_cover BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.resort_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view resort photos"
ON public.resort_photos FOR SELECT
USING (true);

CREATE POLICY "Admins can manage photos"
ON public.resort_photos FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_resorts_updated_at
BEFORE UPDATE ON public.resorts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for resort photos
INSERT INTO storage.buckets (id, name, public) VALUES ('resort-photos', 'resort-photos', true);

CREATE POLICY "Anyone can view resort photos storage"
ON storage.objects FOR SELECT
USING (bucket_id = 'resort-photos');

CREATE POLICY "Admins can upload resort photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'resort-photos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete resort photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'resort-photos' AND public.has_role(auth.uid(), 'admin'));
