-- (Optional) Clear old data if you have any
-- TRUNCATE TABLE workouts;

-- 1. Alter the table to accept the new vector size
ALTER TABLE workouts
ALTER COLUMN embedding TYPE vector(768);

-- 2. Recreate the search function with the correct vector size
-- This ensures our queries use the right type
DROP FUNCTION if exists match_workouts(vector(1536), float, int); -- Drop the old function
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
  WHERE 1 - (workouts.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
$$;
