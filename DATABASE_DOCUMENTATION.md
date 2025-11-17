# Lifting Buddy - Database Documentation

**Last Updated:** October 23, 2025
**Database:** PostgreSQL (Supabase)
**Schema Version:** v2.0 (New Workout Flow Structure)

---

## Table of Contents

1. [Overview](#overview)
2. [Database Schema](#database-schema)
3. [Table Relationships](#table-relationships)
4. [Table Details](#table-details)
5. [Views](#views)
6. [Functions](#functions)
7. [Security (RLS Policies)](#security-rls-policies)
8. [Indexes](#indexes)
9. [Common Queries](#common-queries)

---

## Overview

The Lifting Buddy database uses a normalized relational structure to track workout sessions, exercises, and sets. The schema is designed to be AI/RAG-friendly, enabling natural language queries and semantic search.

### Core Concepts

- **Exercise Definition** - A catalog of exercise types (e.g., "Bench Press", "Squats")
- **Workout Session** - A single workout on a specific date
- **Session Exercise** - An instance of an exercise performed in a session
- **Workout Set** - Individual sets with reps and weight

---

## Database Schema

### Entity Relationship Diagram

```
┌─────────────────────────────┐
│  workout_exercise_definition│
│  (Exercise Catalog)         │
│─────────────────────────────│
│  id (PK)                    │
│  user_id (FK → auth.users)  │
│  name                       │
│  muscle_group               │
│  embedding (vector)         │
│  created_at                 │
│  updated_at                 │
│  deleted_at                 │
└──────────────┬──────────────┘
               │
               │ referenced by
               │
┌──────────────▼──────────────┐
│  workout_session            │
│  (Workout on a date)        │
│─────────────────────────────│
│  id (PK)                    │
│  user_id (FK → auth.users)  │
│  workout_date               │
│  created_at                 │
│  updated_at                 │
│  deleted_at                 │
└──────────────┬──────────────┘
               │
               │ contains
               │
┌──────────────▼──────────────┐
│  workout_session_exercise   │
│  (Exercise instance)        │
│─────────────────────────────│
│  id (PK)                    │
│  user_id (FK → auth.users)  │
│  session_id (FK)            │◄────┐
│  exercise_definition_id(FK) │     │
│  exercise_order             │     │
│  created_at                 │     │
│  updated_at                 │     │
│  deleted_at                 │     │
└──────────────┬──────────────┘     │
               │                     │
               │ contains            │
               │                     │
┌──────────────▼──────────────┐     │
│  workout_set                │     │
│  (Individual set)           │     │
│─────────────────────────────│     │
│  id (PK)                    │     │
│  user_id (FK → auth.users)  │     │
│  session_exercise_id (FK)   │─────┘
│  set_number                 │
│  reps                       │
│  weight_kg                  │
│  embedding (vector)         │
│  created_at                 │
│  updated_at                 │
│  deleted_at                 │
└─────────────────────────────┘
```

---

## Table Relationships

### Hierarchy

```
workout_session (1 workout)
    ├── workout_session_exercise (1..n exercises in that workout)
    │       ├── references → workout_exercise_definition (catalog)
    │       └── contains → workout_set (1..n sets for that exercise)
    └── ...
```

### Real-World Example

```
Monday's Workout (workout_session)
│
├── Bench Press (workout_session_exercise #1)
│   ├── References: "Bench Press" from exercise_definition catalog
│   ├── Order: 1st
│   └── Sets:
│       ├── Set 1: 10 reps × 60kg (workout_set)
│       ├── Set 2: 8 reps × 65kg (workout_set)
│       └── Set 3: 6 reps × 70kg (workout_set)
│
└── Squats (workout_session_exercise #2)
    ├── References: "Squats" from exercise_definition catalog
    ├── Order: 2nd
    └── Sets:
        ├── Set 1: 12 reps × 80kg (workout_set)
        ├── Set 2: 10 reps × 85kg (workout_set)
        ├── Set 3: 10 reps × 85kg (workout_set)
        └── Set 4: 8 reps × 90kg (workout_set)
```

---

## Table Details

### 1. `workout_exercise_definition`

**Purpose:** Catalog of reusable exercise types

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PRIMARY KEY | Unique identifier |
| `user_id` | uuid | FOREIGN KEY (auth.users), NOT NULL | Owner of the exercise |
| `name` | text | NOT NULL | Exercise name (e.g., "Bench Press") |
| `muscle_group` | text | | Target muscle group (e.g., "Chest") |
| `embedding` | vector(1536) | | Vector embedding for AI search |
| `created_at` | timestamptz | NOT NULL, DEFAULT now() | Creation timestamp |
| `updated_at` | timestamptz | NOT NULL, DEFAULT now() | Last update timestamp |
| `deleted_at` | timestamptz | | Soft delete timestamp |

**Unique Constraints:**
- `(user_id, LOWER(name))` - Case-insensitive unique exercise names per user

**Example Row:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "auth-user-123",
  "name": "Bench Press",
  "muscle_group": "Chest",
  "created_at": "2025-10-01T10:00:00Z",
  "updated_at": "2025-10-01T10:00:00Z",
  "deleted_at": null
}
```

---

### 2. `workout_session`

**Purpose:** Represents a single workout session on a specific date

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PRIMARY KEY | Unique identifier |
| `user_id` | uuid | FOREIGN KEY (auth.users), NOT NULL | Owner of the session |
| `workout_date` | date | NOT NULL, DEFAULT CURRENT_DATE | Date of workout |
| `created_at` | timestamptz | NOT NULL, DEFAULT now() | Creation timestamp |
| `updated_at` | timestamptz | NOT NULL, DEFAULT now() | Last update timestamp |
| `deleted_at` | timestamptz | | Soft delete timestamp |

**Example Row:**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "user_id": "auth-user-123",
  "workout_date": "2025-10-23",
  "created_at": "2025-10-23T14:30:00Z",
  "updated_at": "2025-10-23T14:30:00Z",
  "deleted_at": null
}
```

---

### 3. `workout_session_exercise`

**Purpose:** Links an exercise to a session, represents an exercise instance

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PRIMARY KEY | Unique identifier |
| `user_id` | uuid | FOREIGN KEY (auth.users), NOT NULL | Owner |
| `session_id` | uuid | FOREIGN KEY (workout_session), NOT NULL, ON DELETE CASCADE | Parent session |
| `exercise_definition_id` | uuid | FOREIGN KEY (workout_exercise_definition), NOT NULL | Exercise type |
| `exercise_order` | int | NOT NULL, DEFAULT 1 | Order in workout (1st, 2nd, 3rd...) |
| `created_at` | timestamptz | NOT NULL, DEFAULT now() | Creation timestamp |
| `updated_at` | timestamptz | NOT NULL, DEFAULT now() | Last update timestamp |
| `deleted_at` | timestamptz | | Soft delete timestamp |

**Unique Constraints:**
- `(session_id, exercise_order)` - Each exercise has unique order in session

**Example Row:**
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "user_id": "auth-user-123",
  "session_id": "660e8400-e29b-41d4-a716-446655440001",
  "exercise_definition_id": "550e8400-e29b-41d4-a716-446655440000",
  "exercise_order": 1,
  "created_at": "2025-10-23T14:35:00Z",
  "updated_at": "2025-10-23T14:35:00Z",
  "deleted_at": null
}
```

---

### 4. `workout_set`

**Purpose:** Individual set with reps and weight

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | uuid | PRIMARY KEY | Unique identifier |
| `user_id` | uuid | FOREIGN KEY (auth.users), NOT NULL | Owner |
| `session_exercise_id` | uuid | FOREIGN KEY (workout_session_exercise), NOT NULL, ON DELETE CASCADE | Parent exercise instance |
| `set_number` | int | NOT NULL, DEFAULT 1, CHECK (set_number > 0) | Set number (1, 2, 3...) |
| `reps` | int | NOT NULL, CHECK (reps > 0) | Number of repetitions |
| `weight_kg` | double precision | NOT NULL, CHECK (weight_kg >= 0) | Weight in kilograms |
| `embedding` | vector(1536) | | Vector embedding for AI search |
| `created_at` | timestamptz | NOT NULL, DEFAULT now() | Creation timestamp |
| `updated_at` | timestamptz | NOT NULL, DEFAULT now() | Last update timestamp |
| `deleted_at` | timestamptz | | Soft delete timestamp |

**Unique Constraints:**
- `(session_exercise_id, set_number)` - Each set number is unique per exercise

**Example Row:**
```json
{
  "id": "880e8400-e29b-41d4-a716-446655440003",
  "user_id": "auth-user-123",
  "session_exercise_id": "770e8400-e29b-41d4-a716-446655440002",
  "set_number": 1,
  "reps": 10,
  "weight_kg": 60.0,
  "created_at": "2025-10-23T14:40:00Z",
  "updated_at": "2025-10-23T14:40:00Z",
  "deleted_at": null
}
```

---

## Views

### 1. `current_week_workout_summary`

**Purpose:** Dashboard view showing current week's workouts

**Columns:**
- `session_id` (uuid) - Workout session ID
- `workout_date` (date) - Date of workout
- `created_at` (timestamptz) - When workout was created
- `muscle_groups` (text) - Comma-separated muscle groups

**Example Query:**
```sql
SELECT * FROM current_week_workout_summary;
```

**Example Output:**
```json
[
  {
    "session_id": "660e8400-e29b-41d4-a716-446655440001",
    "workout_date": "2025-10-23",
    "created_at": "2025-10-23T14:30:00Z",
    "muscle_groups": "Back, Biceps"
  },
  {
    "session_id": "660e8400-e29b-41d4-a716-446655440002",
    "workout_date": "2025-10-21",
    "created_at": "2025-10-21T10:15:00Z",
    "muscle_groups": "Chest, Shoulders, Triceps"
  }
]
```

**Use Cases:**
- Display weekly summary on dashboard
- Show recent workout activity

---

### 2. `workout_complete_details`

**Purpose:** Complete workout information with full context for AI queries

**Columns:**
- `session_id` (uuid) - Session ID
- `workout_date` (date) - Workout date
- `session_created_at` (timestamptz) - When session was created
- `session_exercise_id` (uuid) - Exercise instance ID
- `exercise_order` (int) - Order in workout
- `exercise_definition_id` (uuid) - Exercise type ID
- `exercise_name` (text) - Exercise name
- `muscle_group` (text) - Muscle group
- `set_id` (uuid) - Set ID
- `set_number` (int) - Set number
- `reps` (int) - Repetitions
- `weight_kg` (double precision) - Weight
- `set_volume_kg` (double precision) - Computed: reps × weight
- `user_id` (uuid) - User ID

**Example Query:**
```sql
-- Get all details for last chest workout
SELECT * FROM workout_complete_details
WHERE muscle_group = 'Chest'
ORDER BY session_created_at DESC
LIMIT 1;
```

**Use Cases:**
- AI queries: "What did I do in my last chest workout?"
- Detailed workout reports
- Exercise performance analysis

---

### 3. `exercise_progress_summary`

**Purpose:** Exercise progression analytics over time

**Columns:**
- `exercise_definition_id` (uuid) - Exercise ID
- `exercise_name` (text) - Exercise name
- `muscle_group` (text) - Muscle group
- `workout_date` (date) - Workout date
- `total_sets` (bigint) - Number of sets
- `total_reps` (bigint) - Total reps across all sets
- `total_volume_kg` (double precision) - Total volume (sum of reps × weight)
- `max_weight_kg` (double precision) - Heaviest weight used
- `avg_weight_kg` (double precision) - Average weight
- `max_reps` (int) - Most reps in a single set
- `user_id` (uuid) - User ID

**Example Query:**
```sql
-- Track bench press progression
SELECT
  workout_date,
  max_weight_kg,
  total_volume_kg
FROM exercise_progress_summary
WHERE exercise_name = 'Bench Press'
ORDER BY workout_date DESC
LIMIT 10;
```

**Use Cases:**
- Track strength gains over time
- Visualize progression charts
- AI queries: "Am I getting stronger at bench press?"

---

## Functions

### 1. `match_workouts(query_embedding, match_threshold, match_count)`

**Purpose:** Semantic search across workout sets using vector embeddings

**Parameters:**
- `query_embedding` (vector(1536)) - Query vector
- `match_threshold` (float) - Minimum similarity score (0-1)
- `match_count` (int) - Maximum results to return

**Returns:**
| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Set ID |
| `exercise_name` | text | Exercise name |
| `workout_date` | date | Workout date |
| `set_number` | int | Set number |
| `reps` | int | Repetitions |
| `weight_kg` | double precision | Weight |
| `muscle_group` | text | Muscle group |
| `similarity` | double precision | Similarity score (0-1) |

**Example:**
```sql
SELECT * FROM match_workouts(
  query_embedding := '[vector here]'::vector(1536),
  match_threshold := 0.7,
  match_count := 10
);
```

**Use Cases:**
- AI-powered workout search
- "Show me similar chest exercises"
- Natural language queries

---

### 2. `search_exercises(query_text)`

**Purpose:** Text-based search for exercises

**Parameters:**
- `query_text` (text) - Search query

**Returns:**
| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Exercise ID |
| `name` | text | Exercise name |
| `muscle_group` | text | Muscle group |

**Example:**
```sql
-- Search for "press" exercises
SELECT * FROM search_exercises('press');
```

**Output:**
```json
[
  { "id": "...", "name": "Bench Press", "muscle_group": "Chest" },
  { "id": "...", "name": "Overhead Press", "muscle_group": "Shoulders" },
  { "id": "...", "name": "Leg Press", "muscle_group": "Legs" }
]
```

**Use Cases:**
- Autocomplete for exercise selection
- Exercise discovery
- Search by muscle group or name

---

### 3. `update_updated_at_column()`

**Purpose:** Trigger function to auto-update `updated_at` timestamp

**Type:** Trigger function
**Security:** SECURITY DEFINER with fixed search_path

**Used By:**
- `workout_exercise_definition` table
- `workout_session` table
- `workout_session_exercise` table
- `workout_set` table

---

## Security (RLS Policies)

All tables have Row Level Security (RLS) enabled with optimized policies.

### Policy Pattern (All Tables)

Each table has 4 policies:
1. **SELECT** - Users can view their own data
2. **INSERT** - Users can insert their own data
3. **UPDATE** - Users can update their own data
4. **DELETE** - Users can delete their own data

### Example Policy:
```sql
CREATE POLICY "Users can view their own workout sets"
  ON workout_set FOR SELECT
  USING ((SELECT auth.uid()) = user_id AND deleted_at IS NULL);
```

### Performance Optimization

All policies use `(SELECT auth.uid())` instead of `auth.uid()` for better performance:
- ✅ Evaluates once per query
- ❌ Without SELECT: evaluates for every row

---

## Indexes

### Performance Indexes

**workout_exercise_definition:**
- `idx_exercise_def_user_name` - (user_id, name)
- `idx_exercise_def_muscle_group` - (user_id, muscle_group) WHERE muscle_group IS NOT NULL
- `idx_exercise_def_embedding` - USING ivfflat (embedding vector_cosine_ops)
- `idx_exercise_def_deleted` - (deleted_at) WHERE deleted_at IS NULL
- `unique_exercise_per_user` - UNIQUE (user_id, LOWER(name))

**workout_session:**
- `idx_session_user_date` - (user_id, workout_date DESC)
- `idx_session_user_created` - (user_id, created_at DESC)
- `idx_session_deleted` - (deleted_at) WHERE deleted_at IS NULL

**workout_session_exercise:**
- `idx_session_exercise_session` - (session_id, exercise_order)
- `idx_session_exercise_definition` - (exercise_definition_id)
- `idx_session_exercise_user` - (user_id, created_at DESC)
- `idx_session_exercise_deleted` - (deleted_at) WHERE deleted_at IS NULL

**workout_set:**
- `idx_set_session_exercise` - (session_exercise_id, set_number)
- `idx_set_user_created` - (user_id, created_at DESC)
- `idx_set_embedding` - USING ivfflat (embedding vector_cosine_ops)
- `idx_set_deleted` - (deleted_at) WHERE deleted_at IS NULL

---

## Common Queries

### 1. Get Current Week's Workouts
```sql
SELECT * FROM current_week_workout_summary
ORDER BY workout_date DESC;
```

### 2. Get Complete Workout Details
```sql
SELECT
  workout_date,
  exercise_name,
  set_number,
  reps,
  weight_kg,
  set_volume_kg
FROM workout_complete_details
WHERE session_id = 'some-session-id'
ORDER BY exercise_order, set_number;
```

### 3. Track Exercise Progression
```sql
SELECT
  workout_date,
  max_weight_kg,
  total_volume_kg
FROM exercise_progress_summary
WHERE exercise_name = 'Bench Press'
ORDER BY workout_date DESC
LIMIT 10;
```

### 4. Create a New Workout Session
```sql
-- 1. Create session
INSERT INTO workout_session (user_id, workout_date)
VALUES ((SELECT auth.uid()), CURRENT_DATE)
RETURNING id;

-- 2. Add exercise to session
INSERT INTO workout_session_exercise (
  user_id,
  session_id,
  exercise_definition_id,
  exercise_order
)
VALUES (
  (SELECT auth.uid()),
  'session-id-here',
  'exercise-definition-id-here',
  1
)
RETURNING id;

-- 3. Add sets
INSERT INTO workout_set (
  user_id,
  session_exercise_id,
  set_number,
  reps,
  weight_kg
)
VALUES
  ((SELECT auth.uid()), 'session-exercise-id', 1, 10, 60),
  ((SELECT auth.uid()), 'session-exercise-id', 2, 8, 65),
  ((SELECT auth.uid()), 'session-exercise-id', 3, 6, 70);
```

### 5. Get or Create Exercise Definition
```sql
-- Check if exercise exists
SELECT id FROM workout_exercise_definition
WHERE user_id = (SELECT auth.uid())
  AND LOWER(name) = LOWER('Bench Press');

-- If not exists, create it
INSERT INTO workout_exercise_definition (user_id, name, muscle_group)
VALUES ((SELECT auth.uid()), 'Bench Press', 'Chest')
ON CONFLICT (user_id, LOWER(name)) DO NOTHING
RETURNING id;
```

### 6. Search Exercises
```sql
-- Text search
SELECT * FROM search_exercises('press');

-- Get all chest exercises
SELECT * FROM workout_exercise_definition
WHERE muscle_group = 'Chest'
  AND deleted_at IS NULL
ORDER BY name;
```

### 7. Calculate Personal Records
```sql
SELECT
  exercise_name,
  MAX(max_weight_kg) as personal_record,
  MAX(total_volume_kg) as highest_volume
FROM exercise_progress_summary
GROUP BY exercise_name
ORDER BY personal_record DESC;
```

### 8. Soft Delete (instead of hard delete)
```sql
-- Soft delete a session
UPDATE workout_session
SET deleted_at = now()
WHERE id = 'session-id'
  AND user_id = (SELECT auth.uid());

-- Soft delete cascades to related records via triggers or application logic
```

---

## Data Flow Example

### Creating a Complete Workout

```sql
-- Step 1: Create workout session
INSERT INTO workout_session (user_id, workout_date)
VALUES ((SELECT auth.uid()), '2025-10-23')
RETURNING id; -- Returns: '660e8400-...'

-- Step 2: Get/Create exercise definition
INSERT INTO workout_exercise_definition (user_id, name, muscle_group)
VALUES ((SELECT auth.uid()), 'Bench Press', 'Chest')
ON CONFLICT (user_id, LOWER(name)) DO UPDATE SET name = EXCLUDED.name
RETURNING id; -- Returns: '550e8400-...'

-- Step 3: Add exercise to session
INSERT INTO workout_session_exercise (
  user_id,
  session_id,
  exercise_definition_id,
  exercise_order
)
VALUES (
  (SELECT auth.uid()),
  '660e8400-...',  -- session from step 1
  '550e8400-...',  -- exercise from step 2
  1
)
RETURNING id; -- Returns: '770e8400-...'

-- Step 4: Add sets
INSERT INTO workout_set (user_id, session_exercise_id, set_number, reps, weight_kg)
VALUES
  ((SELECT auth.uid()), '770e8400-...', 1, 10, 60),
  ((SELECT auth.uid()), '770e8400-...', 2, 8, 65),
  ((SELECT auth.uid()), '770e8400-...', 3, 6, 70);
```

---

## Best Practices

### 1. Always Use Soft Deletes
```sql
-- ✅ Good: Soft delete
UPDATE workout_session
SET deleted_at = now()
WHERE id = 'session-id';

-- ❌ Avoid: Hard delete
DELETE FROM workout_session WHERE id = 'session-id';
```

### 2. Use Subquery for auth.uid() in Queries
```sql
-- ✅ Good: Evaluates once
WHERE user_id = (SELECT auth.uid())

-- ❌ Slow: Evaluates per row
WHERE user_id = auth.uid()
```

### 3. Reuse Exercise Definitions
```sql
-- ✅ Good: Check if exists first
SELECT id FROM workout_exercise_definition
WHERE user_id = (SELECT auth.uid()) AND LOWER(name) = LOWER('Bench Press');

-- If not found, create it
INSERT INTO workout_exercise_definition (user_id, name, muscle_group)
VALUES ((SELECT auth.uid()), 'Bench Press', 'Chest')
RETURNING id;
```

### 4. Maintain Exercise Order
```sql
-- ✅ Good: Explicitly set order
INSERT INTO workout_session_exercise (... exercise_order)
VALUES (... 1), (... 2), (... 3);
```

### 5. Use Views for Complex Queries
```sql
-- ✅ Good: Use optimized view
SELECT * FROM exercise_progress_summary
WHERE exercise_name = 'Bench Press';

-- ❌ Avoid: Writing complex joins manually
```

---

## Migration History

| Date | Version | Description |
|------|---------|-------------|
| 2025-09-29 | 1.0 | Initial schema with flat workouts table |
| 2025-10-03 | 1.1 | Changed vector size to 768 |
| 2025-10-07 | 1.2 | Enabled RLS |
| 2025-10-10 | 1.3 | Normalized schema (exercises, sessions, sets) |
| 2025-10-23 | 2.0 | New workflow structure with exercise definitions |

---

## Support & Maintenance

### Backup Tables
Old schemas are preserved with `_backup_old_schema` suffix:
- `exercises_backup_old_schema`
- `workout_sets_backup_old_schema`

### Monitoring
Check Supabase dashboard for:
- Performance warnings
- RLS policy efficiency
- Index usage
- Query performance

---

**End of Documentation**

For questions or updates, refer to the migration files in `/supabase/migrations/`
