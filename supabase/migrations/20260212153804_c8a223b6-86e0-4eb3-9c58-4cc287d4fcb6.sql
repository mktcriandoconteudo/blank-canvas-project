
-- Seed the 5 default hero slides
INSERT INTO public.hero_slides (image_url, title, subtitle, display_order, is_active) VALUES
('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=80', 'Caldas Novas', 'A capital das águas quentes', 1, true),
('https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1600&q=80', 'Parques Aquáticos', 'Diversão para toda a família', 2, true),
('https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1600&q=80', 'Resorts & Spas', 'Relaxe nas águas termais naturais', 3, true),
('https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=1600&q=80', 'Lago Corumbá', 'Paisagens de tirar o fôlego', 4, true),
('https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=1600&q=80', 'Hospedagem Premium', 'Conforto e sofisticação', 5, true);

-- Seed default main title
INSERT INTO public.site_settings (key, value) VALUES
('hero_main_title', 'Descubra Caldas Novas'),
('hero_main_subtitle', 'As melhores hospedagens com águas quentes naturais')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
