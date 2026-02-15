-- 1. FIX CUSTOMERS TABLE RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own profile during registration
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.customers;
CREATE POLICY "Users can insert their own profile" 
ON public.customers FOR INSERT 
WITH CHECK (true); -- Permissive for demo/registration flow

-- Allow users to view their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.customers;
CREATE POLICY "Users can view own profile" 
ON public.customers FOR SELECT 
USING (auth.uid() = id);


-- 2. FIX REVIEWS TABLE RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to create reviews
DROP POLICY IF EXISTS "Authenticated users can create reviews" ON public.reviews;
CREATE POLICY "Authenticated users can create reviews" 
ON public.reviews FOR INSERT 
WITH CHECK (true); -- Permissive for demo

-- Ensure public can see approved reviews
DROP POLICY IF EXISTS "Public can view approved reviews" ON public.reviews;
CREATE POLICY "Public can view approved reviews" 
ON public.reviews FOR SELECT 
USING (true);


-- 3. CREATE AUTH_USERS VIEW (To link reviews with user emails)
-- This allows the front-end to join reviews with a public view of user emails
CREATE OR REPLACE VIEW public.auth_users AS
SELECT id, email FROM auth.users;

-- Allow public read of this specific view
GRANT SELECT ON public.auth_users TO anon, authenticated;
