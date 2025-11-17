-- Normalize workouts table into exercises, workout_sessions, and workout_sets
-- This migration creates a more scalable schema with proper normalization

-- 1. Create exercises table (exercise definitions)
CREATE TABLE exercises (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  name text NOT NULL,
  muscle_group text,
  embedding vector(1536),
  deleted_at timestamptz
);

-- 2. Create workout_sessions table (groups sets into workouts)
CREATE TABLE workout_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  workout_date date DEFAULT CURRENT_DATE NOT NULL,
  deleted_at timestamptz
);

-- 3. Create workout_sets table (individual sets)
CREATE TABLE workout_sets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  session_id uuid REFERENCES workout_sessions(id) ON DELETE CASCADE,
  exercise_id uuid REFERENCES exercises(id) NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  -- Set details
  set_number int NOT NULL DEFAULT 1,
  reps int NOT NULL,
  weight_kg double precision NOT NULL,
  embedding vector(1536),
  deleted_at timestamptz
);

-- 4. Create indexes for performance
-- Exercises indexes
CREATE INDEX idx_exercises_user_name ON exercises(user_id, name);
CREATE INDEX idx_exercises_user_muscle_group ON exercises(user_id, muscle_group) WHERE muscle_group IS NOT NULL;
CREATE INDEX idx_exercises_embedding ON exercises USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX idx_exercises_deleted ON exercises(deleted_at) WHERE deleted_at IS NULL;

-- Workout sessions indexes
CREATE INDEX idx_workout_sessions_user_date ON workout_sessions(user_id, workout_date DESC);
CREATE INDEX idx_workout_sessions_user_created ON workout_sessions(user_id, created_at DESC);
CREATE INDEX idx_workout_sessions_deleted ON workout_sessions(deleted_at) WHERE deleted_at IS NULL;

-- Workout sets indexes
CREATE INDEX idx_workout_sets_user_created ON workout_sets(user_id, created_at DESC);
CREATE INDEX idx_workout_sets_session ON workout_sets(session_id, set_number);
CREATE INDEX idx_workout_sets_exercise ON workout_sets(exercise_id);
CREATE INDEX idx_workout_sets_embedding ON workout_sets USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX idx_workout_sets_deleted ON workout_sets(deleted_at) WHERE deleted_at IS NULL;

-- 5. Create trigger functions for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Create triggers
CREATE TRIGGER update_exercises_updated_at
  BEFORE UPDATE ON exercises
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workout_sessions_updated_at
  BEFORE UPDATE ON workout_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workout_sets_updated_at
  BEFORE UPDATE ON workout_sets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. Enable Row Level Security
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sets ENABLE ROW LEVEL SECURITY;

-- 8. RLS Policies for exercises (user-specific)
CREATE POLICY "Users can view their own exercises"
  ON exercises FOR SELECT
  USING ((SELECT auth.uid()) = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can insert their own exercises"
  ON exercises FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own exercises"
  ON exercises FOR UPDATE
  USING ((SELECT auth.uid()) = user_id AND deleted_at IS NULL)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete their own exercises"
  ON exercises FOR DELETE
  USING ((SELECT auth.uid()) = user_id);

-- 9. RLS Policies for workout_sessions
CREATE POLICY "Users can view their own workout sessions"
  ON workout_sessions FOR SELECT
  USING ((SELECT auth.uid()) = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can insert their own workout sessions"
  ON workout_sessions FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own workout sessions"
  ON workout_sessions FOR UPDATE
  USING ((SELECT auth.uid()) = user_id AND deleted_at IS NULL)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete their own workout sessions"
  ON workout_sessions FOR DELETE
  USING ((SELECT auth.uid()) = user_id);

-- 10. RLS Policies for workout_sets
CREATE POLICY "Users can view their own workout sets"
  ON workout_sets FOR SELECT
  USING ((SELECT auth.uid()) = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can insert their own workout sets"
  ON workout_sets FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own workout sets"
  ON workout_sets FOR UPDATE
  USING ((SELECT auth.uid()) = user_id AND deleted_at IS NULL)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete their own workout sets"
  ON workout_sets FOR DELETE
  USING ((SELECT auth.uid()) = user_id);

-- 11. Migrate existing data from old workouts table
DO $$
DECLARE
  v_exercise_id uuid;
  v_session_id uuid;
  v_workout record;
  v_set record;
  v_table_exists boolean;
BEGIN
  -- Check if old workouts table exists
  SELECT EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'workouts'
  ) INTO v_table_exists;

  -- Only migrate if the old table exists
  IF NOT v_table_exists THEN
    RAISE NOTICE 'No existing workouts table found, skipping data migration';
    RETURN;
  END IF;

  -- For each workout in the old table
  FOR v_workout IN
    SELECT DISTINCT ON (user_id, DATE(created_at))
      user_id,
      DATE(created_at) as workout_date,
      created_at
    FROM workouts
    ORDER BY user_id, DATE(created_at), created_at
  LOOP
    -- Create a workout session for each unique user + date combination
    INSERT INTO workout_sessions (user_id, workout_date, created_at)
    VALUES (v_workout.user_id, v_workout.workout_date, v_workout.created_at)
    RETURNING id INTO v_session_id;

    -- Migrate sets for this session
    FOR v_set IN
      SELECT * FROM workouts w
      WHERE w.user_id = v_workout.user_id
        AND DATE(w.created_at) = v_workout.workout_date
    LOOP
      -- Check if exercise exists, if not create it
      SELECT id INTO v_exercise_id
      FROM exercises
      WHERE user_id = v_set.user_id
        AND lower(name) = lower(v_set.exercise_name);

      -- Create exercise if it doesn't exist
      IF v_exercise_id IS NULL THEN
        INSERT INTO exercises (user_id, name, muscle_group, embedding)
        VALUES (v_set.user_id, v_set.exercise_name, v_set.muscle_group, v_set.embedding)
        RETURNING id INTO v_exercise_id;
      END IF;

      -- Insert the workout set
      INSERT INTO workout_sets (
        user_id,
        session_id,
        exercise_id,
        created_at,
        reps,
        weight_kg,
        embedding
      )
      VALUES (
        v_set.user_id,
        v_session_id,
        v_exercise_id,
        v_set.created_at,
        v_set.reps,
        v_set.weight_kg,
        v_set.embedding
      );

      -- Reset exercise_id for next iteration
      v_exercise_id := NULL;
    END LOOP;
  END LOOP;
END $$;

-- 12. Update match_workouts function to work with new schema
DROP FUNCTION IF EXISTS match_workouts(vector(1536), float, int);
CREATE OR REPLACE FUNCTION match_workouts (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  exercise_name text,
  reps int,
  weight_kg double precision,
  created_at timestamptz,
  similarity double precision
)
LANGUAGE sql STABLE
AS $$
  SELECT
    ws.id,
    e.name as exercise_name,
    ws.reps,
    ws.weight_kg,
    ws.created_at,
    1 - (ws.embedding <=> query_embedding) AS similarity
  FROM workout_sets ws
  JOIN exercises e ON ws.exercise_id = e.id
  WHERE
    ws.user_id = (SELECT auth.uid())
    AND e.user_id = (SELECT auth.uid())
    AND ws.deleted_at IS NULL
    AND e.deleted_at IS NULL
    AND 1 - (ws.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
$$;

-- 13. Create helpful views
-- View to see complete workout sessions with exercises
CREATE OR REPLACE VIEW workout_session_details AS
SELECT
  ws_session.id as session_id,
  ws_session.user_id,
  ws_session.workout_date,
  ws_session.created_at as session_created_at,
  ws.id as set_id,
  ws.set_number,
  e.name as exercise_name,
  e.muscle_group,
  ws.reps,
  ws.weight_kg,
  ws.created_at as set_created_at
FROM workout_sessions ws_session
LEFT JOIN workout_sets ws ON ws_session.id = ws.session_id
LEFT JOIN exercises e ON ws.exercise_id = e.id
WHERE ws_session.deleted_at IS NULL
  AND (ws.deleted_at IS NULL OR ws.id IS NULL);

COMMENT ON TABLE exercises IS 'Exercise definitions with muscle groups and instructions';
COMMENT ON TABLE workout_sessions IS 'Workout sessions that group multiple sets together';
COMMENT ON TABLE workout_sets IS 'Individual sets performed during a workout session';
