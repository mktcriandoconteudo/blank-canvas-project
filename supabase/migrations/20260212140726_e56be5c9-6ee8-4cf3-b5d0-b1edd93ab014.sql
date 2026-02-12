
-- Add resort_id to selector_options for per-resort options
ALTER TABLE public.selector_options ADD COLUMN IF NOT EXISTS resort_id uuid REFERENCES public.resorts(id) ON DELETE CASCADE;

-- Update RLS: owners can manage their own resort's options
CREATE POLICY "Owners can manage own resort options"
ON public.selector_options FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.resorts
    WHERE resorts.id = selector_options.resort_id
    AND resorts.owner_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.resorts
    WHERE resorts.id = selector_options.resort_id
    AND resorts.owner_id = auth.uid()
  )
);
