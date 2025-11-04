-- Add payment_status column to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed'));

-- Add transaction_id column for storing payment transaction reference
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS transaction_id TEXT;

-- Update existing orders to have pending status
UPDATE orders 
SET payment_status = 'pending' 
WHERE payment_status IS NULL;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);

