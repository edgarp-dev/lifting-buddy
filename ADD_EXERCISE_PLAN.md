# Add Exercise Screen - Implementation Plan

**Status**: 🟡 In Progress - Phase 4
**Last Updated**: 2025-11-24
**Current Phase**: Phase 4 - Sets Performance Section

---

## 📖 Project Context

### Overview
Lifting Buddy is a full-stack fitness tracking application with AI-powered features. This document tracks the implementation of the "Add Exercise" screen, which allows users to log workout exercises with sets, reps, and weights.

### Tech Stack
- **Frontend**: Next.js 15.5.5 (App Router), React 19, TypeScript, Tailwind CSS 4
- **Backend**: Deno API with Oak framework, Zod validation
- **Database**: Supabase (PostgreSQL with pgvector)
- **Auth**: Supabase Auth with SSR (@supabase/ssr)

### Key Files Reference
- Main project docs: [CLAUDE.md](CLAUDE.md)
- Webapp docs: [webapp/CLAUDE.md](webapp/CLAUDE.md)
- Database schema: [DATABASE_DOCUMENTATION.md](DATABASE_DOCUMENTATION.md)
- API endpoints: [api/src/main.ts](api/src/main.ts)
- Design mockup: [webapp/screens.png](webapp/screens.png)

---

## 🎯 Feature Requirements

Based on the design mockup and user requirements:

1. ✅ **Header**: Back arrow button (not X) that navigates to dashboard
2. ✅ **Muscle Group Selector**: Horizontal scrollable list with options: Leg, Chest, Back, Tricep, Bicep, Shoulders
3. ✅ **Exercise Name Input**:
   - Search existing exercises as user types (using `/api/v1/search/exercises`)
   - Display matching results in dropdown
   - Show "Create New Exercise" button if no matches (uses `/api/v1/workouts/exercise-definition`)
4. ✅ **Performance Section (Sets)**:
   - Each row shows: Set number, Reps input, Weight input, Red trash icon for deletion
   - "Add Set" button to add new set
   - "Copy Previous" button to duplicate last set's values
5. ✅ **Form Submission**:
   - "Log Exercise" button posts to `/api/v1/workouts/exercise`
   - Show loading spinner in button during submission
   - Disable button and back arrow during submission
   - Display success/error feedback after submission

---

## 🗂️ API Endpoints Used

### 1. Search Exercises
```
GET /api/v1/search/exercises?q={searchQuery}
```
**Response**:
```json
{
  "success": true,
  "error": null,
  "data": [
    {
      "id": "uuid",
      "name": "Bench Press",
      "muscle_group": "Chest"
    }
  ]
}
```

### 2. Create Exercise Definition
```
POST /api/v1/workouts/exercise-definition
```
**Request Body**:
```json
{
  "name": "Bench Press",
  "muscle_group": "Chest"
}
```
**Response**:
```json
{
  "success": true,
  "error": null,
  "data": {
    "id": "uuid",
    "name": "Bench Press",
    "muscle_group": "Chest",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
}
```

### 3. Log Workout Exercise
```
POST /api/v1/workouts/exercise
```
**Request Body**:
```json
{
  "exercise_definition_id": "uuid",
  "sets": [
    { "set": 1, "reps": 10, "weight_kg": 60 },
    { "set": 2, "reps": 8, "weight_kg": 65 }
  ]
}
```
**Response**:
```json
{
  "success": true,
  "error": null,
  "data": {
    "id": "session_exercise_id"
  }
}
```

**Notes**:
- API creates or finds today's workout session automatically
- Sets are validated (1-20 sets max, unique set numbers)
- Embeddings are generated automatically for AI features

---

## 📋 Implementation Phases

### **Phase 1: Page Structure & Navigation** ✅ Complete

#### Task 1.1: Create the Add Exercise Page ✅
- **File**: `webapp/src/app/dashboard/add-exercise/page.tsx`
- **Type**: Server Component (for auth check) wrapping Client Component
- **What to learn**:
  - Next.js App Router page creation
  - Server vs Client component patterns
  - Authentication in server components
- **Implementation Steps**:
  1. Create directory structure: `webapp/src/app/dashboard/add-exercise/`
  2. Create `page.tsx` as server component
  3. Add authentication check using `createClient()` from `@/lib/supabase/server`
  4. Redirect to `/auth/login` if not authenticated
  5. Pass user data to client component
  6. Export as default component
- **Code Pattern**:
  ```tsx
  import { createClient } from "@/lib/supabase/server";
  import { redirect } from "next/navigation";
  import { AddExerciseForm } from "@/components/dashboard/AddExerciseForm";

  export default async function AddExercisePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      redirect("/auth/login");
    }

    return <AddExerciseForm />;
  }
  ```
- **Status**: ✅ Complete
- **Actual Implementation**: Removed auth check - middleware already handles route protection
- **Files Created**: `webapp/src/app/dashboard/add-exercise/page.tsx`

#### Task 1.2: Create the Header with Back Button ✅
- **File**: `webapp/src/components/add-exercise/AddExerciseHeader.tsx`
- **Type**: Client Component (uses navigation)
- **What to learn**:
  - Next.js navigation with `useRouter`
  - Icon usage in React
  - Header layout patterns
- **Implementation Steps**:
  1. Create client component with `'use client'` directive
  2. Import `useRouter` from `next/navigation`
  3. Add back arrow icon (can use ← or import from icon library)
  4. Add click handler: `router.push('/dashboard')`
  5. Style with dark theme colors
  6. Center title "Add Exercise"
  7. Add disabled state prop for loading
- **Design Specs**:
  - Background: `--background-secondary`
  - Height: ~60px
  - Back button: Left aligned, clickable area ~44x44px
  - Title: Center aligned, `--text-primary`
  - Disable interactions when `isLoading={true}`
- **Status**: ✅ Complete
- **Files Created**:
  - `webapp/src/components/add-exercise/AddExerciseHeader.tsx`
  - Added `ArrowLeftIcon` to `webapp/src/components/ui/icons.tsx`
- **Key Learnings**:
  - Used `next/navigation` instead of `next/router` for App Router
  - Created reusable SVG icon following existing patterns
  - Implemented disabled state for form submission blocking

---

### **Phase 2: Muscle Group Selection** ✅ Complete

#### Task 2.1: Create Horizontal Scrollable Muscle Group Selector ✅
- **File**: `webapp/src/components/add-exercise/MuscleGroupSelector.tsx`
- **Type**: Client Component
- **What to learn**:
  - Horizontal scroll UI patterns
  - State management with `useState`
  - Tailwind scroll utilities
  - Touch-friendly mobile UI
- **Data**:
  ```typescript
  const muscleGroups = ['Leg', 'Chest', 'Back', 'Tricep', 'Bicep', 'Shoulders'];
  ```
- **Implementation Steps**:
  1. Create client component with state: `const [selected, setSelected] = useState<string>('')`
  2. Create horizontal scroll container with Tailwind classes
  3. Map over muscle groups to create buttons
  4. Add click handler to set selected muscle group
  5. Apply visual styling for selected state (blue highlight)
  6. Pass selected value up via callback prop
  7. Add smooth scroll behavior
- **Design Specs**:
  - Container: `overflow-x-auto`, hide scrollbar or show minimal
  - Each button: Pill-shaped, padding, margin between items
  - Selected: `bg-[var(--accent-primary)]`, `text-white`
  - Unselected: `bg-[var(--background-tertiary)]`, `text-[var(--text-secondary)]`
  - Scroll snap for better UX
- **Props**:
  ```typescript
  interface MuscleGroupSelectorProps {
    selected: string;
    onSelect: (muscleGroup: string) => void;
    disabled?: boolean;
  }
  ```
- **Status**: ✅ Complete
- **Files Created**:
  - `webapp/src/components/add-exercise/MuscleGroupSelector.tsx`
  - `webapp/src/components/add-exercise/AddExerciseForm.tsx`
- **Key Learnings**:
  - Horizontal scroll with snap points for smooth mobile UX
  - Hidden scrollbar using custom CSS (`.scrollbar-hide`)
  - Edge-to-edge scrolling with negative margins (`-mx-4 px-4`)
  - Touch feedback with `active:scale-95`
  - State management pattern: lift state to parent component
  - Added "Core" muscle group in addition to the original 6
- **Mobile Optimizations**:
  - `snap-x snap-mandatory` for smooth scrolling
  - `flex-shrink-0` to prevent button sizing issues
  - `active:scale-95` for native-app-like touch feedback
  - Scrollbar completely hidden for clean look

---

### **Phase 3: Exercise Name Search & Selection** ✅ Complete

#### Task 3.1: Create Exercise Name Input with Search ✅
- **File**: `webapp/src/components/add-exercise/ExerciseNameInput.tsx`
- **Type**: Client Component
- **What to learn**:
  - Debouncing user input
  - API calls with `api` client
  - Dropdown/Autocomplete UI patterns
  - Loading states for search
  - Click outside to close dropdown
- **Implementation Approach**: Step-by-step learning (Option A)
- **Step-by-Step Progress**:
  - ✅ **Step 1**: Updated API client with `searchExercises` method
  - ✅ **Step 2**: Created basic component structure
  - ✅ **Step 3**: Added debouncing logic
  - ✅ **Step 4**: Add API call to search function
  - ✅ **Step 5**: Build dropdown UI with results
  - ✅ **Step 6**: Add click-outside detection
  - ✅ **Step 7**: Integrate with form
- **Status**: ✅ Complete
- **Key Learnings**:
  - Absolute positioning with `z-10` for dropdown overlay
  - `max-h-60 overflow-y-auto` for scrollable dropdown
  - Hover states with `hover:bg-[var(--background-tertiary)]`
  - Click-outside detection with `useEffect` and `document.addEventListener`
  - Cleanup functions to prevent memory leaks

#### Task 3.2: Add "Create New Exercise" Button ✅
- **File**: Part of `ExerciseNameInput.tsx`
- **What to learn**:
  - Conditional rendering based on search results
  - API POST requests
  - Optimistic UI updates
- **Status**: ✅ Complete
- **Implementation**:
  - Added `isCreating` state for loading
  - Added `createExerciseDefinition` method to API client
  - Button shows when no results found
  - Disabled when no muscle group selected (with warning message)
  - On success: selects the new exercise and closes dropdown

---

### **Phase 4: Sets Performance Section** ⬜ Not Started

#### Task 4.1: Create Set Row Component ⬜
- **File**: `webapp/src/components/dashboard/SetRow.tsx`
- **Type**: Client Component
- **What to learn**:
  - Controlled form inputs
  - Number input validation
  - Grid/Flex layouts for aligned columns
- **Implementation Steps**:
  1. Create component that receives set data and callbacks
  2. Display: Set number (read-only), Reps input, Weight input, Delete button
  3. Use controlled inputs with `onChange` callbacks
  4. Validate: Numbers only, positive values
  5. Delete button: Red trash icon, calls `onDelete` callback
  6. Style in grid layout for alignment
- **Design Specs**:
  - Grid with 4 columns: `Set #`, `Reps`, `Weight`, `Delete`
  - Inputs: `--background-tertiary`, rounded, padding
  - Delete icon: `--accent-error`, 24px size
  - Align all inputs in rows
- **Props**:
  ```typescript
  interface SetRowProps {
    setNumber: number;
    reps: number;
    weightKg: number;
    onRepsChange: (value: number) => void;
    onWeightChange: (value: number) => void;
    onDelete: () => void;
    disabled?: boolean;
  }
  ```
- **Status**: ⬜ Not Started

#### Task 4.2: Create Sets Manager Component ⬜
- **File**: `webapp/src/components/dashboard/SetsManager.tsx`
- **Type**: Client Component
- **What to learn**:
  - Array state management
  - Dynamic form arrays
  - Adding/removing items from state arrays
- **Implementation Steps**:
  1. State: `const [sets, setSets] = useState<WorkoutSet[]>([])`
  2. "Add Set" button: Adds new set with `set_number = sets.length + 1`
  3. "Copy Previous" button: Duplicates last set's reps/weight
  4. Map over sets to render `SetRow` components
  5. Handle delete by filtering out set and renumbering remaining sets
  6. Pass sets array up to parent via callback
- **Design Specs**:
  - Section title: "Performance"
  - Column headers: "Set", "Reps", "Weight (kg)", ""
  - Buttons at bottom: "Add Set" and "Copy Previous"
  - Use existing `Button` component with secondary variant
- **Props**:
  ```typescript
  interface SetsManagerProps {
    sets: WorkoutSet[];
    onSetsChange: (sets: WorkoutSet[]) => void;
    disabled?: boolean;
  }
  ```
- **Status**: ⬜ Not Started

---

### **Phase 5: Form Submission & Feedback** ⬜ Not Started

#### Task 5.1: Create Form Submit Logic ⬜
- **File**: Main form in `webapp/src/components/dashboard/AddExerciseForm.tsx`
- **What to learn**:
  - Form validation before submission
  - Composing data from multiple child components
  - API POST requests with complex data
- **Implementation Steps**:
  1. Collect state from all child components (muscle group, exercise, sets)
  2. Validate: exercise selected, at least 1 set, all set data filled
  3. Format data to match API schema
  4. Call `apiClient.post('/workouts/exercise', payload)`
  5. Handle response
- **Validation Rules**:
  - Exercise definition must be selected
  - At least 1 set required
  - All sets must have valid reps and weight (positive numbers)
  - Set numbers must be unique
- **API Payload Format**:
  ```typescript
  {
    exercise_definition_id: string,
    sets: [
      { set: 1, reps: 10, weight_kg: 60.5 },
      { set: 2, reps: 8, weight_kg: 65 }
    ]
  }
  ```
- **Status**: ⬜ Not Started

#### Task 5.2: Add Loading State ⬜
- **What to learn**:
  - Managing loading states across components
  - Disabling UI during async operations
- **Implementation Steps**:
  1. Add state: `const [isLoading, setIsLoading] = useState(false)`
  2. Set `isLoading = true` before API call
  3. Set `isLoading = false` after API call (success or error)
  4. Pass `isLoading` to Button component (`isLoading` prop already exists)
  5. Pass `disabled={isLoading}` to all input components
  6. Pass `disabled={isLoading}` to back button in header
- **Design Specs**:
  - Button shows spinner when loading (built into Button component)
  - All inputs grayed out when disabled
  - Back button not clickable when disabled
- **Status**: ⬜ Not Started

#### Task 5.3: Add Success/Error Feedback ⬜
- **What to learn**:
  - User feedback patterns
  - Toast notifications or inline messages
  - Navigation after success
- **Implementation Steps**:
  1. Create state for feedback: `const [feedback, setFeedback] = useState<{type: 'success' | 'error', message: string} | null>(null)`
  2. On success:
     - Show success message: "Exercise logged successfully!"
     - Wait 1.5 seconds
     - Redirect to `/dashboard` using `router.push()`
  3. On error:
     - Extract error message from API response
     - Show error message: "Failed to log exercise: {error}"
     - Don't clear form data (let user fix and retry)
  4. Display feedback message at top or bottom of form
  5. Auto-dismiss success after redirect
- **Design Specs**:
  - Success: Green background (`--accent-success`), white text
  - Error: Red background (`--accent-error`), white text
  - Padding, rounded corners, slide-in animation
  - Position: Fixed at top or bottom
- **Optional Enhancement**: Use a toast library like `react-hot-toast` or `sonner`
- **Status**: ⬜ Not Started

---

### **Phase 6: TypeScript Types & Validation** ⬜ Not Started

#### Task 6.1: Define TypeScript Interfaces ⬜
- **File**: `webapp/src/types/index.ts`
- **What to learn**:
  - TypeScript interfaces for API data
  - Type safety for form data
  - Sharing types across components
- **Types to Add**:
  ```typescript
  // Exercise Definition from API
  export interface ExerciseDefinition {
    id: string;
    name: string;
    muscle_group: string;
    created_at: string;
    updated_at: string;
  }

  // Workout Set for form
  export interface WorkoutSet {
    set: number;
    reps: number;
    weight_kg: number;
  }

  // Create Workout Exercise Request
  export interface CreateWorkoutExerciseRequest {
    exercise_definition_id: string;
    sets: WorkoutSet[];
  }

  // API Response wrapper
  export interface ApiResponse<T> {
    success: boolean;
    error: string | null;
    data: T | null;
  }
  ```
- **Status**: ⬜ Not Started

---

### **Phase 7: Styling & Polish** ⬜ Not Started

#### Task 7.1: Apply Dark Theme Styling ⬜
- **What to learn**:
  - Tailwind CSS 4 with CSS variables
  - Consistent design system application
  - Dark theme best practices
- **Color Palette** (from `webapp/CLAUDE.md`):
  ```css
  --background-primary: #1a1d29    /* Main background */
  --background-secondary: #252937  /* Cards, headers */
  --background-tertiary: #2d3142   /* Inputs */
  --text-primary: #ffffff          /* Primary text */
  --text-secondary: #9ca3af        /* Secondary text */
  --text-tertiary: #6b7280         /* Disabled/placeholder */
  --accent-primary: #3b82f6        /* Blue for primary actions */
  --accent-success: #10b981        /* Green for success */
  --accent-error: #ef4444          /* Red for errors/delete */
  --border-subtle: #374151         /* Subtle borders */
  --border-default: #4b5563        /* Default borders */
  ```
- **Usage Pattern**:
  ```tsx
  className="bg-[var(--background-primary)] text-[var(--text-primary)]"
  ```
- **Components to Style**:
  - Page background: `--background-primary`
  - Header: `--background-secondary`
  - Muscle group buttons: Selected (`--accent-primary`), Unselected (`--background-tertiary`)
  - Input fields: `--background-tertiary`, `--text-primary`
  - Dropdown: `--background-secondary`
  - Delete icon: `--accent-error`
  - Success message: `--accent-success`
  - Primary button: `--accent-primary`
- **Status**: ⬜ Not Started

#### Task 7.2: Add Responsive Design ⬜
- **What to learn**:
  - Mobile-first responsive design
  - Touch-friendly interfaces
  - Testing on different screen sizes
- **Implementation**:
  - Target mobile viewport (375px - 430px based on mockup)
  - Ensure horizontal scroll works smoothly on touch devices
  - Button tap targets minimum 44x44px (Apple HIG recommendation)
  - Proper spacing: 16px padding on sides, 8px-16px vertical spacing
  - Test keyboard behavior on mobile (inputs, form submission)
- **Testing Checklist**:
  - [ ] Test on Chrome DevTools mobile emulator
  - [ ] Test horizontal scroll with mouse and touch
  - [ ] Verify all buttons are easily tappable
  - [ ] Check that dropdowns don't overflow screen
  - [ ] Ensure virtual keyboard doesn't cover inputs
- **Status**: ⬜ Not Started

---

### **Phase 8: Testing & Documentation** ⬜ Not Started

#### Task 8.1: Manual Testing Checklist ⬜
- **What to test**:
  - [ ] **Authentication**: Redirects to login when not authenticated
  - [ ] **Navigation**: Back button navigates to dashboard
  - [ ] **Muscle Group**: Can select each muscle group, visual feedback works
  - [ ] **Exercise Search**:
    - [ ] Search returns results as typing
    - [ ] Results display correctly
    - [ ] Can select existing exercise
    - [ ] Debouncing works (doesn't fire too many requests)
  - [ ] **Create Exercise**:
    - [ ] Button appears when no results
    - [ ] Creates new exercise successfully
    - [ ] Shows loading state
    - [ ] Error handling works
  - [ ] **Sets Management**:
    - [ ] Can add sets
    - [ ] Can delete sets
    - [ ] "Copy Previous" works
    - [ ] Set numbers update correctly after deletion
    - [ ] Input validation works (positive numbers)
  - [ ] **Form Submission**:
    - [ ] Validation prevents submission with missing data
    - [ ] Loading state appears
    - [ ] Success: Redirects to dashboard after 1.5s
    - [ ] Error: Shows error message, preserves form data
    - [ ] All UI disabled during submission
  - [ ] **Edge Cases**:
    - [ ] Submitting with 0 sets
    - [ ] Submitting without selecting exercise
    - [ ] Deleting all sets
    - [ ] Very long exercise names
    - [ ] Network errors
    - [ ] Slow network (test loading states)
- **Status**: ⬜ Not Started

#### Task 8.2: Update Context Documentation ⬜
- **File**: Create `webapp/src/app/dashboard/add-exercise/CONTEXT.md`
- **What to document**:
  1. **Component Architecture**:
     - File structure
     - Component hierarchy
     - Data flow (parent to child, child to parent)
  2. **State Management**:
     - What state lives where
     - Why certain state decisions were made
  3. **API Integration**:
     - Which endpoints are used
     - Request/response formats
     - Error handling approach
  4. **Key Learnings**:
     - Challenges faced during implementation
     - Solutions and workarounds
     - Performance considerations
  5. **Known Issues/Future Improvements**:
     - Any bugs or limitations
     - Features to add later (e.g., edit sets, previous performance data)
  6. **Testing Notes**:
     - How to test the feature
     - Common issues and fixes
- **Status**: ⬜ Not Started

---

## 🎓 Learning Objectives

This implementation will teach:

1. **Next.js App Router**: Server vs Client components, routing, navigation
2. **React Patterns**: State management, component composition, controlled inputs
3. **API Integration**: GET/POST requests, loading states, error handling
4. **Form Handling**: Validation, dynamic arrays, submission flow
5. **TypeScript**: Interfaces, type safety, API typing
6. **Tailwind CSS 4**: CSS variables, responsive design, dark theme
7. **UX Patterns**: Debouncing, autocomplete, loading states, user feedback
8. **Authentication**: Protected routes, user context

---

## 📊 Progress Tracking

### Overall Progress: 5/15 tasks completed (33%)

| Phase | Tasks | Completed | Status |
|-------|-------|-----------|--------|
| Phase 1: Page Structure & Navigation | 2 | 2 | ✅ Completed |
| Phase 2: Muscle Group Selection | 1 | 1 | ✅ Completed |
| Phase 3: Exercise Search & Selection | 2 | 2 | ✅ Completed |
| Phase 4: Sets Performance Section | 2 | 0 | ⬜ Not Started |
| Phase 5: Form Submission & Feedback | 3 | 0 | ⬜ Not Started |
| Phase 6: TypeScript Types | 1 | 0 | ⬜ Not Started |
| Phase 7: Styling & Polish | 2 | 0 | ⬜ Not Started |
| Phase 8: Testing & Documentation | 2 | 0 | ⬜ Not Started |

**Status Legend**:
- ⬜ Not Started
- 🟡 In Progress
- ✅ Completed
- ⚠️ Blocked

---

## 🔄 Change Log

### 2025-11-17 - Session 1
- ✅ Initial plan created
- ✅ All 8 phases defined with 16 tasks
- ✅ API endpoints documented
- ✅ Design requirements captured
- ✅ Learning objectives identified
- ✅ **Phase 1 Complete**:
  - Created `webapp/src/app/dashboard/add-exercise/page.tsx`
  - Created `webapp/src/components/add-exercise/AddExerciseHeader.tsx`
  - Added `ArrowLeftIcon` to `webapp/src/components/ui/icons.tsx`
  - Learned about Next.js App Router vs Pages Router
  - Learned that middleware already protects `/dashboard/*` routes
  - Header with back navigation working
- ✅ **Phase 2 Complete**:
  - Created `webapp/src/components/add-exercise/MuscleGroupSelector.tsx`
  - Created `webapp/src/components/add-exercise/AddExerciseForm.tsx`
  - Implemented mobile-first horizontal scrolling with snap points
  - Hidden scrollbar for cleaner mobile UI
  - Added edge-to-edge scrolling optimization
  - Touch feedback with scale animation
  - State lifted to form wrapper component

### 2025-11-18 - Session 2
- Started Phase 3 implementation
- Added API client methods and basic component structure

### 2025-11-24 - Session 3
- ✅ **Phase 3 Complete**:
  - **Task 3.1**: Exercise Name Input with Search
    - Built dropdown UI with search results
    - Added click-outside detection using `useRef` and `document.addEventListener`
    - Integrated component with AddExerciseForm
    - Absolute positioning with z-index for proper layering
    - Hover states and scrollable results list
  - **Task 3.2**: Create New Exercise Button
    - Added `createExerciseDefinition` method to API client
    - Button appears when no search results found
    - Shows warning when muscle group not selected
    - Loading state during creation
  - **Key Learnings**:
    - Click-outside pattern with cleanup functions
    - Conditional rendering based on multiple states
    - Form integration with lifted state pattern

---

## 🚀 Next Steps

**Current Task**: Phase 4 - Sets Performance Section

**To Continue**:
1. Read this document to understand context
2. Start with Task 4.1: Create SetRow component
3. Then Task 4.2: Create SetsManager component
4. Update task status as you work (⬜ → 🟡 → ✅)
5. Update the Change Log when completing phases

**Quick Start Command**:
```bash
cd webapp
npm run dev
# Visit http://localhost:3000/dashboard/add-exercise
```

---

## 📝 Notes & Decisions

### Design Decisions
- Using horizontal scroll for muscle groups (better mobile UX than dropdown)
- Debounce search at 300ms (balance between responsiveness and API load)
- Auto-create today's session (user doesn't need to manually create sessions)
- Redirect after success (clean flow back to dashboard)

### Technical Decisions
- Server component for auth check, client components for interactivity
- API client from `@/lib/api` for automatic token injection
- Existing UI components (Button, Input) for consistency
- Tailwind CSS with CSS variables (easy theming)

### Future Enhancements (Post-MVP)
- Show previous performance data for the exercise
- Edit existing sets in a session
- Timer for rest periods between sets
- Exercise notes/comments
- Pre-defined workout templates
- Exercise images/videos
- RPE (Rate of Perceived Exertion) tracking

---

*This is a living document. Update it as implementation progresses.*