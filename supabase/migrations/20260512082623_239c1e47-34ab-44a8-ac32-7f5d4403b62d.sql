CREATE TABLE public.community_stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid NOT NULL,
  rescuer_name text NOT NULL,
  pet_name text NOT NULL,
  action text NOT NULL,
  story text NOT NULL,
  before_photo_url text NOT NULL,
  after_photo_url text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  likes_count integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.community_stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active stories public" ON public.community_stories
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Authors view own stories" ON public.community_stories
  FOR SELECT TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Authenticated create stories" ON public.community_stories
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Authors update own stories" ON public.community_stories
  FOR UPDATE TO authenticated
  USING (auth.uid() = created_by) WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Authors delete own stories" ON public.community_stories
  FOR DELETE TO authenticated
  USING (auth.uid() = created_by);

CREATE TRIGGER community_stories_set_updated_at
  BEFORE UPDATE ON public.community_stories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.story_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id uuid NOT NULL REFERENCES public.community_stories(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (story_id, user_id)
);

CREATE INDEX idx_story_likes_user ON public.story_likes(user_id);

ALTER TABLE public.story_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Likes public" ON public.story_likes
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Users like" ON public.story_likes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users unlike" ON public.story_likes
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.handle_story_like_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_stories SET likes_count = likes_count + 1 WHERE id = NEW.story_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_stories SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.story_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER story_likes_count
  AFTER INSERT OR DELETE ON public.story_likes
  FOR EACH ROW EXECUTE FUNCTION public.handle_story_like_change();