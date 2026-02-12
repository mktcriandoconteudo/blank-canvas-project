
CREATE TABLE public.faq_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  resort_id UUID NOT NULL REFERENCES public.resorts(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.faq_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view faq items" ON public.faq_items FOR SELECT USING (true);
CREATE POLICY "Admins can manage faq items" ON public.faq_items FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Owners can manage own resort faq" ON public.faq_items FOR ALL USING (EXISTS (SELECT 1 FROM resorts WHERE resorts.id = faq_items.resort_id AND resorts.owner_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM resorts WHERE resorts.id = faq_items.resort_id AND resorts.owner_id = auth.uid()));
