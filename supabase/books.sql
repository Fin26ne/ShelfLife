-- ==============================================================================
-- ShelfLife - Database Schema & Row Level Security (RLS)
-- Student: Nguyen Tri Thien - QE200082
-- ==============================================================================

DROP TABLE IF EXISTS public.books CASCADE;

CREATE TABLE public.books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  title text NOT NULL,
  author text NOT NULL,
  pages integer NOT NULL,
  status text NOT NULL DEFAULT 'To Read',
  created_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT check_title CHECK (char_length(btrim(title)) >= 1 AND char_length(title) <= 80),
  CONSTRAINT check_author CHECK (char_length(btrim(author)) >= 1 AND char_length(author) <= 60),
  CONSTRAINT check_pages CHECK (pages >= 1 AND pages <= 5000),
  CONSTRAINT check_status CHECK (status IN ('To Read', 'Reading', 'Finished'))
);

ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_select_books"
  ON public.books
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "authenticated_insert_books"
  ON public.books
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "authenticated_update_books"
  ON public.books
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "authenticated_delete_books"
  ON public.books
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
