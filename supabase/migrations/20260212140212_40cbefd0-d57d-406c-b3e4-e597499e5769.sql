
-- 1. Add 'owner' to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'owner';

-- 2. Add owner_id to resorts
ALTER TABLE public.resorts ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- 3. Create payment config table per resort
CREATE TABLE public.resort_payment_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resort_id uuid NOT NULL REFERENCES public.resorts(id) ON DELETE CASCADE UNIQUE,
  payment_method text NOT NULL DEFAULT 'manual',
  -- Pix manual fields
  pix_key text,
  pix_name text,
  pix_bank text,
  -- Mercado Pago fields
  mp_access_token text,
  mp_public_key text,
  -- Contact
  whatsapp text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.resort_payment_config ENABLE ROW LEVEL SECURITY;

-- RLS: Admins can do everything
CREATE POLICY "Admins can manage payment config"
ON public.resort_payment_config FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- RLS: Owners can manage their own resort's payment config
CREATE POLICY "Owners can manage own payment config"
ON public.resort_payment_config FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.resorts
    WHERE resorts.id = resort_payment_config.resort_id
    AND resorts.owner_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.resorts
    WHERE resorts.id = resort_payment_config.resort_id
    AND resorts.owner_id = auth.uid()
  )
);

-- RLS: Public can read non-sensitive fields (via view later)
CREATE POLICY "Anyone can view payment method type"
ON public.resort_payment_config FOR SELECT
USING (true);

-- 4. Update resorts RLS: owners can update their own resort
CREATE POLICY "Owners can update own resort"
ON public.resorts FOR UPDATE
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can view own resort"
ON public.resorts FOR SELECT
USING (owner_id = auth.uid());

-- 5. Trigger for updated_at on payment config
CREATE TRIGGER update_resort_payment_config_updated_at
BEFORE UPDATE ON public.resort_payment_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
