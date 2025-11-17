-- Enable Row Level Security on workouts table
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view only their own workouts
CREATE POLICY "Users can view their own workouts"
  ON workouts
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own workouts
CREATE POLICY "Users can insert their own workouts"
  ON workouts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update only their own workouts
CREATE POLICY "Users can update their own workouts"
  ON workouts
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete only their own workouts
CREATE POLICY "Users can delete their own workouts"
  ON workouts
  FOR DELETE
  USING (auth.uid() = user_id);

-- Update the match_workouts function to respect RLS
-- This ensures the function only returns workouts for the authenticated user
DROP FUNCTION IF EXISTS match_workouts(vector(768), float, int);
CREATE OR REPLACE FUNCTION match_workouts (
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id bigint,
  exercise_name text,
  reps int,
  weight_kg float,
  created_at timestamptz,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    workouts.id,
    workouts.exercise_name,
    workouts.reps,
    workouts.weight_kg,
    workouts.created_at,
    1 - (workouts.embedding <=> query_embedding) AS similarity
  FROM workouts
  WHERE
    workouts.user_id = auth.uid() AND
    1 - (workouts.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
$$;
