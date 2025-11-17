# Dashboard Testing Checklist

## Pre-Testing Setup

### 1. Environment Variables
- [ ] Verify `.env.local` has all required variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `NEXT_PUBLIC_API_URL` (defaults to http://localhost:8000)

### 2. Services Running
- [ ] API server running: `cd api && deno task dev`
- [ ] Webapp running: `cd webapp && npm run dev`
- [ ] Supabase instance accessible

---

## Authentication Flow Testing

### Login Flow
- [ ] Visit `http://localhost:3000/`
- [ ] Should redirect to `/auth/login` if not logged in
- [ ] Log in with valid credentials
- [ ] Should redirect to `/dashboard` after successful login

### Logout Flow
- [ ] Log out from dashboard
- [ ] Should redirect to `/auth/login`
- [ ] Try accessing `/dashboard` directly
- [ ] Should redirect back to `/auth/login`

### Already Logged In
- [ ] While logged in, visit `/auth/login`
- [ ] Should redirect to `/dashboard`
- [ ] Visit `/` while logged in
- [ ] Should redirect to `/dashboard`

---

## Dashboard Component Testing

### Header Component
- [ ] Dumbbell icon displays correctly (blue color)
- [ ] "Lifting Buddy" text is visible
- [ ] User profile icon displays on the right
- [ ] Header has dark background (`--background-primary`)
- [ ] Profile icon has hover effect (background changes)

### Greeting Section
- [ ] Displays "Hello, {username}!"
- [ ] Username is extracted from email (part before @)
- [ ] Large, bold text (white color)
- [ ] Proper spacing below greeting

### Weekly Sessions List - Loading State
- [ ] On first load, skeleton loader appears
- [ ] Shows 3 animated skeleton cards
- [ ] Skeleton cards have pulse animation
- [ ] Section title "This Week's Completed Sessions" is visible

### Weekly Sessions List - Error State
- [ ] Simulate API error (stop API server or use invalid URL)
- [ ] Error message displays with text
- [ ] "Retry" button is visible
- [ ] Click retry button
- [ ] Should attempt to refetch data
- [ ] Check browser console for TanStack Query retry

### Weekly Sessions List - Empty State
- [ ] With no workout sessions in current week
- [ ] Displays "No workouts completed this week yet."
- [ ] Shows encouraging message "Start a new workout to see it here!"
- [ ] Section title still visible

### Weekly Sessions List - Success State
- [ ] With workout sessions data from API
- [ ] Session cards render in a list
- [ ] Each card shows:
  - [ ] Dumbbell icon (blue, 20px)
  - [ ] Exercise/muscle group names
  - [ ] Calendar icon (gray, 16px)
  - [ ] Formatted date (e.g., "Mon, 28 Nov")
  - [ ] Chevron right icon (gray, 20px)
- [ ] Cards have dark background (`--background-secondary`)
- [ ] Cards have subtle border
- [ ] Hover over card:
  - [ ] Card scales up slightly (1.02)
  - [ ] Border becomes brighter
- [ ] Click on card:
  - [ ] Console logs session ID
  - [ ] (Navigation will be implemented later)

### Dashboard Actions
- [ ] "Create a workout session" button displays
  - [ ] Large blue button
  - [ ] Plus sign "+" visible
  - [ ] White text
  - [ ] Takes most horizontal space
  - [ ] Hover reduces opacity
  - [ ] Click shows alert "Create Workout clicked!"
- [ ] Calendar icon button displays
  - [ ] Square button with dark background
  - [ ] Calendar icon (24px, white)
  - [ ] Border visible
  - [ ] Hover changes border color
  - [ ] Click shows alert "View Calendar clicked!"
- [ ] "View Full History" link displays
  - [ ] Centered below buttons
  - [ ] Blue text color
  - [ ] Hover adds underline
  - [ ] Click shows alert "View History clicked!"

---

## Layout & Styling Testing

### Container & Spacing
- [ ] Dashboard has dark background (`#1a1d29`)
- [ ] Content is centered with max-width (672px)
- [ ] Proper padding on mobile (16px horizontal, 32px vertical)
- [ ] Full viewport height (`min-h-screen`)

### Typography
- [ ] Geist Sans font family loads correctly
- [ ] Greeting text is large and bold (36px)
- [ ] Section titles are semibold (20px)
- [ ] Body text is readable (16px)
- [ ] Date text is smaller (14px)

### Colors (Dark Theme)
- [ ] Background primary: `#1a1d29` (page background)
- [ ] Background secondary: `#252937` (cards)
- [ ] Text primary: `#ffffff` (white)
- [ ] Text secondary: `#9ca3af` (gray)
- [ ] Accent primary: `#3b82f6` (blue - buttons, icons)
- [ ] Border subtle: `#374151` (card borders)
- [ ] Border default: `#4b5563` (hover borders)

### Responsive Design
- [ ] Test on mobile viewport (375px width)
  - [ ] All content fits without horizontal scroll
  - [ ] Buttons stack properly
  - [ ] Cards display correctly
- [ ] Test on tablet viewport (768px width)
  - [ ] Content remains centered
  - [ ] Max-width container prevents stretching
- [ ] Test on desktop (1440px width)
  - [ ] Content doesn't become too wide (max 672px)

---

## TanStack Query Testing

### DevTools
- [ ] Open React Query DevTools (bottom-left icon)
- [ ] Verify query with key `["weekly-summary"]` exists
- [ ] Check query status (success/loading/error)
- [ ] View cached data

### Caching Behavior
- [ ] Load dashboard (fresh data fetched)
- [ ] Navigate away and back
- [ ] Data should load from cache (instant)
- [ ] After 60 seconds, data becomes stale
- [ ] Background refetch happens on next visit

### Refetch on Error
- [ ] Trigger error state (stop API)
- [ ] Click "Retry" button
- [ ] Query should refetch
- [ ] DevTools shows query in "fetching" state
- [ ] On success, data displays

### Network Tab
- [ ] Open browser DevTools → Network tab
- [ ] Load dashboard
- [ ] Verify request to `/api/v1/workouts/weekly-summary`
- [ ] Check request headers (Authorization bearer token)
- [ ] Verify response structure matches `ApiResponse<WeeklySession[]>`

---

## Data Flow Testing

### API Integration
- [ ] Verify API endpoint `/api/v1/workouts/weekly-summary` exists
- [ ] Response structure:
  ```json
  {
    "success": true,
    "error": null,
    "data": [
      {
        "session_id": "uuid",
        "workout_date": "2025-01-15",
        "muscle_groups": "Chest, Shoulders, Triceps",
        "created_at": "2025-01-15T10:00:00Z"
      }
    ]
  }
  ```
- [ ] Authentication token is sent in headers
- [ ] RLS (Row Level Security) filters data by user

### Type Safety
- [ ] No TypeScript errors in console
- [ ] All components properly typed
- [ ] API response matches `WeeklySession` interface

---

## Browser Testing

### Browsers to Test
- [ ] Chrome/Chromium (primary)
- [ ] Firefox
- [ ] Safari (if on macOS)
- [ ] Mobile browsers (Chrome/Safari iOS/Android)

### Browser Features
- [ ] Cookies work (authentication persists)
- [ ] Local storage accessible
- [ ] No console errors
- [ ] No console warnings (except expected ones)

---

## Performance Testing

### Load Time
- [ ] Initial page load < 2 seconds
- [ ] Time to Interactive < 3 seconds
- [ ] Skeleton shows immediately (< 100ms)

### Network
- [ ] Check Network tab for unnecessary requests
- [ ] Verify only one request to weekly-summary endpoint
- [ ] No duplicate requests (TanStack Query deduplication)

### Bundle Size
- [ ] Run `npm run build` in webapp
- [ ] Check build output for bundle sizes
- [ ] Main bundle should be reasonable (< 500kb)

---

## Edge Cases

### No Data Scenarios
- [ ] New user with no workouts
- [ ] User with workouts, but none this week
- [ ] User with many workouts (10+)

### Error Scenarios
- [ ] API server down
- [ ] Network timeout
- [ ] Invalid API response
- [ ] 401 Unauthorized (expired token)
- [ ] 500 Internal Server Error

### Data Scenarios
- [ ] Long exercise names (truncation works)
- [ ] Many exercises in one session
- [ ] Sessions on consecutive days
- [ ] Very old session dates
- [ ] Future session dates (edge case)

---

## Accessibility Testing

### Keyboard Navigation
- [ ] Tab through all interactive elements
- [ ] Tab order is logical (top to bottom)
- [ ] Focus indicators visible
- [ ] Enter/Space activates buttons

### Screen Reader
- [ ] Header has semantic `<header>` tag
- [ ] Main content in `<main>` tag
- [ ] Headings hierarchy (h1 → h2)
- [ ] Calendar button has `aria-label="View calendar"`
- [ ] Icons have `aria-hidden="true"`

### Color Contrast
- [ ] Text on dark background is readable
- [ ] Button text has sufficient contrast
- [ ] Focus indicators are visible

---

## Final Checks

### Code Quality
- [ ] No console.log statements in production code
- [ ] No unused imports
- [ ] No TypeScript `any` types
- [ ] All components have proper prop types
- [ ] Consistent code formatting

### Documentation
- [ ] All steps in homescreen_plan.md marked complete
- [ ] CLAUDE.md updated with new components
- [ ] Comments added for complex logic

### Git
- [ ] All files committed
- [ ] Meaningful commit messages
- [ ] No .env files in git

---

## Known Issues / Future Improvements

Document any issues found during testing:

### Issues
- [ ] List any bugs or issues discovered

### Future Enhancements
- [ ] Navigation to session details (onClick handlers)
- [ ] Create workout flow
- [ ] View full history page
- [ ] Calendar view
- [ ] Pull-to-refresh
- [ ] Optimistic updates
- [ ] Error boundaries
- [ ] Loading states for navigation

---

## Testing Summary

**Date Tested**: ___________
**Tested By**: ___________
**Environment**: Development / Staging / Production
**Result**: ☐ Pass  ☐ Pass with Issues  ☐ Fail

**Notes**: