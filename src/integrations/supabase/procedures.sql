
-- Function to handle investment creation and associated transaction
CREATE OR REPLACE FUNCTION create_investment(
  p_user_id UUID,
  p_product_id UUID,
  p_amount NUMERIC,
  p_end_date TIMESTAMPTZ,
  p_starting_value NUMERIC,
  p_current_value NUMERIC,
  p_final_value NUMERIC
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_investment_id UUID;
  v_user_balance NUMERIC;
  v_transaction_id UUID;
  v_product_record products%ROWTYPE;
BEGIN
  -- Fetch the product information
  SELECT * INTO v_product_record
  FROM products
  WHERE id = p_product_id::UUID; -- Explicit cast to UUID
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Product not found';
  END IF;
  
  -- Check if product is active
  IF NOT v_product_record.active THEN
    RAISE EXCEPTION 'This investment product is not currently available';
  END IF;
  
  -- Check if user exists and get current balance
  SELECT balance INTO v_user_balance
  FROM profiles
  WHERE id = p_user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  -- Check if user has enough balance
  IF v_user_balance < v_product_record.amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;
  
  -- Begin transaction
  BEGIN
    -- Calculate investment parameters
    p_amount := v_product_record.amount;
    p_starting_value := v_product_record.amount;
    p_current_value := v_product_record.amount;
    p_end_date := NOW() + (v_product_record.duration * INTERVAL '1 day');
    p_final_value := v_product_record.amount * 2; -- Double the investment amount
    
    -- Create new investment
    INSERT INTO investments (
      user_id,
      product_id,
      amount,
      end_date,
      starting_value,
      current_value,
      final_value,
      status,
      last_profit_claim_date
    ) VALUES (
      p_user_id,
      p_product_id::UUID,
      p_amount,
      p_end_date,
      p_starting_value,
      p_current_value,
      p_final_value,
      'active',
      NOW()
    ) RETURNING id INTO v_investment_id;
    
    -- Create transaction record
    INSERT INTO transactions (
      user_id,
      type,
      amount,
      status,
      description
    ) VALUES (
      p_user_id,
      'investment',
      -p_amount, -- Negative as money is leaving balance
      'completed',
      'Investment in ' || v_product_record.name
    ) RETURNING id INTO v_transaction_id;
    
    -- Update user balance
    UPDATE profiles
    SET 
      balance = balance - p_amount,
      total_invested = total_invested + p_amount
    WHERE id = p_user_id;
    
    -- Commit transaction
    RETURN jsonb_build_object(
      'success', true,
      'investment_id', v_investment_id,
      'transaction_id', v_transaction_id
    );
  EXCEPTION WHEN OTHERS THEN
    -- Rollback is automatic in PL/pgSQL functions on exception
    RAISE;
  END;
END;
$$;
