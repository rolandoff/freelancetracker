-- =======================
-- STORAGE BUCKETS AND POLICIES
-- =======================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('activity-attachments', 'activity-attachments', false),
  ('invoice-pdfs', 'invoice-pdfs', false);

-- =======================
-- STORAGE POLICIES: activity-attachments
-- =======================

CREATE POLICY "Users can upload their own activity attachments"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'activity-attachments'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own activity attachments"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'activity-attachments'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own activity attachments"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'activity-attachments'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- =======================
-- STORAGE POLICIES: invoice-pdfs
-- =======================

CREATE POLICY "Users can upload their own invoice PDFs"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'invoice-pdfs'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own invoice PDFs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'invoice-pdfs'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own invoice PDFs"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'invoice-pdfs'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Note: File naming convention
-- {bucket_id}/{user_id}/{resource_id}/{filename}
-- Example: activity-attachments/user-abc123/activity-xyz789/screenshot.png
