
-- Create function to get all users (admin only)
CREATE OR REPLACE FUNCTION public.get_all_users()
RETURNS SETOF profiles
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is admin
  IF (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' THEN
    RETURN QUERY SELECT * FROM public.profiles;
  ELSE
    RAISE EXCEPTION 'Permission denied: Admin role required';
  END IF;
END;
$$;

-- Create function to get pending deposits (admin only)
CREATE OR REPLACE FUNCTION public.get_pending_deposits()
RETURNS SETOF transactions
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is admin
  IF (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' THEN
    RETURN QUERY 
      SELECT * 
      FROM public.transactions 
      WHERE type = 'deposit' AND status = 'pending'
      ORDER BY date DESC;
  ELSE
    RAISE EXCEPTION 'Permission denied: Admin role required';
  END IF;
END;
$$;

-- Create function to get pending withdrawals with user info (admin only)
CREATE OR REPLACE FUNCTION public.get_pending_withdrawals()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  amount numeric,
  status text,
  date timestamp with time zone,
  trc20_address text,
  tx_hash text,
  rejection_reason text,
  name text,
  email text,
  username text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is admin
  IF (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' THEN
    RETURN QUERY 
      SELECT 
        w.id,
        w.user_id,
        w.amount,
        w.status,
        w.date,
        w.trc20_address,
        w.tx_hash,
        w.rejection_reason,
        p.name,
        p.email,
        p.username
      FROM public.withdrawal_requests w
      JOIN public.profiles p ON w.user_id = p.id
      WHERE w.status = 'pending'
      ORDER BY w.date DESC;
  ELSE
    RAISE EXCEPTION 'Permission denied: Admin role required';
  END IF;
END;
$$;

-- Create function to get all investment plans (admin only)
CREATE OR REPLACE FUNCTION public.get_admin_plans()
RETURNS SETOF products
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is admin
  IF (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' THEN
    RETURN QUERY 
      SELECT * 
      FROM public.products 
      ORDER BY created_at DESC;
  ELSE
    RAISE EXCEPTION 'Permission denied: Admin role required';
  END IF;
END;
$$;

-- Update RLS policies for products to allow admins to manage them
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'products' AND policyname = 'Admins can manage all products'
    ) THEN
        CREATE POLICY "Admins can manage all products" 
        ON products
        USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
    END IF;
END
$$;

-- Enable RLS on products table if not already enabled
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
