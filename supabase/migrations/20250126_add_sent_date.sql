-- Add sent_date column to invoices table for tracking when invoice was sent to client

ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS sent_date DATE;

COMMENT ON COLUMN invoices.sent_date IS 'Date when the invoice was sent to the client';
