
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
BEGIN
  -- Check if user exists and get current balance
  SELECT balance INTO v_user_balance
  FROM profiles
  WHERE id = p_user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  -- Check if user has enough balance
  IF v_user_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;
  
  -- Begin transaction
  BEGIN
    -- Create new investment
    INSERT INTO investments (
      user_id,
      product_id,
      amount,
      end_date,
      starting_value,
      current_value,
      final_value,
      status
    ) VALUES (
      p_user_id,
      p_product_id,
      p_amount,
      p_end_date,
      p_starting_value,
      p_current_value,
      p_final_value,
      'active'
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
      'Investment in product ' || p_product_id
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

-- Function to update investment values (could be called by a scheduled job)
CREATE OR REPLACE FUNCTION update_investment_values()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inv RECORD;
  days_elapsed INTEGER;
  growth_rate NUMERIC;
BEGIN
  -- For each active investment
  FOR inv IN 
    SELECT i.id, i.starting_value, i.start_date, i.end_date, p.growth_rate
    FROM investments i
    JOIN products p ON i.product_id = p.id
    WHERE i.status = 'active'
  LOOP
    -- Calculate days elapsed
    days_elapsed := EXTRACT(DAY FROM (NOW() - inv.start_date));
    
    -- Get growth rate from product
    growth_rate := inv.growth_rate;
    
    -- Update current value based on days elapsed and growth rate
    UPDATE investments
    SET current_value = starting_value * (1 + growth_rate/100 * days_elapsed)
    WHERE id = inv.id;
    
    -- Check if investment has reached its end date
    IF NOW() >= inv.end_date THEN
      -- Complete the investment and generate return
      UPDATE investments
      SET 
        status = 'completed',
        current_value = final_value
      WHERE id = inv.id;
      
      -- Create transaction for the return
      INSERT INTO transactions (
        user_id,
        type,
        amount,
        status,
        description
      )
      SELECT 
        user_id,
        'return',
        final_value,
        'completed',
        'Return from investment #' || id
      FROM investments
      WHERE id = inv.id;
      
      -- Update user balance with the final value
      UPDATE profiles p
      SET balance = balance + i.final_value
      FROM investments i
      WHERE i.id = inv.id AND p.id = i.user_id;
    END IF;
  END LOOP;
END;
$$;
