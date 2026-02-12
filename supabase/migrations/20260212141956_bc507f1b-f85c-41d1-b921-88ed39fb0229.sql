
-- Create the parent condominium entry
INSERT INTO public.resorts (name, location, description, is_active, rating, reviews_count)
VALUES ('Condomínio Enseada', 'Caldas Novas, GO', 'O Condomínio Enseada oferece estadias de luxo com acesso a piscinas de águas termais naturais, vista panorâmica e ambientes elegantes.', true, 4.8, 342);

-- Set the AP 101 as child of the new condominium
UPDATE public.resorts 
SET parent_id = (SELECT id FROM public.resorts WHERE name = 'Condomínio Enseada' AND parent_id IS NULL LIMIT 1)
WHERE id = 'cac83c4d-61e7-42c9-9346-c19bf54e5a58';
