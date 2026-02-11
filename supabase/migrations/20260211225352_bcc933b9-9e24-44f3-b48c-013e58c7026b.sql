
-- Create admin_usernames table to map usernames to user IDs
CREATE TABLE public.admin_usernames (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE
);

ALTER TABLE public.admin_usernames ENABLE ROW LEVEL SECURITY;

-- Only admins can read
CREATE POLICY "Admins can read usernames"
ON public.admin_usernames FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Insert the mapping for Walliston
INSERT INTO public.admin_usernames (user_id, username)
VALUES ('4118d366-0c83-43b1-b4ac-cc33a7891429', 'Walliston');
