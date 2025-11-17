# CLAUDE.md - Webapp Component

This file provides guidance to Claude Code when working with the webapp (Next.js frontend) portion of the Lifting Buddy application.

## Overview

The webapp is a Next.js 15.5.5 application using React 19, TypeScript, and Tailwind CSS 4. It implements a dark-themed fitness tracking interface with Supabase authentication.

## Project Structure

```
webapp/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── auth/login/        # Authentication pages
│   │   │   └── page.tsx       # Login page
│   │   ├── api/               # API routes
│   │   │   └── auth/logout/   # Logout endpoint
│   │   ├── layout.tsx         # Root layout with fonts
│   │   ├── page.tsx           # Home/landing page
│   │   └── globals.css        # Global styles & CSS variables
│   ├── components/            # React components
│   │   ├── ui/                # Reusable UI components
│   │   │   ├── Button.tsx     # Button component with variants
│   │   │   └── Input.tsx      # Form input with label & error
│   │   ├── LoginForm.tsx      # Login form with validation
│   │   └── LogoutButton.tsx   # Logout button
│   ├── lib/                   # Utilities & API clients
│   │   ├── supabase/          # Supabase client utilities
│   │   │   ├── client.ts      # Browser-side client
│   │   │   ├── server.ts      # Server-side client
│   │   │   └── middleware.ts  # Auth middleware
│   │   ├── api.ts             # API client for backend
│   │   └── utils.ts           # Helper functions
│   ├── types/
│   │   └── index.ts           # TypeScript type definitions
│   └── middleware.ts          # Next.js middleware (route protection)
├── package.json               # Dependencies
└── tsconfig.json              # TypeScript config
```

## Design System

### Color Palette

The application uses a dark theme with a carefully curated color palette defined in `globals.css`:

#### Background Colors
- `--background-primary: #1a1d29` - Main background (dark blue-gray)
- `--background-secondary: #252937` - Cards and elevated surfaces
- `--background-tertiary: #2d3142` - Inputs and tertiary surfaces

#### Text Colors
- `--text-primary: #ffffff` - Primary text (white)
- `--text-secondary: #9ca3af` - Secondary text (light gray)
- `--text-tertiary: #6b7280` - Disabled/placeholder text (medium gray)

#### Accent Colors
- `--accent-primary: #3b82f6` - Primary actions (blue)
- `--accent-success: #10b981` - Success states (green)
- `--accent-warning: #f59e0b` - Warning states (orange)
- `--accent-error: #ef4444` - Error states (red)

#### Border Colors
- `--border-subtle: #374151` - Subtle borders
- `--border-default: #4b5563` - Default borders

### Using Colors in Components

With Tailwind CSS 4, use CSS variables with arbitrary value syntax:

```tsx
// Background
className="bg-[var(--background-primary)]"

// Text
className="text-[var(--text-primary)]"

// Borders
className="border-[var(--border-default)]"

// Opacity with CSS variables
className="bg-[var(--accent-error)]/10"  // 10% opacity
```

### Typography

The app uses the Geist font family (loaded via Google Fonts):
- **Geist Sans**: Primary font (`--font-geist-sans`)
- **Geist Mono**: Monospace font (`--font-geist-mono`)

## Component Patterns

### UI Components

#### Button Component
Located at: `src/components/ui/Button.tsx`

**Variants:**
- `primary` - Blue accent button for primary actions
- `secondary` - Gray button for secondary actions

**Props:**
- `variant?: "primary" | "secondary"` - Button style
- `isLoading?: boolean` - Shows spinner when true
- Standard HTML button props

**Usage:**
```tsx
<Button type="submit" isLoading={isLoading}>
  Log In
</Button>

<Button variant="secondary" onClick={handleCancel}>
  Cancel
</Button>
```

#### Input Component
Located at: `src/components/ui/Input.tsx`

**Props:**
- `label: string` - Input label text
- `error?: string` - Error message to display
- Standard HTML input props

**Usage:**
```tsx
<Input
  label="Email"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  placeholder="Enter your email"
  required
/>
```

### Form Components

#### LoginForm
Located at: `src/components/LoginForm.tsx`

- Client component (`"use client"`)
- Handles email/password authentication via Supabase
- Manages loading and error states
- Redirects to dashboard on success

## Authentication Flow

### Client-Side Authentication

1. **Browser Client** (`lib/supabase/client.ts`):
   - Used in client components
   - Manages session in cookies via `@supabase/ssr`

2. **Server Client** (`lib/supabase/server.ts`):
   - Used in server components and API routes
   - Reads session from cookies

3. **Middleware** (`middleware.ts`):
   - Validates sessions on protected routes
   - Refreshes expired tokens
   - Redirects unauthenticated users to `/auth/login`

### Protected Routes

Add route protection in `middleware.ts`:

```typescript
const protectedPaths = ['/dashboard', '/workouts'];
```

## API Communication

### API Client
Located at: `src/lib/api.ts`

The API client automatically:
- Injects Supabase JWT tokens in `Authorization` header
- Handles JSON serialization
- Provides type-safe responses

**Usage:**
```typescript
import { apiClient } from '@/lib/api';

const response = await apiClient.post('/workouts', {
  exercise_name: 'Bench Press',
  sets: [{ reps: 10, weight: 135 }]
});

if (response.success) {
  console.log(response.data);
} else {
  console.error(response.error);
}
```

## Development Guidelines

### Creating New Components

1. **UI Components** (`components/ui/`):
   - Pure, reusable components
   - Use CSS variable colors
   - Support className prop for customization
   - Export from component file directly

2. **Feature Components** (`components/`):
   - Business logic components
   - Can use hooks and state
   - May be client or server components

### Styling Guidelines

1. **Always use CSS variables** for colors:
   ```tsx
   // ✅ Good
   className="bg-[var(--background-primary)]"

   // ❌ Bad
   className="bg-gray-900"
   ```

2. **Use Tailwind utility classes** for layout:
   ```tsx
   className="flex items-center justify-between px-4 py-2"
   ```

3. **Component-specific styles** via className composition:
   ```tsx
   const baseStyles = "px-4 py-2 rounded-lg";
   const variantStyles = variant === "primary"
     ? "bg-[var(--accent-primary)]"
     : "bg-[var(--background-secondary)]";
   ```

### Client vs Server Components

**Use Server Components (default) when:**
- Fetching data from Supabase
- No interactivity needed
- SEO is important

**Use Client Components (`"use client"`) when:**
- Using React hooks (useState, useEffect, etc.)
- Event handlers (onClick, onChange)
- Browser APIs (localStorage, window)

### TypeScript Conventions

- Define types in `src/types/index.ts`
- Use interfaces for props
- Extend HTML element types when applicable

```typescript
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}
```

## Common Tasks

### Adding a New Page

1. Create file in `app/` directory (e.g., `app/dashboard/page.tsx`)
2. Export default function component
3. Add to protected routes in `middleware.ts` if needed

### Adding a New API Route

1. Create route handler in `app/api/` directory
2. Use server-side Supabase client for auth
3. Return NextResponse with JSON

### Updating the Color Palette

1. Edit CSS variables in `src/app/globals.css`
2. Update both `:root` and `@theme inline` sections
3. Components using variables will update automatically

## Testing Locally

```bash
# Install dependencies
npm install

# Run development server (with Turbopack)
npm run dev

# Build for production
npm run build

# Run linter
npm run lint
```

## Environment Variables

Required in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Key Dependencies

- **Next.js 15.5.5**: React framework with App Router
- **React 19**: UI library
- **Tailwind CSS 4**: Utility-first CSS framework
- **@supabase/ssr**: Server-side rendering support for Supabase
- **@supabase/supabase-js**: Supabase client library
- **TypeScript 5**: Type safety

## Important Notes

- This project uses **Tailwind CSS 4** (preview), which has different syntax than v3
- The `@theme inline` directive is specific to Tailwind CSS 4
- Always use `--turbopack` flag (it's in package.json scripts)
- Session management is handled via HTTP-only cookies (secure by default)
- All colors should reference CSS variables for consistency and easy theming

## Learning Resources

When implementing new features:
1. Check existing components for patterns
2. Follow the established color system
3. Maintain TypeScript type safety
4. Test both client and server rendering scenarios
5. Ensure authentication works correctly

## Related Documentation

- Main project documentation: `../CLAUDE.md`
- Database schema: `../DATABASE_DOCUMENTATION.md`
- API documentation: `../api/` (Deno backend)
