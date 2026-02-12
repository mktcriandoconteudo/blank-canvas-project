
-- Add parent_id for condominium -> apartment hierarchy
ALTER TABLE public.resorts 
ADD COLUMN parent_id uuid REFERENCES public.resorts(id) ON DELETE CASCADE;

-- Index for fast lookups of apartments by parent
CREATE INDEX idx_resorts_parent_id ON public.resorts(parent_id);
