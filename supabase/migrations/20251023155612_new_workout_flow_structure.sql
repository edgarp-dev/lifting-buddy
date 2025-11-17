CREATE EXTENSION IF NOT EXISTS vector;

DROP VIEW IF EXISTS workout_session_details;
DROP FUNCTION IF EXISTS match_workouts(vector(1536), float, int);


CREATE TABLE IF NOT EXISTS workout_exercise_definition (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  name text NOT NULL,
  muscle_group text,
  embedding vector(1536),
  deleted_at timestamptz
);

CREATE UNIQUE INDEX IF NOT EXISTS unique_exercise_per_user
  ON workout_exercise_definition(user_id, lower(name));

CREATE TABLE IF NOT EXISTS workout_session (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  workout_date date DEFAULT CURRENT_DATE NOT NULL,
  deleted_at timestamptz
);

CREATE TABLE IF NOT EXISTS workout_session_exercise (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  session_id uuid REFERENCES workout_session(id) ON DELETE CASCADE NOT NULL,
  exercise_definition_id uuid REFERENCES workout_exercise_definition(id) NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  exercise_order int NOT NULL DEFAULT 1,
  deleted_at timestamptz,
  CONSTRAINT unique_exercise_order_per_session UNIQUE (session_id, exercise_order)
);

CREATE TABLE IF NOT EXISTS workout_set (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  session_exercise_id uuid REFERENCES workout_session_exercise(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  set_number int NOT NULL DEFAULT 1,
  reps int NOT NULL,
  weight_kg double precision NOT NULL,
  embedding vector(1536),
  deleted_at timestamptz,
  CONSTRAINT positive_reps CHECK (reps > 0),
  CONSTRAINT non_negative_weight CHECK (weight_kg >= 0),
  CONSTRAINT valid_set_number CHECK (set_number > 0),
  CONSTRAINT unique_set_number_per_exercise UNIQUE (session_exercise_id, set_number)
);

CREATE INDEX IF NOT EXISTS idx_exercise_def_user_name
  ON workout_exercise_definition(user_id, name);
CREATE INDEX IF NOT EXISTS idx_exercise_def_muscle_group
  ON workout_exercise_definition(user_id, muscle_group)
  WHERE muscle_group IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_exercise_def_embedding
  ON workout_exercise_definition USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);
CREATE INDEX IF NOT EXISTS idx_exercise_def_deleted
  ON workout_exercise_definition(deleted_at)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_session_user_date
  ON workout_session(user_id, workout_date DESC);
CREATE INDEX IF NOT EXISTS idx_session_user_created
  ON workout_session(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_session_deleted
  ON workout_session(deleted_at)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_session_exercise_session
  ON workout_session_exercise(session_id, exercise_order);
CREATE INDEX IF NOT EXISTS idx_session_exercise_definition
  ON workout_session_exercise(exercise_definition_id);
CREATE INDEX IF NOT EXISTS idx_session_exercise_user
  ON workout_session_exercise(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_session_exercise_deleted
  ON workout_session_exercise(deleted_at)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_set_session_exercise
  ON workout_set(session_exercise_id, set_number);
CREATE INDEX IF NOT EXISTS idx_set_user_created
  ON workout_set(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_set_embedding
  ON workout_set USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);
CREATE INDEX IF NOT EXISTS idx_set_deleted
  ON workout_set(deleted_at)
  WHERE deleted_at IS NULL;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_exercise_def_updated_at ON workout_exercise_definition;
CREATE TRIGGER update_exercise_def_updated_at
  BEFORE UPDATE ON workout_exercise_definition
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_session_updated_at ON workout_session;
CREATE TRIGGER update_session_updated_at
  BEFORE UPDATE ON workout_session
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_session_exercise_updated_at ON workout_session_exercise;
CREATE TRIGGER update_session_exercise_updated_at
  BEFORE UPDATE ON workout_session_exercise
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_set_updated_at ON workout_set;
CREATE TRIGGER update_set_updated_at
  BEFORE UPDATE ON workout_set
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


ALTER TABLE workout_exercise_definition ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_session ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_session_exercise ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_set ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own exercise definitions" ON workout_exercise_definition;
CREATE POLICY "Users can view their own exercise definitions"
  ON workout_exercise_definition FOR SELECT
  USING ((SELECT auth.uid()) = user_id AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Users can insert their own exercise definitions" ON workout_exercise_definition;
CREATE POLICY "Users can insert their own exercise definitions"
  ON workout_exercise_definition FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own exercise definitions" ON workout_exercise_definition;
CREATE POLICY "Users can update their own exercise definitions"
  ON workout_exercise_definition FOR UPDATE
  USING ((SELECT auth.uid()) = user_id AND deleted_at IS NULL)
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete their own exercise definitions" ON workout_exercise_definition;
CREATE POLICY "Users can delete their own exercise definitions"
  ON workout_exercise_definition FOR DELETE
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can view their own workout sessions" ON workout_session;
CREATE POLICY "Users can view their own workout sessions"
  ON workout_session FOR SELECT
  USING ((SELECT auth.uid()) = user_id AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Users can insert their own workout sessions" ON workout_session;
CREATE POLICY "Users can insert their own workout sessions"
  ON workout_session FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own workout sessions" ON workout_session;
CREATE POLICY "Users can update their own workout sessions"
  ON workout_session FOR UPDATE
  USING ((SELECT auth.uid()) = user_id AND deleted_at IS NULL)
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete their own workout sessions" ON workout_session;
CREATE POLICY "Users can delete their own workout sessions"
  ON workout_session FOR DELETE
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can view their own session exercises" ON workout_session_exercise;
CREATE POLICY "Users can view their own session exercises"
  ON workout_session_exercise FOR SELECT
  USING ((SELECT auth.uid()) = user_id AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Users can insert their own session exercises" ON workout_session_exercise;
CREATE POLICY "Users can insert their own session exercises"
  ON workout_session_exercise FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own session exercises" ON workout_session_exercise;
CREATE POLICY "Users can update their own session exercises"
  ON workout_session_exercise FOR UPDATE
  USING ((SELECT auth.uid()) = user_id AND deleted_at IS NULL)
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete their own session exercises" ON workout_session_exercise;
CREATE POLICY "Users can delete their own session exercises"
  ON workout_session_exercise FOR DELETE
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can view their own workout sets" ON workout_set;
CREATE POLICY "Users can view their own workout sets"
  ON workout_set FOR SELECT
  USING ((SELECT auth.uid()) = user_id AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Users can insert their own workout sets" ON workout_set;
CREATE POLICY "Users can insert their own workout sets"
  ON workout_set FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own workout sets" ON workout_set;
CREATE POLICY "Users can update their own workout sets"
  ON workout_set FOR UPDATE
  USING ((SELECT auth.uid()) = user_id AND deleted_at IS NULL)
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete their own workout sets" ON workout_set;
CREATE POLICY "Users can delete their own workout sets"
  ON workout_set FOR DELETE
  USING ((SELECT auth.uid()) = user_id);

DO $$
DECLARE
  v_old_exercise record;
  v_old_session record;
  v_old_set record;
  v_exercise_def_id uuid;
  v_session_id uuid;
  v_session_exercise_id uuid;
  v_exercise_order int;
BEGIN
  -- Check if old tables exist
  IF NOT EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'exercises'
  ) THEN
    RAISE NOTICE 'No old exercises table found, skipping migration';
    RETURN;
  END IF;

  RAISE NOTICE 'Starting data migration from old schema...';

  FOR v_old_exercise IN
    SELECT DISTINCT ON (user_id, lower(name))
      id,
      user_id,
      name,
      muscle_group,
      embedding,
      created_at,
      deleted_at
    FROM exercises
    ORDER BY user_id, lower(name), created_at
  LOOP
    INSERT INTO workout_exercise_definition (id, user_id, name, muscle_group, embedding, created_at, deleted_at)
    VALUES (
      v_old_exercise.id,
      v_old_exercise.user_id,
      v_old_exercise.name,
      v_old_exercise.muscle_group,
      v_old_exercise.embedding,
      v_old_exercise.created_at,
      v_old_exercise.deleted_at
    )
    ON CONFLICT (id) DO NOTHING;
  END LOOP;

  RAISE NOTICE 'Migrated exercise definitions';

  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'workout_sessions'
  ) THEN
    INSERT INTO workout_session (id, user_id, workout_date, created_at, deleted_at)
    SELECT
      id,
      user_id,
      workout_date,
      created_at,
      deleted_at
    FROM workout_sessions
    ON CONFLICT (id) DO NOTHING;

    RAISE NOTICE 'Migrated workout sessions';
  END IF;

  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'workout_sets'
  ) THEN
    FOR v_old_set IN
      SELECT DISTINCT
        session_id,
        exercise_id,
        user_id,
        MIN(created_at) as created_at
      FROM workout_sets
      WHERE deleted_at IS NULL
      GROUP BY session_id, exercise_id, user_id
      ORDER BY MIN(created_at)
    LOOP
      SELECT COALESCE(MAX(exercise_order), 0) + 1
      INTO v_exercise_order
      FROM workout_session_exercise
      WHERE session_id = v_old_set.session_id;

      INSERT INTO workout_session_exercise (
        user_id,
        session_id,
        exercise_definition_id,
        exercise_order,
        created_at
      )
      VALUES (
        v_old_set.user_id,
        v_old_set.session_id,
        v_old_set.exercise_id,
        v_exercise_order,
        v_old_set.created_at
      )
      RETURNING id INTO v_session_exercise_id;

      INSERT INTO workout_set (
        user_id,
        session_exercise_id,
        set_number,
        reps,
        weight_kg,
        embedding,
        created_at
      )
      SELECT
        ws.user_id,
        v_session_exercise_id,
        ws.set_number,
        ws.reps,
        ws.weight_kg,
        ws.embedding,
        ws.created_at
      FROM workout_sets ws
      WHERE ws.session_id = v_old_set.session_id
        AND ws.exercise_id = v_old_set.exercise_id
        AND ws.deleted_at IS NULL;
    END LOOP;

    RAISE NOTICE 'Migrated workout sets and session exercises';
  END IF;

  RAISE NOTICE 'Data migration completed successfully';
END $$;

-- Drop old tables after migration
DROP TABLE IF EXISTS workout_sets CASCADE;
DROP TABLE IF EXISTS workout_sessions CASCADE;

CREATE OR REPLACE VIEW current_week_workout_summary AS
SELECT
  ws.id as session_id,
  ws.workout_date,
  ws.created_at,
  STRING_AGG(DISTINCT ed.muscle_group, ', ' ORDER BY ed.muscle_group) as muscle_groups
FROM workout_session ws
LEFT JOIN workout_session_exercise wse ON ws.id = wse.session_id
LEFT JOIN workout_exercise_definition ed ON wse.exercise_definition_id = ed.id
WHERE
  ws.workout_date >= DATE_TRUNC('week', CURRENT_DATE)
  AND ws.workout_date < DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '7 days'
  AND ws.deleted_at IS NULL
  AND (wse.deleted_at IS NULL OR wse.id IS NULL)
  AND ws.user_id = (SELECT auth.uid())
GROUP BY ws.id, ws.workout_date, ws.created_at
ORDER BY ws.workout_date DESC;

CREATE OR REPLACE VIEW workout_complete_details AS
SELECT
  ws.id as session_id,
  ws.workout_date,
  ws.created_at as session_created_at,
  wse.id as session_exercise_id,
  wse.exercise_order,
  ed.id as exercise_definition_id,
  ed.name as exercise_name,
  ed.muscle_group,
  wset.id as set_id,
  wset.set_number,
  wset.reps,
  wset.weight_kg,
  (wset.reps * wset.weight_kg) as set_volume_kg,
  ws.user_id

FROM workout_session ws
LEFT JOIN workout_session_exercise wse ON ws.id = wse.session_id
LEFT JOIN workout_exercise_definition ed ON wse.exercise_definition_id = ed.id
LEFT JOIN workout_set wset ON wse.id = wset.session_exercise_id

WHERE
  ws.deleted_at IS NULL
  AND (wse.deleted_at IS NULL OR wse.id IS NULL)
  AND (wset.deleted_at IS NULL OR wset.id IS NULL)
  AND ws.user_id = (SELECT auth.uid())

ORDER BY
  ws.workout_date DESC,
  wse.exercise_order ASC,
  wset.set_number ASC;

CREATE OR REPLACE VIEW exercise_progress_summary AS
SELECT
  ed.id as exercise_definition_id,
  ed.name as exercise_name,
  ed.muscle_group,
  ws.workout_date,
  COUNT(wset.id) as total_sets,
  SUM(wset.reps) as total_reps,
  SUM(wset.reps * wset.weight_kg) as total_volume_kg,
  MAX(wset.weight_kg) as max_weight_kg,
  AVG(wset.weight_kg) as avg_weight_kg,
  MAX(wset.reps) as max_reps,
  ws.user_id

FROM workout_exercise_definition ed
JOIN workout_session_exercise wse ON ed.id = wse.exercise_definition_id
JOIN workout_session ws ON wse.session_id = ws.id
LEFT JOIN workout_set wset ON wse.id = wset.session_exercise_id

WHERE
  ed.deleted_at IS NULL
  AND wse.deleted_at IS NULL
  AND ws.deleted_at IS NULL
  AND (wset.deleted_at IS NULL OR wset.id IS NULL)
  AND ws.user_id = (SELECT auth.uid())

GROUP BY
  ed.id,
  ed.name,
  ed.muscle_group,
  ws.workout_date,
  ws.user_id

ORDER BY
  ed.name,
  ws.workout_date DESC;

CREATE OR REPLACE FUNCTION match_workouts (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  exercise_name text,
  workout_date date,
  set_number int,
  reps int,
  weight_kg double precision,
  muscle_group text,
  similarity double precision
)
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    wset.id,
    ed.name as exercise_name,
    ws.workout_date,
    wset.set_number,
    wset.reps,
    wset.weight_kg,
    ed.muscle_group,
    1 - (wset.embedding <=> query_embedding) AS similarity
  FROM workout_set wset
  JOIN workout_session_exercise wse ON wset.session_exercise_id = wse.id
  JOIN workout_exercise_definition ed ON wse.exercise_definition_id = ed.id
  JOIN workout_session ws ON wse.session_id = ws.id
  WHERE
    wset.user_id = (SELECT auth.uid())
    AND ws.user_id = (SELECT auth.uid())
    AND wset.deleted_at IS NULL
    AND wse.deleted_at IS NULL
    AND ed.deleted_at IS NULL
    AND ws.deleted_at IS NULL
    AND 1 - (wset.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
$$;

CREATE OR REPLACE FUNCTION get_workouts_by_date_range (
  start_date date,
  end_date date
)
RETURNS TABLE (
  id uuid,
  exercise_name text,
  workout_date date,
  set_number int,
  reps int,
  weight_kg double precision,
  muscle_group text,
  created_at timestamptz
)
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    wset.id,
    ed.name as exercise_name,
    ws.workout_date,
    wset.set_number,
    wset.reps,
    wset.weight_kg,
    ed.muscle_group,
    wset.created_at
  FROM workout_set wset
  JOIN workout_session_exercise wse ON wset.session_exercise_id = wse.id
  JOIN workout_exercise_definition ed ON wse.exercise_definition_id = ed.id
  JOIN workout_session ws ON wse.session_id = ws.id
  WHERE
    wset.user_id = (SELECT auth.uid())
    AND ws.user_id = (SELECT auth.uid())
    AND ws.workout_date BETWEEN start_date AND end_date
    AND wset.deleted_at IS NULL
    AND wse.deleted_at IS NULL
    AND ed.deleted_at IS NULL
    AND ws.deleted_at IS NULL
  ORDER BY ws.workout_date DESC, wse.exercise_order ASC, wset.set_number ASC
  LIMIT 50;  -- Reasonable limit for context
$$;

CREATE OR REPLACE FUNCTION search_exercises (
  query_text text
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
    AND (
      name ILIKE '%' || query_text || '%'
      OR muscle_group ILIKE '%' || query_text || '%'
    )
  ORDER BY name;
$$;

COMMENT ON TABLE workout_exercise_definition IS
  'Catalog of exercise types (e.g., Bench Press, Squats). Each exercise can be reused across multiple workouts.';

COMMENT ON TABLE workout_session IS
  'A workout session on a specific date. Contains multiple exercises.';

COMMENT ON TABLE workout_session_exercise IS
  'An instance of an exercise performed in a workout session. Links session to exercise definition and contains multiple sets.';

COMMENT ON TABLE workout_set IS
  'Individual set with reps and weight. Multiple sets belong to a session exercise.';

COMMENT ON COLUMN workout_exercise_definition.embedding IS
  'Vector embedding for semantic search. Enables AI queries like "show me pushing exercises".';

COMMENT ON VIEW current_week_workout_summary IS
  'Shows workouts from current week with muscle groups. Perfect for dashboard display.';

COMMENT ON VIEW workout_complete_details IS
  'Complete workout information with all context. AI-friendly for natural language queries.';

COMMENT ON VIEW exercise_progress_summary IS
  'Exercise progression over time. Shows strength gains and volume trends.';