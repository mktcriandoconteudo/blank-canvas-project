-- Assign all existing options to the resort
UPDATE public.selector_options 
SET resort_id = 'cac83c4d-61e7-42c9-9346-c19bf54e5a58' 
WHERE resort_id IS NULL;
