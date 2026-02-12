
INSERT INTO public.site_settings (key, value) VALUES
('landing_logo_url', '')
ON CONFLICT (key) DO NOTHING;
