
-- Remove the overly permissive update policy (webhook uses service_role which bypasses RLS)
DROP POLICY IF EXISTS "Service role can update reservations" ON public.reservations;

-- Tighten INSERT: only allow pending status on creation
DROP POLICY IF EXISTS "Anyone can create reservations" ON public.reservations;
CREATE POLICY "Anyone can create reservations"
ON public.reservations
FOR INSERT
WITH CHECK (payment_status = 'pending');
