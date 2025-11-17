# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Lifting Buddy is a full-stack fitness tracking application with AI-powered features. The project consists of three main components:

- **webapp**: Next.js 15.5.5 frontend with Supabase authentication
- **api**: Deno backend API with Google Gemini integration for embeddings and chat
- **supabase**: PostgreSQL database with vector search capabilities

## Essential Commands

### Webapp (Next.js)
```bash
cd webapp
npm run dev          # Start development server with Turbopack
npm run build        # Build production bundle
npm run lint         # Run ESLint
```

### API (Deno)
```bash
cd api
deno task dev        # Start API server with hot reload
# Runs: deno run --env-file=.env --allow-env --allow-net --watch ./src/main.ts
```

### Supabase
```bash
# Migrations are in /supabase/migrations/
# Apply migrations through Supabase dashboard or CLI
```

## Architecture Overview

### Tech Stack
- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 4
- **Backend**: Deno, Oak framework, Zod validation
- **Database**: Supabase (PostgreSQL with pgvector)
- **AI**: Google Gemini (embeddings via `gemini-embedding-001`, generation via `gemini-2.5-flash`)
- **Auth**: Supabase Auth with SSR (@supabase/ssr)

### Project Structure
```
/
├── webapp/src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # React components (UI & Dashboard)
│   ├── lib/              # API client, Supabase clients, utilities
│   ├── types/            # TypeScript interfaces
│   └── middleware.ts     # Route protection
├── api/src/
│   ├── main.ts           # Main router and endpoints
│   ├── middleware/       # Auth middleware (JWT validation)
│   └── rag/              # Embeddings & content generation
└── supabase/
    └── migrations/       # Database schema migrations
```

## Database Schema

The database follows a normalized structure for workout tracking:

**Core Flow**: `workout_session` → `workout_session_exercise` → `workout_set`

**Key Tables**:
- `workout_exercise_definition`: Exercise catalog (e.g., "Bench Press")
- `workout_session`: A workout on a specific date
- `workout_session_exercise`: Exercise instance in a session (with order)
- `workout_set`: Individual sets with reps/weight

**Important Features**:
- Vector embeddings (1536-dimensional) for semantic search
- Soft deletes (`deleted_at` column)
- Row-Level Security (RLS) enabled
- Case-insensitive unique exercise names per user
- IVFFlat indexes for vector similarity search

**Key Views**:
- `current_week_workout_summary`: Dashboard stats
- `workout_complete_details`: Full workout context for AI
- `exercise_progress_summary`: Progress tracking

**Key Functions**:
- `match_workouts(query_embedding, match_threshold, match_count)`: Semantic search
- `search_exercises(query_text)`: Text-based exercise search

Refer to [DATABASE_DOCUMENTATION.md](DATABASE_DOCUMENTATION.md) for complete schema details.

## Authentication Flow

1. User logs in via Supabase Auth (email/password)
2. JWT stored in HTTP-only cookies (handled by @supabase/ssr)
3. Next.js middleware ([middleware.ts](webapp/src/middleware.ts)) validates and refreshes sessions
4. Protected routes redirect to `/auth/login` if unauthenticated
5. API requests include JWT in `Authorization: Bearer <token>` header
6. Deno auth middleware ([middleware/auth.ts](api/src/middleware/auth.ts)) validates tokens

**Key Files**:
- [webapp/src/lib/supabase/client.ts](webapp/src/lib/supabase/client.ts): Browser Supabase client
- [webapp/src/lib/supabase/server.ts](webapp/src/lib/supabase/server.ts): Server-side Supabase client
- [webapp/src/lib/api.ts](webapp/src/lib/api.ts): API client with automatic token injection

### Validation
- All requests validated with Zod schemas
- Type coercion enabled (e.g., string "5" → number 5)
- Returns 400 with detailed error messages on validation failure

## Code Conventions

### Naming
- **Database tables**: `snake_case` (e.g., `workout_exercise_definition`)
- **API routes**: `kebab-case` (e.g., `/api/v1/workouts/exercise`)
- **Components**: `PascalCase` (e.g., `LoginForm.tsx`)
- **Functions/variables**: `camelCase`

### TypeScript
- Strict mode enabled in webapp
- All types defined in `webapp/src/types/index.ts` for webapp
- Zod schemas for runtime validation in API

### Components
- Use `'use client'` directive for interactive components (forms, buttons with onClick)
- Server Components (default) for data fetching
- UI components in `webapp/src/components/ui/`
- Feature components in `webapp/src/components/dashboard/`

### API Development
- All routes protected by auth middleware
- Use `ctx.state.user` and `ctx.state.supabase` for authenticated operations
- Log operation duration for performance monitoring
- Use soft deletes instead of hard deletes

### Database Queries
- Always use `(SELECT auth.uid())` instead of `auth.uid()` for better performance
- Filter by `deleted_at IS NULL` for soft-deleted records
- Reuse exercise definitions (check if exists before creating)
- Maintain `exercise_order` when adding exercises to sessions

## Development Workflow

### Testing API Changes
```bash
cd api
deno task dev
# API runs on http://localhost:8000
```

### Testing Webapp Changes
```bash
cd webapp
npm run dev
# Webapp runs on http://localhost:3000
```

### Environment Variables
Required in `api/.env`:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GOOGLE_GEMINI_API_KEY`

Required in `webapp/.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_API_URL` (defaults to http://localhost:8000)

## Important Notes

- The webapp uses Next.js 15 with **Turbopack** (note the `--turbopack` flag in build scripts)
- The API uses **Deno** (not Node.js) - no `package.json`, uses `deno.json` instead
- Database schema has undergone major refactoring (see migration history in DATABASE_DOCUMENTATION.md)
- All tables use soft deletes - never hard delete records
- Vector embeddings are 1536-dimensional (update both tables if dimension changes)

## Workflow Notes
- This is a learning project
- Every task needs to be separated into multiple small tasks
- Every task sould be approached as a learning step, code needs to be explained and let the user write the code
- After each task a context file with the relevant instructions needs to be updated or created so it can be referenced in the next task
