
-- Create enum for community status
CREATE TYPE public.community_status AS ENUM ('none', 'community', 'neighborhood_star');

-- Add column to animal_reports
ALTER TABLE public.animal_reports
ADD COLUMN community_status public.community_status NOT NULL DEFAULT 'none';
