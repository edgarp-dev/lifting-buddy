# Lifting Buddy - API Endpoints Specification

**Last Updated:** October 23, 2025
**API Version:** v2.0
**Database Schema:** New Workout Flow Structure

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Exercise Definitions](#exercise-definitions)
4. [Workout Sessions](#workout-sessions)
5. [Session Exercises](#session-exercises)
6. [Workout Sets](#workout-sets)
7. [Analytics & Reports](#analytics--reports)
8. [Search & Discovery](#search--discovery)
9. [AI/Semantic Search](#aisemantic-search)
10. [Batch Operations](#batch-operations)

---

## Overview

### Base URL
```
Production: https://your-project.supabase.co
Local: http://localhost:54321
```

### API Structure
```
/api/v1/
  ├── exercises/          # Exercise definitions
  ├── sessions/           # Workout sessions
  ├── session-exercises/  # Exercises in sessions
  ├── sets/              # Individual sets
  ├── analytics/         # Reports and analytics
  └── search/            # Search endpoints
```

### Response Format
All endpoints return JSON in this format:
```json
{
  "success": true,
  "data": { /* response data */ },
  "error": null
}
```

Or on error:
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```

---

## Authentication

All endpoints require authentication via Supabase JWT token in the `Authorization` header:

```http
Authorization: Bearer <supabase-jwt-token>
```

The user ID is extracted from `auth.uid()` automatically via RLS policies.

---

## Exercise Definitions

### 1. List User's Exercises

**Endpoint:** `GET /api/v1/exercises`

**Description:** Get all exercise definitions for the authenticated user

**Query Parameters:**
- `muscle_group` (optional) - Filter by muscle group
- `search` (optional) - Search by name
- `limit` (optional, default: 50) - Results per page
- `offset` (optional, default: 0) - Pagination offset

**Example Request:**
```http
GET /api/v1/exercises?muscle_group=Chest&limit=20
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "exercises": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Bench Press",
        "muscle_group": "Chest",
        "created_at": "2025-10-01T10:00:00Z",
        "updated_at": "2025-10-01T10:00:00Z"
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "name": "Incline Dumbbell Press",
        "muscle_group": "Chest",
        "created_at": "2025-10-02T11:30:00Z",
        "updated_at": "2025-10-02T11:30:00Z"
      }
    ],
    "total": 2,
    "limit": 20,
    "offset": 0
  },
  "error": null
}
```

**SQL Query:**
```sql
SELECT id, name, muscle_group, created_at, updated_at
FROM workout_exercise_definition
WHERE user_id = (SELECT auth.uid())
  AND deleted_at IS NULL
  AND ($1::text IS NULL OR muscle_group = $1)
  AND ($2::text IS NULL OR name ILIKE '%' || $2 || '%')
ORDER BY name
LIMIT $3 OFFSET $4;
```

---

### 2. Get Exercise by ID

**Endpoint:** `GET /api/v1/exercises/:id`

**Description:** Get a specific exercise definition

**Path Parameters:**
- `id` - Exercise definition UUID

**Example Request:**
```http
GET /api/v1/exercises/550e8400-e29b-41d4-a716-446655440000
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Bench Press",
    "muscle_group": "Chest",
    "created_at": "2025-10-01T10:00:00Z",
    "updated_at": "2025-10-01T10:00:00Z"
  },
  "error": null
}
```

---

### 3. Create Exercise Definition

**Endpoint:** `POST /api/v1/exercises`

**Description:** Create a new exercise definition (or return existing if duplicate)

**Request Body:**
```json
{
  "name": "Bench Press",
  "muscle_group": "Chest"
}
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Bench Press",
    "muscle_group": "Chest",
    "created_at": "2025-10-23T15:00:00Z",
    "updated_at": "2025-10-23T15:00:00Z"
  },
  "error": null
}
```

**SQL Query:**
```sql
INSERT INTO workout_exercise_definition (user_id, name, muscle_group)
VALUES ((SELECT auth.uid()), $1, $2)
ON CONFLICT (user_id, LOWER(name))
DO UPDATE SET name = EXCLUDED.name
RETURNING id, name, muscle_group, created_at, updated_at;
```

**Validation:**
- `name` - Required, 1-100 characters
- `muscle_group` - Optional, 1-50 characters

---

### 4. Update Exercise Definition

**Endpoint:** `PUT /api/v1/exercises/:id`

**Description:** Update an exercise definition

**Path Parameters:**
- `id` - Exercise UUID

**Request Body:**
```json
{
  "name": "Barbell Bench Press",
  "muscle_group": "Chest"
}
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Barbell Bench Press",
    "muscle_group": "Chest",
    "updated_at": "2025-10-23T15:30:00Z"
  },
  "error": null
}
```

---

### 5. Delete Exercise Definition

**Endpoint:** `DELETE /api/v1/exercises/:id`

**Description:** Soft delete an exercise definition

**Path Parameters:**
- `id` - Exercise UUID

**Example Response:**
```json
{
  "success": true,
  "data": {
    "message": "Exercise deleted successfully"
  },
  "error": null
}
```

**SQL Query:**
```sql
UPDATE workout_exercise_definition
SET deleted_at = now()
WHERE id = $1 AND user_id = (SELECT auth.uid());
```

---

## Workout Sessions

### 6. List Workout Sessions

**Endpoint:** `GET /api/v1/sessions`

**Description:** Get user's workout sessions

**Query Parameters:**
- `start_date` (optional) - Filter from date (YYYY-MM-DD)
- `end_date` (optional) - Filter to date (YYYY-MM-DD)
- `limit` (optional, default: 50)
- `offset` (optional, default: 0)

**Example Request:**
```http
GET /api/v1/sessions?start_date=2025-10-01&end_date=2025-10-31&limit=10
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": "660e8400-e29b-41d4-a716-446655440001",
        "workout_date": "2025-10-23",
        "created_at": "2025-10-23T14:30:00Z",
        "exercise_count": 3,
        "total_sets": 12,
        "total_volume_kg": 2850.0,
        "muscle_groups": "Chest, Shoulders, Triceps"
      },
      {
        "id": "660e8400-e29b-41d4-a716-446655440002",
        "workout_date": "2025-10-21",
        "created_at": "2025-10-21T10:15:00Z",
        "exercise_count": 4,
        "total_sets": 15,
        "total_volume_kg": 3200.0,
        "muscle_groups": "Back, Biceps"
      }
    ],
    "total": 2,
    "limit": 10,
    "offset": 0
  },
  "error": null
}
```

**SQL Query:**
```sql
SELECT
  ws.id,
  ws.workout_date,
  ws.created_at,
  COUNT(DISTINCT wse.id) as exercise_count,
  COUNT(wset.id) as total_sets,
  SUM(wset.reps * wset.weight_kg) as total_volume_kg,
  STRING_AGG(DISTINCT ed.muscle_group, ', ') as muscle_groups
FROM workout_session ws
LEFT JOIN workout_session_exercise wse ON ws.id = wse.session_id
LEFT JOIN workout_exercise_definition ed ON wse.exercise_definition_id = ed.id
LEFT JOIN workout_set wset ON wse.id = wset.session_exercise_id
WHERE ws.user_id = (SELECT auth.uid())
  AND ws.deleted_at IS NULL
  AND ($1::date IS NULL OR ws.workout_date >= $1)
  AND ($2::date IS NULL OR ws.workout_date <= $2)
GROUP BY ws.id, ws.workout_date, ws.created_at
ORDER BY ws.workout_date DESC
LIMIT $3 OFFSET $4;
```

---

### 7. Get Current Week's Sessions

**Endpoint:** `GET /api/v1/sessions/current-week`

**Description:** Get workouts from the current week (uses view)

**Example Request:**
```http
GET /api/v1/sessions/current-week
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "session_id": "660e8400-e29b-41d4-a716-446655440001",
        "workout_date": "2025-10-23",
        "created_at": "2025-10-23T14:30:00Z",
        "muscle_groups": "Chest, Shoulders, Triceps"
      }
    ]
  },
  "error": null
}
```

**SQL Query:**
```sql
SELECT * FROM current_week_workout_summary;
```

---

### 8. Get Session Details

**Endpoint:** `GET /api/v1/sessions/:id`

**Description:** Get complete details for a workout session

**Path Parameters:**
- `id` - Session UUID

**Example Request:**
```http
GET /api/v1/sessions/660e8400-e29b-41d4-a716-446655440001
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "workout_date": "2025-10-23",
    "created_at": "2025-10-23T14:30:00Z",
    "exercises": [
      {
        "id": "770e8400-e29b-41d4-a716-446655440002",
        "exercise_definition_id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Bench Press",
        "muscle_group": "Chest",
        "order": 1,
        "sets": [
          {
            "id": "880e8400-e29b-41d4-a716-446655440003",
            "set_number": 1,
            "reps": 10,
            "weight_kg": 60.0
          },
          {
            "id": "880e8400-e29b-41d4-a716-446655440004",
            "set_number": 2,
            "reps": 8,
            "weight_kg": 65.0
          },
          {
            "id": "880e8400-e29b-41d4-a716-446655440005",
            "set_number": 3,
            "reps": 6,
            "weight_kg": 70.0
          }
        ]
      }
    ]
  },
  "error": null
}
```

**SQL Query:**
```sql
-- Get session
SELECT * FROM workout_session
WHERE id = $1 AND user_id = (SELECT auth.uid());

-- Get exercises with sets
SELECT
  wse.id,
  wse.exercise_order,
  ed.id as exercise_definition_id,
  ed.name,
  ed.muscle_group,
  wset.id as set_id,
  wset.set_number,
  wset.reps,
  wset.weight_kg
FROM workout_session_exercise wse
JOIN workout_exercise_definition ed ON wse.exercise_definition_id = ed.id
LEFT JOIN workout_set wset ON wse.id = wset.session_exercise_id
WHERE wse.session_id = $1
  AND wse.deleted_at IS NULL
  AND (wset.deleted_at IS NULL OR wset.id IS NULL)
ORDER BY wse.exercise_order, wset.set_number;
```

---

### 9. Create Workout Session

**Endpoint:** `POST /api/v1/sessions`

**Description:** Create a new workout session

**Request Body:**
```json
{
  "workout_date": "2025-10-23"
}
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "workout_date": "2025-10-23",
    "created_at": "2025-10-23T14:30:00Z"
  },
  "error": null
}
```

**SQL Query:**
```sql
INSERT INTO workout_session (user_id, workout_date)
VALUES ((SELECT auth.uid()), $1)
RETURNING id, workout_date, created_at;
```

---

### 10. Update Workout Session

**Endpoint:** `PUT /api/v1/sessions/:id`

**Description:** Update workout session date

**Path Parameters:**
- `id` - Session UUID

**Request Body:**
```json
{
  "workout_date": "2025-10-24"
}
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "workout_date": "2025-10-24",
    "updated_at": "2025-10-23T15:00:00Z"
  },
  "error": null
}
```

---

### 11. Delete Workout Session

**Endpoint:** `DELETE /api/v1/sessions/:id`

**Description:** Soft delete a workout session (cascades to exercises and sets)

**Path Parameters:**
- `id` - Session UUID

**Example Response:**
```json
{
  "success": true,
  "data": {
    "message": "Workout session deleted successfully"
  },
  "error": null
}
```

---

## Session Exercises

### 12. Add Exercise to Session

**Endpoint:** `POST /api/v1/sessions/:session_id/exercises`

**Description:** Add an exercise to a workout session

**Path Parameters:**
- `session_id` - Session UUID

**Request Body:**
```json
{
  "exercise_definition_id": "550e8400-e29b-41d4-a716-446655440000",
  "exercise_order": 1
}
```

**Alternative (Create exercise inline):**
```json
{
  "exercise_name": "Bench Press",
  "muscle_group": "Chest",
  "exercise_order": 1
}
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "session_id": "660e8400-e29b-41d4-a716-446655440001",
    "exercise_definition_id": "550e8400-e29b-41d4-a716-446655440000",
    "exercise_name": "Bench Press",
    "muscle_group": "Chest",
    "exercise_order": 1,
    "created_at": "2025-10-23T14:35:00Z"
  },
  "error": null
}
```

**SQL Query:**
```sql
-- If exercise_definition_id provided:
INSERT INTO workout_session_exercise (
  user_id,
  session_id,
  exercise_definition_id,
  exercise_order
)
VALUES ((SELECT auth.uid()), $1, $2, $3)
RETURNING id, session_id, exercise_definition_id, exercise_order, created_at;

-- If exercise_name provided (create definition first):
INSERT INTO workout_exercise_definition (user_id, name, muscle_group)
VALUES ((SELECT auth.uid()), $1, $2)
ON CONFLICT (user_id, LOWER(name)) DO UPDATE SET name = EXCLUDED.name
RETURNING id;
-- Then insert session exercise with returned id
```

---

### 13. Reorder Exercises in Session

**Endpoint:** `PUT /api/v1/sessions/:session_id/exercises/reorder`

**Description:** Reorder exercises in a session

**Path Parameters:**
- `session_id` - Session UUID

**Request Body:**
```json
{
  "exercises": [
    { "id": "770e8400-...-002", "order": 1 },
    { "id": "770e8400-...-003", "order": 2 },
    { "id": "770e8400-...-004", "order": 3 }
  ]
}
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "message": "Exercises reordered successfully",
    "updated_count": 3
  },
  "error": null
}
```

---

### 14. Delete Exercise from Session

**Endpoint:** `DELETE /api/v1/sessions/:session_id/exercises/:exercise_id`

**Description:** Remove an exercise from a session (soft delete)

**Path Parameters:**
- `session_id` - Session UUID
- `exercise_id` - Session exercise UUID

**Example Response:**
```json
{
  "success": true,
  "data": {
    "message": "Exercise removed from session"
  },
  "error": null
}
```

---

## Workout Sets

### 15. Add Sets to Exercise

**Endpoint:** `POST /api/v1/session-exercises/:session_exercise_id/sets`

**Description:** Add multiple sets to an exercise

**Path Parameters:**
- `session_exercise_id` - Session exercise UUID

**Request Body:**
```json
{
  "sets": [
    { "set_number": 1, "reps": 10, "weight_kg": 60 },
    { "set_number": 2, "reps": 8, "weight_kg": 65 },
    { "set_number": 3, "reps": 6, "weight_kg": 70 }
  ]
}
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "sets": [
      {
        "id": "880e8400-e29b-41d4-a716-446655440003",
        "set_number": 1,
        "reps": 10,
        "weight_kg": 60,
        "created_at": "2025-10-23T14:40:00Z"
      },
      {
        "id": "880e8400-e29b-41d4-a716-446655440004",
        "set_number": 2,
        "reps": 8,
        "weight_kg": 65,
        "created_at": "2025-10-23T14:42:00Z"
      },
      {
        "id": "880e8400-e29b-41d4-a716-446655440005",
        "set_number": 3,
        "reps": 6,
        "weight_kg": 70,
        "created_at": "2025-10-23T14:45:00Z"
      }
    ]
  },
  "error": null
}
```

**SQL Query:**
```sql
INSERT INTO workout_set (user_id, session_exercise_id, set_number, reps, weight_kg)
VALUES
  ((SELECT auth.uid()), $1, $2, $3, $4),
  ((SELECT auth.uid()), $1, $5, $6, $7),
  ((SELECT auth.uid()), $1, $8, $9, $10)
RETURNING id, set_number, reps, weight_kg, created_at;
```

---

### 16. Update Set

**Endpoint:** `PUT /api/v1/sets/:id`

**Description:** Update a specific set

**Path Parameters:**
- `id` - Set UUID

**Request Body:**
```json
{
  "reps": 12,
  "weight_kg": 62.5
}
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": "880e8400-e29b-41d4-a716-446655440003",
    "set_number": 1,
    "reps": 12,
    "weight_kg": 62.5,
    "updated_at": "2025-10-23T15:00:00Z"
  },
  "error": null
}
```

---

### 17. Delete Set

**Endpoint:** `DELETE /api/v1/sets/:id`

**Description:** Delete a specific set (soft delete)

**Path Parameters:**
- `id` - Set UUID

**Example Response:**
```json
{
  "success": true,
  "data": {
    "message": "Set deleted successfully"
  },
  "error": null
}
```

---

## Analytics & Reports

### 18. Get Exercise Progress

**Endpoint:** `GET /api/v1/analytics/exercise-progress/:exercise_id`

**Description:** Get progression data for a specific exercise

**Path Parameters:**
- `exercise_id` - Exercise definition UUID

**Query Parameters:**
- `start_date` (optional) - From date
- `end_date` (optional) - To date
- `limit` (optional, default: 50)

**Example Request:**
```http
GET /api/v1/analytics/exercise-progress/550e8400-e29b-41d4-a716-446655440000?limit=10
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "exercise_name": "Bench Press",
    "muscle_group": "Chest",
    "progression": [
      {
        "workout_date": "2025-10-23",
        "total_sets": 3,
        "total_reps": 24,
        "total_volume_kg": 1950.0,
        "max_weight_kg": 70.0,
        "avg_weight_kg": 65.0,
        "max_reps": 10
      },
      {
        "workout_date": "2025-10-21",
        "total_sets": 3,
        "total_reps": 24,
        "total_volume_kg": 1875.0,
        "max_weight_kg": 67.5,
        "avg_weight_kg": 62.5,
        "max_reps": 10
      }
    ]
  },
  "error": null
}
```

**SQL Query:**
```sql
SELECT * FROM exercise_progress_summary
WHERE exercise_definition_id = $1
  AND ($2::date IS NULL OR workout_date >= $2)
  AND ($3::date IS NULL OR workout_date <= $3)
ORDER BY workout_date DESC
LIMIT $4;
```

---

### 19. Get Personal Records

**Endpoint:** `GET /api/v1/analytics/personal-records`

**Description:** Get personal records for all exercises

**Query Parameters:**
- `muscle_group` (optional) - Filter by muscle group

**Example Request:**
```http
GET /api/v1/analytics/personal-records?muscle_group=Chest
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "records": [
      {
        "exercise_name": "Bench Press",
        "muscle_group": "Chest",
        "max_weight_kg": 100.0,
        "max_weight_date": "2025-10-23",
        "max_volume_kg": 2500.0,
        "max_volume_date": "2025-10-20",
        "max_reps": 15,
        "max_reps_date": "2025-10-15"
      }
    ]
  },
  "error": null
}
```

**SQL Query:**
```sql
SELECT
  exercise_name,
  muscle_group,
  MAX(max_weight_kg) as max_weight_kg,
  MAX(total_volume_kg) as max_volume_kg,
  MAX(max_reps) as max_reps
FROM exercise_progress_summary
WHERE ($1::text IS NULL OR muscle_group = $1)
GROUP BY exercise_name, muscle_group
ORDER BY max_weight_kg DESC;
```

---

### 20. Get Workout Statistics

**Endpoint:** `GET /api/v1/analytics/stats`

**Description:** Get overall workout statistics

**Query Parameters:**
- `start_date` (optional)
- `end_date` (optional)

**Example Request:**
```http
GET /api/v1/analytics/stats?start_date=2025-10-01&end_date=2025-10-31
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "total_workouts": 12,
    "total_exercises": 45,
    "total_sets": 180,
    "total_volume_kg": 45000.0,
    "avg_sets_per_workout": 15,
    "avg_volume_per_workout": 3750.0,
    "most_trained_muscle_groups": [
      { "muscle_group": "Chest", "count": 8 },
      { "muscle_group": "Back", "count": 7 },
      { "muscle_group": "Legs", "count": 6 }
    ]
  },
  "error": null
}
```

---

## Search & Discovery

### 21. Search Exercises

**Endpoint:** `GET /api/v1/search/exercises`

**Description:** Search exercises by name or muscle group

**Query Parameters:**
- `q` - Search query (required)

**Example Request:**
```http
GET /api/v1/search/exercises?q=press
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Bench Press",
        "muscle_group": "Chest"
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "name": "Overhead Press",
        "muscle_group": "Shoulders"
      }
    ]
  },
  "error": null
}
```

**SQL Query:**
```sql
SELECT * FROM search_exercises($1);
```

---

### 22. Get Popular Exercises

**Endpoint:** `GET /api/v1/search/popular`

**Description:** Get most frequently used exercises

**Query Parameters:**
- `limit` (optional, default: 10)

**Example Request:**
```http
GET /api/v1/search/popular?limit=5
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "exercises": [
      {
        "exercise_name": "Bench Press",
        "muscle_group": "Chest",
        "usage_count": 25,
        "last_used": "2025-10-23"
      },
      {
        "exercise_name": "Squats",
        "muscle_group": "Legs",
        "usage_count": 22,
        "last_used": "2025-10-22"
      }
    ]
  },
  "error": null
}
```

---

## AI/Semantic Search

### 23. Semantic Workout Search

**Endpoint:** `POST /api/v1/search/semantic`

**Description:** AI-powered semantic search using vector embeddings

**Request Body:**
```json
{
  "query": "chest pressing exercises with heavy weight",
  "match_threshold": 0.7,
  "match_count": 10
}
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "id": "880e8400-e29b-41d4-a716-446655440003",
        "exercise_name": "Bench Press",
        "workout_date": "2025-10-23",
        "set_number": 3,
        "reps": 6,
        "weight_kg": 100.0,
        "muscle_group": "Chest",
        "similarity": 0.89
      }
    ]
  },
  "error": null
}
```

**Implementation:**
```typescript
// 1. Generate embedding from query using OpenAI/Gemini
const embedding = await generateEmbedding(query);

// 2. Call match_workouts function
SELECT * FROM match_workouts(
  embedding::vector(1536),
  match_threshold,
  match_count
);
```

---

## Batch Operations

### 24. Create Complete Workout (Batch)

**Endpoint:** `POST /api/v1/workouts/batch`

**Description:** Create entire workout in one request (session + exercises + sets)

**Request Body:**
```json
{
  "workout_date": "2025-10-23",
  "exercises": [
    {
      "exercise_name": "Bench Press",
      "muscle_group": "Chest",
      "order": 1,
      "sets": [
        { "set_number": 1, "reps": 10, "weight_kg": 60 },
        { "set_number": 2, "reps": 8, "weight_kg": 65 },
        { "set_number": 3, "reps": 6, "weight_kg": 70 }
      ]
    },
    {
      "exercise_name": "Overhead Press",
      "muscle_group": "Shoulders",
      "order": 2,
      "sets": [
        { "set_number": 1, "reps": 10, "weight_kg": 40 },
        { "set_number": 2, "reps": 8, "weight_kg": 45 },
        { "set_number": 3, "reps": 6, "weight_kg": 50 }
      ]
    }
  ]
}
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "session_id": "660e8400-e29b-41d4-a716-446655440001",
    "workout_date": "2025-10-23",
    "exercises_created": 2,
    "sets_created": 6,
    "total_volume_kg": 1950.0
  },
  "error": null
}
```

**Implementation:**
This requires a database transaction:
```sql
BEGIN;

-- 1. Create session
INSERT INTO workout_session...

-- 2. For each exercise:
--    a. Get/create exercise definition
--    b. Create session exercise
--    c. Insert all sets

COMMIT;
```

---

### 25. Copy Workout

**Endpoint:** `POST /api/v1/sessions/:id/copy`

**Description:** Copy an existing workout to a new date

**Path Parameters:**
- `id` - Session UUID to copy

**Request Body:**
```json
{
  "new_date": "2025-10-25"
}
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "new_session_id": "660e8400-e29b-41d4-a716-446655440999",
    "original_session_id": "660e8400-e29b-41d4-a716-446655440001",
    "workout_date": "2025-10-25",
    "exercises_copied": 3,
    "sets_copied": 12
  },
  "error": null
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| `UNAUTHORIZED` | Missing or invalid authentication token |
| `FORBIDDEN` | User doesn't have access to resource |
| `NOT_FOUND` | Resource not found |
| `VALIDATION_ERROR` | Invalid request data |
| `DUPLICATE_EXERCISE` | Exercise already exists (handled gracefully) |
| `INVALID_DATE` | Invalid date format |
| `INVALID_ORDER` | Invalid exercise order (e.g., duplicate) |
| `CONSTRAINT_VIOLATION` | Database constraint violation |
| `SERVER_ERROR` | Internal server error |

---

## Rate Limiting

**Recommended Limits:**
- **Standard endpoints:** 100 requests/minute per user
- **Batch operations:** 20 requests/minute per user
- **AI/Semantic search:** 10 requests/minute per user

---

## Best Practices

### 1. Use Batch Endpoint for Complete Workouts
```typescript
// ✅ Good: Single request
POST /api/v1/workouts/batch
{ workout_date, exercises: [...] }

// ❌ Avoid: Multiple requests
POST /api/v1/sessions
POST /api/v1/sessions/:id/exercises (x3)
POST /api/v1/session-exercises/:id/sets (x3)
```

### 2. Cache Exercise Definitions
```typescript
// Cache exercise definitions on the client
const exercises = await fetchExercises();
localStorage.setItem('exercises', JSON.stringify(exercises));
```

### 3. Optimistic Updates
```typescript
// Update UI immediately, rollback on error
updateUI(newData);
try {
  await api.updateSet(setId, newData);
} catch (error) {
  rollbackUI(oldData);
}
```

### 4. Use Pagination
```typescript
// Always use limit/offset for lists
GET /api/v1/sessions?limit=20&offset=0
```

---

## Implementation Checklist

### Backend (Deno/Node.js/etc.)

- [ ] Set up Supabase client with JWT authentication
- [ ] Implement RLS-aware queries (auth.uid() automatically handled)
- [ ] Add request validation (Zod, Joi, etc.)
- [ ] Implement error handling middleware
- [ ] Add rate limiting
- [ ] Set up CORS for frontend
- [ ] Create OpenAPI/Swagger docs
- [ ] Add logging and monitoring

### Frontend

- [ ] Create API client wrapper
- [ ] Implement authentication flow
- [ ] Add request/response interceptors
- [ ] Implement caching strategy
- [ ] Add optimistic updates
- [ ] Handle offline mode
- [ ] Add error boundaries
- [ ] Implement retry logic

---

## Example API Client (TypeScript)

```typescript
// api-client.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export const api = {
  // Exercises
  async getExercises(params?: { muscle_group?: string; search?: string }) {
    const { data, error } = await supabase
      .from('workout_exercise_definition')
      .select('*')
      .match(params || {})
      .is('deleted_at', null);

    if (error) throw error;
    return data;
  },

  async createExercise(exercise: { name: string; muscle_group?: string }) {
    const { data, error } = await supabase
      .from('workout_exercise_definition')
      .insert([exercise])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Sessions
  async getCurrentWeekSessions() {
    const { data, error } = await supabase
      .from('current_week_workout_summary')
      .select('*');

    if (error) throw error;
    return data;
  },

  async createSession(workout_date: string) {
    const { data, error } = await supabase
      .from('workout_session')
      .insert([{ workout_date }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // ... more methods
};
```

---

**End of API Documentation**

For database schema details, see [DATABASE_DOCUMENTATION.md](DATABASE_DOCUMENTATION.md)
