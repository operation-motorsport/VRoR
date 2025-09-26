-- Supabase Storage Setup for Operation Motorsport
-- Run this in your Supabase SQL Editor AFTER running the main schema

-- Create storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES
  ('veteran-photos', 'veteran-photos', false, 52428800), -- 50MB limit
  ('team-photos', 'team-photos', false, 52428800),       -- 50MB limit
  ('event-photos', 'event-photos', false, 52428800),     -- 50MB limit
  ('documents', 'documents', false, 52428800)            -- 50MB limit
ON CONFLICT (id) DO NOTHING;

-- Storage policies for veteran-photos bucket
CREATE POLICY "Authenticated users can view veteran photos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'veteran-photos' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Admins can upload veteran photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'veteran-photos' AND
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can delete veteran photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'veteran-photos' AND
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Storage policies for team-photos bucket
CREATE POLICY "Authenticated users can view team photos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'team-photos' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Admins can upload team photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'team-photos' AND
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can delete team photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'team-photos' AND
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Storage policies for event-photos bucket
CREATE POLICY "Authenticated users can view event photos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'event-photos' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Admins can upload event photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'event-photos' AND
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can delete event photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'event-photos' AND
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Storage policies for documents bucket
CREATE POLICY "Authenticated users can view documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'documents' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Admins can upload documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'documents' AND
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can delete documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'documents' AND
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  )
);