# Workout Details Screen Implementation Plan

## Overview
Build a workout details screen that displays the complete information for a single workout session, including all exercises and sets. This screen will be accessible from both the workout history screen and the home dashboard.

## Implementation Approach
**IMPORTANT**: This is a learning project. For each step:
1. Claude will provide the complete code for that step
2. Claude will explain what the code does and why
3. You (the user) will write the code yourself
4. After writing, you'll let Claude know so we can move to the next step
5. This hands-on approach ensures you understand each piece before moving forward

## Current State
- **Navigation**: Workout history screen already navigates to `/workout-session/${sessionId}`, but dashboard only logs to console
- **Backend API**: Endpoint `GET /api/v1/workouts/sessions/:session_id` exists and returns complete workout data
- **Route**: `/workout-session/[id]` page does NOT exist yet - this is what we're building

## API Response Structure
The backend returns:
```typescript
{
  success: boolean;
  error: string | null;
  data: {
    id: string;
    workout_date: string;
    created_at: string;
    exercises: [
      {
        id: string;
        exercise_definition_id: string;
        name: string;
        muscle_group: string;
        order: number;
        sets: [
          {
            id: string;
            set_number: number;
            reps: number;
            weight_kg: number;
          }
        ]
      }
    ]
  }
}
```

## Implementation Steps

### ✅ Step 1: Add Type Definitions (COMPLETED)
**File**: [webapp/src/types/index.ts](webapp/src/types/index.ts)

Add three new interfaces:
```typescript
export interface WorkoutSetDetail {
    id: string;
    set_number: number;
    reps: number;
    weight_kg: number;
}

export interface WorkoutExerciseDetail {
    id: string;
    exercise_definition_id: string;
    name: string;
    muscle_group: string;
    order: number;
    sets: WorkoutSetDetail[];
}

export interface WorkoutSessionDetail {
    id: string;
    workout_date: string;
    created_at: string;
    exercises: WorkoutExerciseDetail[];
}
```

**Learning**: These types match the API response structure from the backend.

---

### ✅ Step 2: Add API Client Method (COMPLETED)
**File**: [webapp/src/lib/api.ts](webapp/src/lib/api.ts)

Add method to fetch session details:
```typescript
async getWorkoutSessionDetail(sessionId: string) {
    return this.request<ApiResponse<WorkoutSessionDetail>>(
        `/api/v1/workouts/sessions/${sessionId}`,
        {
            method: "GET",
        }
    );
}
```

Update imports to include new types:
```typescript
import {
    ApiResponse,
    ExerciseDefinition,
    WeeklySession,
    WorkoutSet,
    WorkoutSessionsResponse,
    WorkoutSessionDetail, // Add this
} from "@/types";
```

**Learning**: This follows the same pattern as `getWorkoutSessions()` and `getWeeklySummary()`.

---

### ✅ Step 3: Create Custom Hook (COMPLETED)
**File**: [webapp/src/hooks/useWorkoutSessionDetail.ts](webapp/src/hooks/useWorkoutSessionDetail.ts) (NEW FILE)

```typescript
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useWorkoutSessionDetail(sessionId: string) {
    return useQuery({
        queryKey: ["workout-session-detail", sessionId],
        queryFn: () => api.getWorkoutSessionDetail(sessionId),
        enabled: !!sessionId,
    });
}
```

**Learning**:
- No `"use client"` directive needed - TanStack Query hooks work in both client and server components
- Follows the same simple pattern as `useWeeklySummary`
- `queryKey` includes sessionId so each session is cached separately
- `queryFn` directly calls the API method (error handling is done in the component)
- `enabled: !!sessionId` prevents queries with invalid IDs

---

### ✅ Step 4: Add ChevronDown Icon (COMPLETED)
**File**: [webapp/src/components/ui/icons.tsx](webapp/src/components/ui/icons.tsx)

Add to exports:
```typescript
export function ChevronDownIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M5 7.5L10 12.5L15 7.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
```

**Learning**: Follows the same SVG pattern as existing icons like ChevronRightIcon.

---

### ✅ Step 5: Create ExerciseSetRow Component (COMPLETED)
**File**: [webapp/src/components/workout-session/ExerciseSetRow.tsx](webapp/src/components/workout-session/ExerciseSetRow.tsx) (NEW FILE)

```typescript
import { WorkoutSetDetail } from "@/types";

interface ExerciseSetRowProps {
    set: WorkoutSetDetail;
}

export function ExerciseSetRow({ set }: ExerciseSetRowProps) {
    return (
        <div className="flex items-center justify-between py-2 border-b border-[var(--border-subtle)] last:border-0">
            <div className="flex gap-8">
                <span className="text-[var(--text-secondary)] min-w-[60px]">
                    Set {set.set_number}
                </span>
                <span className="text-[var(--text-primary)] min-w-[40px]">
                    {set.reps}
                </span>
            </div>
            <span className="text-[var(--text-primary)] font-semibold">
                {set.weight_kg} kg
            </span>
        </div>
    );
}
```

**Learning**:
- Simple presentational component
- Uses CSS variables for theming
- `last:border-0` removes border from last item

---

### ✅ Step 6: Create ExerciseDetailCard Component (COMPLETED)
**File**: [webapp/src/components/workout-session/ExerciseDetailCard.tsx](webapp/src/components/workout-session/ExerciseDetailCard.tsx) (NEW FILE)

```typescript
"use client";

import { useState } from "react";
import { WorkoutExerciseDetail } from "@/types";
import { ChevronDownIcon } from "@/components/ui/icons";
import { ExerciseSetRow } from "./ExerciseSetRow";

interface ExerciseDetailCardProps {
    exercise: WorkoutExerciseDetail;
}

export function ExerciseDetailCard({ exercise }: ExerciseDetailCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div className="bg-[var(--background-secondary)] border border-[var(--border-subtle)] rounded-lg overflow-hidden">
            {/* Header - Always visible, clickable */}
            <button
                onClick={toggleExpanded}
                className="w-full p-4 flex items-center justify-between hover:bg-[var(--background-tertiary)] transition-colors"
            >
                <div className="text-left">
                    <h3 className="text-[var(--text-primary)] font-semibold">
                        {exercise.name}
                    </h3>
                    <p className="text-[var(--text-secondary)] text-sm mt-1">
                        {exercise.sets.length} sets / {exercise.muscle_group}
                    </p>
                </div>
                <ChevronDownIcon
                    className={`text-[var(--text-secondary)] transition-transform ${
                        isExpanded ? "rotate-180" : ""
                    }`}
                />
            </button>

            {/* Expandable content - Sets table */}
            {isExpanded && (
                <div className="px-4 pb-4 pt-2">
                    <div className="flex items-center justify-between mb-2 text-sm text-[var(--text-secondary)] border-b border-[var(--border-subtle)] pb-2">
                        <div className="flex gap-8">
                            <span className="min-w-[60px]">Set</span>
                            <span className="min-w-[40px]">Reps</span>
                        </div>
                        <span>Weight</span>
                    </div>
                    <div>
                        {exercise.sets.map((set) => (
                            <ExerciseSetRow key={set.id} set={set} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
```

**Learning**:
- Client component because it uses `useState`
- `rotate-180` class animates chevron when expanded
- Full-width button for better UX
- Each exercise maintains its own expand/collapse state

---

### ✅ Step 7: Create SessionDetailHeader Component (COMPLETED)
**File**: [webapp/src/components/workout-session/SessionDetailHeader.tsx](webapp/src/components/workout-session/SessionDetailHeader.tsx) (NEW FILE)

```typescript
"use client";

import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "@/components/ui/icons";

interface SessionDetailHeaderProps {
    date: string;
}

export function SessionDetailHeader({ date }: SessionDetailHeaderProps) {
    const router = useRouter();

    const formattedDate = new Date(date).toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
    });

    return (
        <div className="bg-[var(--background-primary)] border-b border-[var(--border-subtle)] px-6 py-4">
            <div className="max-w-2xl mx-auto flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    aria-label="Go back"
                >
                    <ArrowLeftIcon size={24} className="" />
                </button>
                <div>
                    <h1 className="text-xl font-bold text-[var(--text-primary)]">
                        Workout Details
                    </h1>
                    <p className="text-sm text-[var(--text-secondary)]">
                        {formattedDate}
                    </p>
                </div>
            </div>
        </div>
    );
}
```

**Learning**:
- Uses `router.back()` to navigate to previous page (works from both entry points)
- Follows same pattern as `WorkoutHistoryHeader`
- Date formatting matches existing patterns

---

### ✅ Step 8: Create Main Page Component (COMPLETED)
**File**: [webapp/src/app/workout-session/[id]/page.tsx](webapp/src/app/workout-session/[id]/page.tsx) (NEW FILE)

```typescript
"use client";

import { useParams } from "next/navigation";
import { useWorkoutSessionDetail } from "@/hooks/useWorkoutSessionDetail";
import { SessionDetailHeader } from "@/components/workout-session/SessionDetailHeader";
import { ExerciseDetailCard } from "@/components/workout-session/ExerciseDetailCard";
import { LoadingSkeleton } from "@/components/dashboard/LoadingSkeleton";
import { ErrorMessage } from "@/components/dashboard/ErrorMessage";

export default function WorkoutSessionPage() {
    const params = useParams();
    const sessionId = params.id as string;

    const { data, isLoading, isError, error, refetch } = useWorkoutSessionDetail(sessionId);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[var(--background-primary)]">
                <SessionDetailHeader date={new Date().toISOString()} />
                <div className="max-w-2xl mx-auto px-6 py-6">
                    <LoadingSkeleton />
                </div>
            </div>
        );
    }

    if (isError || !data) {
        return (
            <div className="min-h-screen bg-[var(--background-primary)]">
                <SessionDetailHeader date={new Date().toISOString()} />
                <div className="max-w-2xl mx-auto px-6 py-6">
                    <ErrorMessage
                        message={error?.message || "Failed to load workout session"}
                        onRetry={refetch}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--background-primary)]">
            <SessionDetailHeader date={data.workout_date} />

            <div className="max-w-2xl mx-auto px-6 py-6">
                {/* Stats summary */}
                <div className="mb-6">
                    <p className="text-[var(--text-secondary)]">
                        Exercises: <span className="text-[var(--text-primary)] font-semibold">{data.exercises.length}</span>
                    </p>
                </div>

                {/* Section header */}
                <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
                    Exercises Performed
                </h2>

                {/* Exercise list */}
                <div className="space-y-3">
                    {data.exercises.map((exercise) => (
                        <ExerciseDetailCard key={exercise.id} exercise={exercise} />
                    ))}
                </div>
            </div>
        </div>
    );
}
```

**Learning**:
- Client component because it uses hooks
- Uses `useParams()` to get dynamic route parameter
- Three states: loading, error, success
- Reuses existing components (LoadingSkeleton, ErrorMessage)
- `space-y-3` adds consistent spacing between cards

---

### ✅ Step 9: Update Dashboard Navigation (COMPLETED)
**File**: [webapp/src/components/dashboard/WeeklySessionsList.tsx](webapp/src/components/dashboard/WeeklySessionsList.tsx)

Replace the onClick handler (around line 20-22):

**Before**:
```typescript
onClick={() => {
    console.log("Navigate to session:", session.session_id);
}}
```

**After**:
```typescript
onClick={() => {
    router.push(`/workout-session/${session.session_id}`);
}}
```

Add import at the top:
```typescript
import { useRouter } from "next/navigation";
```

Add router hook in component:
```typescript
const router = useRouter();
```

**Learning**: Workout history already has this navigation - now both screens navigate to the same detail page.

---

## Testing Checklist

### 1. Navigation Testing
- [ ] Click workout from dashboard - navigates to detail page
- [ ] Click workout from history - navigates to detail page
- [ ] Back button returns to previous page correctly
- [ ] Invalid session ID shows error message

### 2. Data Display Testing
- [ ] Workout date displays correctly formatted
- [ ] Exercise count shows correct number
- [ ] All exercises display in correct order
- [ ] Muscle groups show for each exercise
- [ ] Set counts are accurate

### 3. Interaction Testing
- [ ] Clicking exercise header expands/collapses
- [ ] Chevron icon rotates on expand/collapse
- [ ] All sets display when expanded
- [ ] Multiple exercises can be expanded simultaneously
- [ ] Hover effects work correctly

### 4. Error Handling Testing
- [ ] Loading state shows skeleton
- [ ] Error state shows error message
- [ ] Retry button refetches data
- [ ] Non-existent session ID handled gracefully

### 5. Responsive Design Testing
- [ ] Page layout works on mobile
- [ ] Text sizes are readable
- [ ] Touch targets are adequate
- [ ] Spacing is consistent

---

## Files Summary

### New Files (5)
1. [webapp/src/app/workout-session/[id]/page.tsx](webapp/src/app/workout-session/[id]/page.tsx) - Main detail page
2. [webapp/src/components/workout-session/SessionDetailHeader.tsx](webapp/src/components/workout-session/SessionDetailHeader.tsx) - Header with back button
3. [webapp/src/components/workout-session/ExerciseDetailCard.tsx](webapp/src/components/workout-session/ExerciseDetailCard.tsx) - Expandable exercise card
4. [webapp/src/components/workout-session/ExerciseSetRow.tsx](webapp/src/components/workout-session/ExerciseSetRow.tsx) - Individual set display
5. [webapp/src/hooks/useWorkoutSessionDetail.ts](webapp/src/hooks/useWorkoutSessionDetail.ts) - Data fetching hook

### Modified Files (4)
1. [webapp/src/types/index.ts](webapp/src/types/index.ts) - Add 3 new interfaces
2. [webapp/src/lib/api.ts](webapp/src/lib/api.ts) - Add getWorkoutSessionDetail method
3. [webapp/src/components/ui/icons.tsx](webapp/src/components/ui/icons.tsx) - Add ChevronDownIcon
4. [webapp/src/components/dashboard/WeeklySessionsList.tsx](webapp/src/components/dashboard/WeeklySessionsList.tsx) - Update onClick handler

---

## Key Learning Points

1. **Dynamic Routes**: Using `[id]` folder creates dynamic route in Next.js App Router
2. **React Query**: Caching and state management for API calls
3. **Component Composition**: Breaking UI into small, reusable pieces
4. **TypeScript**: Type safety across API boundaries
5. **Client vs Server Components**: When to use "use client" directive
6. **CSS Variables**: Consistent theming with custom properties
7. **Router Navigation**: Using useRouter for programmatic navigation
8. **State Management**: Local state for expand/collapse functionality
9. **Error Handling**: Graceful degradation with loading and error states
10. **API Integration**: Following existing patterns for consistency
