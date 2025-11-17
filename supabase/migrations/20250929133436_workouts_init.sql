-- 1. Enable the pgvector extension
create extension if not exists vector;

-- 2. Create the workouts table
create table workouts (
  id bigserial primary key,
  user_id uuid references auth.users not null,
  created_at timestamptz default now(),
  exercise_name text not null,
  reps int not null,
  weight_kg float not null,
  muscle_group text,
  -- The embedding vector for semantic search
  embedding vector(1536)
);

-- 3. Create a function to search for workouts
create or replace function match_workouts (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
returns table (
  id bigint,
  exercise_name text,
  reps int,
  weight_kg float,
  created_at timestamptz,
  similarity float
)
language sql stable
as $$
  select
    workouts.id,
    workouts.exercise_name,
    workouts.reps,
    workouts.weight_kg,
    workouts.created_at,
    1 - (workouts.embedding <=> query_embedding) as similarity
  from workouts
  where 1 - (workouts.embedding <=> query_embedding) > match_threshold
  order by similarity desc
  limit match_count;
$$;