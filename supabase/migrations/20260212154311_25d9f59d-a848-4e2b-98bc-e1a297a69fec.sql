
-- Seed default landing page settings
INSERT INTO public.site_settings (key, value) VALUES
('landing_badge', 'Caldas Novas, GO'),
('landing_label', 'Hotéis & Resorts'),
('landing_title', 'Encontre a estadia perfeita para você'),
('landing_subtitle', 'Reserve em segundos e aproveite os melhores resorts de águas quentes.'),
('landing_button_text', 'Explorar agora'),
('landing_button_color', '#ffffff'),
('landing_button_text_color', '#000000'),
('landing_bg_url', '')
ON CONFLICT (key) DO NOTHING;
