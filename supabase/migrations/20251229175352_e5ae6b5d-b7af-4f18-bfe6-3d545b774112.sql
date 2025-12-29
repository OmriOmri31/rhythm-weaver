-- Create storage bucket for audio files
INSERT INTO storage.buckets (id, name, public) VALUES ('audio-files', 'audio-files', true);

-- Allow anyone to read audio files
CREATE POLICY "Public audio files are accessible to everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'audio-files');

-- Allow authenticated users to upload audio files
CREATE POLICY "Anyone can upload audio files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'audio-files');

-- Create mixes table to store mix results
CREATE TABLE public.mixes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_prompt TEXT NOT NULL,
  parsed_mix JSONB,
  audio_urls TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS but allow all access since this is a public tool
ALTER TABLE public.mixes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create mixes"
ON public.mixes FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can view mixes"
ON public.mixes FOR SELECT
USING (true);