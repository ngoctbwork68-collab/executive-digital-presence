-- Create storage bucket for media uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'portfolio-media',
  'portfolio-media',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime']
);

-- RLS policies for portfolio-media bucket
CREATE POLICY "Allow authenticated users to upload media"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'portfolio-media');

CREATE POLICY "Allow authenticated users to update their uploads"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'portfolio-media');

CREATE POLICY "Allow authenticated users to delete their uploads"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'portfolio-media');

CREATE POLICY "Allow public read access to portfolio media"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'portfolio-media');