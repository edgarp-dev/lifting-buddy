-- Update search_exercises function to filter by muscle group
-- Fixes: https://github.com/edgarp-dev/lifting-buddy/issues/2

CREATE OR REPLACE FUNCTION search_exercises (
  query_text text,
  filter_muscle_group text
)
RETURNS TABLE (
  id uuid,
  name text,
  muscle_group text
)
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    id,
    name,
    muscle_group
  FROM workout_exercise_definition
  WHERE
    user_id = (SELECT auth.uid())
    AND deleted_at IS NULL
    AND name ILIKE '%' || query_text || '%'
    AND muscle_group = filter_muscle_group
  ORDER BY name;
$$;

-- Drop old single-param function to avoid ambiguity
DROP FUNCTION IF EXISTS search_exercises(text);
