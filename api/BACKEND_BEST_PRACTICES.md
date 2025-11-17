# Backend API Best Practices - Quick Reference

## Issues in Original Code & Fixes

### ❌ **Issue #1: Incorrect Supabase SELECT Syntax**
```typescript
// ❌ Wrong
.select("id", "name", "muscle_group")

// ✅ Correct
.select("id, name, muscle_group")
// or
.select("*")
```

---

### ❌ **Issue #2: Race Condition (Check-Then-Insert)**
```typescript
// ❌ Wrong: Race condition possible
const existing = await db.select().where(...)
// if (!existing) {
  await db.insert(...) // Another request might have inserted between check and insert
}

// ✅ Correct: Use upsert (atomic operation)
await db.upsert({...}, { onConflict: "user_id,name" })
```

---

### ❌ **Issue #3: No Input Validation**
```typescript
// ❌ Wrong: Trust user input
const { name, muscle_group } = await ctx.request.body.json();

// ✅ Correct: Validate with Zod
const schema = z.object({
  name: z.string().min(1).max(100),
  muscle_group: z.string().max(50).optional()
});
const validated = schema.parse(body);
```

---

### ❌ **Issue #4: Inconsistent Error Handling**
```typescript
// ❌ Wrong: Generic error message
ctx.response.body = { error: "Internal server error" };

// ✅ Correct: Specific error codes
const ErrorCodes = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  DATABASE_ERROR: "DATABASE_ERROR",
  // ...
};
ctx.response.body = {
  success: false,
  error: {
    code: ErrorCodes.VALIDATION_ERROR,
    message: "Invalid input",
    details: validationErrors
  }
};
```

---

### ❌ **Issue #5: Wrong HTTP Status for Get-or-Create**
```typescript
// ❌ Wrong: 201 Created for existing resource
if (!exerciseDefinition) {
  // create...
  ctx.response.status = 201; // ✅ OK for new
} else {
  ctx.response.status = 200; // ✅ OK for existing
}

// ✅ Better: Use 200 for idempotent operations
ctx.response.status = 200; // Same response regardless
```

---

### ❌ **Issue #6: Non-RESTful Endpoint Naming**
```typescript
// ❌ Wrong: Nested, action-oriented
POST /api/v1/workouts/exercise/definition

// ✅ Correct: Resource-oriented
POST /api/v1/exercises
GET /api/v1/exercises
GET /api/v1/exercises/:id
PUT /api/v1/exercises/:id
DELETE /api/v1/exercises/:id
```

---

### ❌ **Issue #7: Business Logic in Route Handler**
```typescript
// ❌ Wrong: All logic in route
router.post("/exercises", async (ctx) => {
  const body = await ctx.request.body.json();
  const embedding = await generateEmbedding(...);
  const result = await db.insert(...);
  ctx.response.body = result;
});

// ✅ Correct: Service layer
class ExerciseService {
  async createExercise(input) {
    // All business logic here
  }
}

router.post("/exercises", async (ctx) => {
  const validated = validate(body);
  const result = await exerciseService.createExercise(validated);
  ctx.response.body = result;
});
```

---

### ❌ **Issue #8: No Request Logging**
```typescript
// ❌ Wrong: Only log errors
catch (error) {
  console.error("Error:", error);
}

// ✅ Correct: Log all requests with timing
const startTime = Date.now();
try {
  // handle request
  console.log(`[POST /exercises] Success`, {
    userId: user.id,
    duration: Date.now() - startTime
  });
} catch (error) {
  console.error(`[POST /exercises] Error`, {
    error: error.message,
    userId: user.id,
    duration: Date.now() - startTime
  });
}
```

---

### ❌ **Issue #9: No Type Safety**
```typescript
// ❌ Wrong: Any types
async function createExercise(ctx: any) {
  const body: any = await ctx.request.body.json();
}

// ✅ Correct: Strong types
interface CreateExerciseInput {
  name: string;
  muscle_group?: string;
}

interface ExerciseDefinition {
  id: string;
  name: string;
  muscle_group: string | null;
  created_at: string;
}

async function createExercise(
  input: CreateExerciseInput
): Promise<ExerciseDefinition> {
  // ...
}
```

---

### ❌ **Issue #10: Hardcoded Status Codes**
```typescript
// ❌ Wrong: Magic numbers
ctx.response.status = 201;
ctx.response.status = 500;

// ✅ Correct: Named constants
import { Status } from "oak";
ctx.response.status = Status.Created; // 201
ctx.response.status = Status.InternalServerError; // 500
```

---

## Best Practices Checklist

### ✅ **1. Input Validation**
- [ ] Use validation library (Zod, Joi, Yup)
- [ ] Validate all user inputs
- [ ] Sanitize strings (trim whitespace)
- [ ] Validate UUIDs, emails, dates
- [ ] Set reasonable limits (max length, etc.)

### ✅ **2. Error Handling**
- [ ] Define error codes as constants
- [ ] Return consistent error format
- [ ] Use appropriate HTTP status codes
- [ ] Don't expose internal errors to clients
- [ ] Log errors with context

### ✅ **3. HTTP Status Codes**
```typescript
200 OK              // Success (GET, PUT, DELETE)
201 Created         // Resource created (POST)
204 No Content      // Success with no body (DELETE)
400 Bad Request     // Validation error
401 Unauthorized    // Not authenticated
403 Forbidden       // Not authorized
404 Not Found       // Resource not found
409 Conflict        // Duplicate resource
422 Unprocessable   // Validation failed
500 Server Error    // Internal error
```

### ✅ **4. RESTful Design**
```typescript
// Resources (nouns, not verbs)
GET    /api/v1/exercises          // List
POST   /api/v1/exercises          // Create
GET    /api/v1/exercises/:id      // Get one
PUT    /api/v1/exercises/:id      // Update
DELETE /api/v1/exercises/:id      // Delete

// Nested resources
GET    /api/v1/sessions/:id/exercises
POST   /api/v1/sessions/:id/exercises

// Actions (when necessary)
POST   /api/v1/sessions/:id/copy
POST   /api/v1/auth/logout
```

### ✅ **5. Response Format**
```typescript
// Success
{
  "success": true,
  "data": { /* resource */ },
  "error": null
}

// Error
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": { /* validation errors */ }
  }
}

// List
{
  "success": true,
  "data": {
    "items": [...],
    "total": 100,
    "limit": 20,
    "offset": 0
  },
  "error": null
}
```

### ✅ **6. Logging**
```typescript
// Log all requests
console.log(`[${method}] ${path}`, {
  userId: user?.id,
  params: ctx.params,
  query: Object.fromEntries(url.searchParams),
  duration: Date.now() - startTime,
  status: ctx.response.status
});

// Log errors with context
console.error(`[${method}] ${path} Error`, {
  error: error.message,
  stack: error.stack,
  userId: user?.id,
  body: requestBody,
  duration: Date.now() - startTime
});
```

### ✅ **7. Database Operations**
```typescript
// Use transactions for multi-step operations
await supabase.rpc('begin');
try {
  await step1();
  await step2();
  await supabase.rpc('commit');
} catch (error) {
  await supabase.rpc('rollback');
  throw error;
}

// Use upsert for idempotent operations
await db.upsert(data, { onConflict: 'unique_column' });

// Always filter soft-deleted records
.is('deleted_at', null)

// Use maybeSingle() when expecting 0 or 1 result
.maybeSingle() // Returns null if not found, no error
```

### ✅ **8. Security**
```typescript
// Always check authentication
if (!ctx.state.user) {
  return unauthorized();
}

// Use RLS (Row Level Security) in database
// Queries automatically filtered by user_id

// Validate UUIDs before queries
if (!isValidUUID(id)) {
  return badRequest("Invalid ID");
}

// Rate limiting
const limiter = new RateLimiter({
  windowMs: 60000,
  max: 100
});

// CORS configuration
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
```

### ✅ **9. Code Organization**
```
api/
├── src/
│   ├── routes/
│   │   ├── exercises.ts
│   │   ├── sessions.ts
│   │   └── analytics.ts
│   ├── services/
│   │   ├── exercise.service.ts
│   │   ├── session.service.ts
│   │   └── embedding.service.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── validation.ts
│   │   └── errorHandler.ts
│   ├── types/
│   │   ├── exercise.types.ts
│   │   └── api.types.ts
│   ├── utils/
│   │   ├── validation.ts
│   │   └── response.ts
│   └── main.ts
```

### ✅ **10. Performance**
```typescript
// Use indexes
CREATE INDEX idx_exercise_user ON exercises(user_id);

// Limit query results
.limit(100)

// Use select() to only fetch needed columns
.select('id, name, created_at')

// Cache expensive operations
const cache = new Map();
if (cache.has(key)) return cache.get(key);

// Use pagination
.range(offset, offset + limit - 1)
```

---

## Quick Fixes for Your Code

### Fix 1: Update SELECT syntax
```diff
- .select("id", "name", "muscle_group", "created_at", "updated_at")
+ .select("id, name, muscle_group, created_at, updated_at")
```

### Fix 2: Add validation
```diff
+ import { z } from "zod";
+
+ const schema = z.object({
+   name: z.string().min(1).max(100).trim(),
+   muscle_group: z.string().max(50).trim().optional()
+ });

  const { name, muscle_group } = await ctx.request.body.json();
+ const validated = schema.parse({ name, muscle_group });
```

### Fix 3: Use upsert instead of check-then-insert
```diff
- const existing = await supabase.from("...").select("...").single();
- if (!existing) {
-   await supabase.from("...").insert(...);
- }

+ const { data } = await supabase
+   .from("workout_exercise_definition")
+   .upsert({ user_id, name, muscle_group, embedding })
+   .select()
+   .single();
```

### Fix 4: Better error handling
```diff
  } catch (error) {
-   console.error("Error:", error);
-   ctx.response.status = Status.InternalServerError;
-   ctx.response.body = returnErrorResponseBody("Internal server error");
+   console.error(`[POST /exercises] Error:`, {
+     error: error.message,
+     stack: error.stack,
+     userId: user?.id
+   });
+
+   if (error.code === "23505") {
+     ctx.response.status = Status.Conflict;
+     ctx.response.body = returnErrorResponseBody("DUPLICATE_EXERCISE", "Exercise already exists");
+   } else {
+     ctx.response.status = Status.InternalServerError;
+     ctx.response.body = returnErrorResponseBody("INTERNAL_ERROR", "Server error");
+   }
  }
```

### Fix 5: Extract service layer
```typescript
// New file: services/exercise.service.ts
export class ExerciseService {
  async getOrCreateExercise(userId: string, input: CreateExerciseInput) {
    // All business logic here
  }
}

// In route handler:
const service = new ExerciseService(supabase, embeddingService);
const exercise = await service.getOrCreateExercise(user.id, validated);
```

---

## Testing Checklist

- [ ] Unit tests for services
- [ ] Integration tests for endpoints
- [ ] Test validation errors
- [ ] Test authentication
- [ ] Test edge cases (empty strings, null values)
- [ ] Test concurrent requests (race conditions)
- [ ] Load testing
- [ ] Security testing

---

## Monitoring

```typescript
// Add request ID for tracing
const requestId = crypto.randomUUID();
console.log(`[${requestId}] ${method} ${path} started`);

// Track metrics
metrics.increment('api.requests.total');
metrics.timing('api.requests.duration', duration);
metrics.increment(`api.requests.status.${statusCode}`);

// Health check endpoint
router.get('/health', (ctx) => {
  ctx.response.body = {
    status: 'ok',
    timestamp: new Date().toISOString()
  };
});
```

---

**See [improved-endpoint-example.ts](api/src/improved-endpoint-example.ts) for complete working code!**
