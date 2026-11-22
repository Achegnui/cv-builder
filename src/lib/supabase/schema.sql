-- =========================================================================
-- Phase 8: Supabase PostgreSQL Schema & Row Level Security (RLS)
-- Multi-tenant isolation ensuring User A cannot read or modify User B's CVs.
-- =========================================================================

-- 1. Create table for multiple CV versions per user
CREATE TABLE IF NOT EXISTS public.cv_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Untitled CV',
  cv_data JSONB NOT NULL,
  vault_data JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for speedy queries by user
CREATE INDEX IF NOT EXISTS idx_cv_versions_user_id ON public.cv_versions (user_id);
CREATE INDEX IF NOT EXISTS idx_cv_versions_updated_at ON public.cv_versions (updated_at DESC);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.cv_versions ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies: Strictly enforce user isolation at the database engine level

-- SELECT: Users can only view their own CV versions
CREATE POLICY "Users can only select their own cv versions"
  ON public.cv_versions
  FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: Users can only insert CV versions where user_id matches their authenticated ID
CREATE POLICY "Users can only insert their own cv versions"
  ON public.cv_versions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can only update their own CV versions
CREATE POLICY "Users can only update their own cv versions"
  ON public.cv_versions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can only delete their own CV versions
CREATE POLICY "Users can only delete their own cv versions"
  ON public.cv_versions
  FOR DELETE
  USING (auth.uid() = user_id);

-- 4. Automatic updated_at timestamp trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_cv_versions_updated_at ON public.cv_versions;
CREATE TRIGGER trigger_cv_versions_updated_at
  BEFORE UPDATE ON public.cv_versions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Note on account deletion:
-- Because user_id has `REFERENCES auth.users(id) ON DELETE CASCADE`,
-- executing `DELETE FROM auth.users WHERE id = :userId` automatically and
-- permanently deletes all of that user's CV versions and associated records.
