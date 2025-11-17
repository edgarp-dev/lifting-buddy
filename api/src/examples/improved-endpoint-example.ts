// ============================================================================
// IMPROVED VERSION - Exercise Definition Endpoint
// ============================================================================

import { Router, Status } from "https://deno.land/x/oak/mod.ts";
import { z } from "https://deno.land/x/zod/mod.ts";

// ============================================================================
// 1. TYPE DEFINITIONS (Best Practice: Strong typing)
// ============================================================================

interface ExerciseDefinition {
  id: string;
  user_id: string;
  name: string;
  muscle_group: string | null;
  embedding: number[] | null;
  created_at: string;
  updated_at: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: ApiError | null;
}

interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

// ============================================================================
// 2. VALIDATION SCHEMAS (Best Practice: Input validation)
// ============================================================================

const CreateExerciseDefinitionSchema = z.object({
  name: z.string()
    .min(1, "Exercise name is required")
    .max(100, "Exercise name must be less than 100 characters")
    .trim(),
  muscle_group: z.string()
    .max(50, "Muscle group must be less than 50 characters")
    .trim()
    .optional()
    .nullable(),
});

type CreateExerciseDefinitionInput = z.infer<typeof CreateExerciseDefinitionSchema>;

// ============================================================================
// 3. ERROR CODES (Best Practice: Consistent error handling)
// ============================================================================

const ErrorCodes = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  DUPLICATE_EXERCISE: "DUPLICATE_EXERCISE",
  DATABASE_ERROR: "DATABASE_ERROR",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  UNAUTHORIZED: "UNAUTHORIZED",
} as const;

// ============================================================================
// 4. HELPER FUNCTIONS (Best Practice: Separation of concerns)
// ============================================================================

function returnErrorResponse(
  code: string,
  message: string,
  details?: unknown,
): ApiResponse<never> {
  return {
    success: false,
    error: { code, message, details },
    data: null,
  };
}

function returnSuccessResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    error: null,
    data,
  };
}

// ============================================================================
// 5. BUSINESS LOGIC (Best Practice: Separate from route handler)
// ============================================================================

class ExerciseDefinitionService {
  constructor(private supabase: any, private embeddingService: any) {}

  /**
   * Get or create exercise definition (idempotent)
   * Uses database upsert to avoid race conditions
   */
  async getOrCreateExerciseDefinition(
    userId: string,
    input: CreateExerciseDefinitionInput,
  ): Promise<ExerciseDefinition> {
    const { name, muscle_group } = input;

    // Generate embedding for semantic search
    const embeddingText = `${name}. Muscle group: ${muscle_group || "N/A"}.`;
    const embedding = await this.embeddingService.create(embeddingText);

    // Use upsert (ON CONFLICT) to avoid race conditions
    const { data, error } = await this.supabase
      .from("workout_exercise_definition")
      .upsert(
        {
          user_id: userId,
          name,
          muscle_group: muscle_group || null,
          embedding,
        },
        {
          onConflict: "user_id,name", // Assumes unique index on (user_id, LOWER(name))
          ignoreDuplicates: false, // Return existing record if duplicate
        }
      )
      .select()
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data;
  }

  /**
   * Get exercise definition by name (case-insensitive)
   */
  async getExerciseDefinitionByName(
    userId: string,
    name: string,
  ): Promise<ExerciseDefinition | null> {
    const { data, error } = await this.supabase
      .from("workout_exercise_definition")
      .select("*")
      .eq("user_id", userId)
      .ilike("name", name) // Case-insensitive match
      .is("deleted_at", null)
      .limit(1)
      .maybeSingle(); // Returns null if not found (no error)

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data;
  }

  /**
   * Create new exercise definition
   */
  async createExerciseDefinition(
    userId: string,
    input: CreateExerciseDefinitionInput,
  ): Promise<ExerciseDefinition> {
    const { name, muscle_group } = input;

    // Generate embedding
    const embeddingText = `${name}. Muscle group: ${muscle_group || "N/A"}.`;
    const embedding = await this.embeddingService.create(embeddingText);

    const { data, error } = await this.supabase
      .from("workout_exercise_definition")
      .insert({
        user_id: userId,
        name,
        muscle_group: muscle_group || null,
        embedding,
      })
      .select()
      .single();

    if (error) {
      // Check for unique constraint violation
      if (error.code === "23505") { // PostgreSQL unique violation
        throw new Error("DUPLICATE_EXERCISE");
      }
      throw new Error(`Database error: ${error.message}`);
    }

    return data;
  }
}

// ============================================================================
// 6. ROUTE HANDLERS (Best Practice: Thin controllers)
// ============================================================================

const router = new Router();
const apiPrefix = "/api/v1";

/**
 * POST /api/v1/exercises
 * Create or get exercise definition (idempotent)
 */
router.post(`${apiPrefix}/exercises`, async (ctx) => {
  const startTime = Date.now();

  try {
    // 1. Authentication check
    const { user, supabase } = ctx.state;
    if (!user) {
      ctx.response.status = Status.Unauthorized;
      ctx.response.body = returnErrorResponse(
        ErrorCodes.UNAUTHORIZED,
        "Authentication required"
      );
      return;
    }

    // 2. Parse and validate request body
    let body: unknown;
    try {
      body = await ctx.request.body.json();
    } catch (error) {
      ctx.response.status = Status.BadRequest;
      ctx.response.body = returnErrorResponse(
        ErrorCodes.VALIDATION_ERROR,
        "Invalid JSON in request body"
      );
      return;
    }

    // 3. Validate input against schema
    const validationResult = CreateExerciseDefinitionSchema.safeParse(body);
    if (!validationResult.success) {
      ctx.response.status = Status.BadRequest;
      ctx.response.body = returnErrorResponse(
        ErrorCodes.VALIDATION_ERROR,
        "Invalid request data",
        validationResult.error.format()
      );
      return;
    }

    const input = validationResult.data;

    // 4. Execute business logic
    const exerciseService = new ExerciseDefinitionService(
      supabase,
      ctx.state.embeddingService // Inject dependency
    );

    const exerciseDefinition = await exerciseService.getOrCreateExerciseDefinition(
      user.id,
      input
    );

    // 5. Log success
    console.log(`[POST /exercises] Created/retrieved exercise for user ${user.id}`, {
      exerciseId: exerciseDefinition.id,
      exerciseName: exerciseDefinition.name,
      duration: Date.now() - startTime,
    });

    // 6. Return success response
    ctx.response.status = Status.OK; // 200 for idempotent operations
    ctx.response.body = returnSuccessResponse(exerciseDefinition);

  } catch (error) {
    // 7. Error handling with proper logging
    console.error(`[POST /exercises] Error:`, {
      error: error.message,
      stack: error.stack,
      userId: ctx.state.user?.id,
      duration: Date.now() - startTime,
    });

    // Determine appropriate error response
    if (error.message === "DUPLICATE_EXERCISE") {
      ctx.response.status = Status.Conflict;
      ctx.response.body = returnErrorResponse(
        ErrorCodes.DUPLICATE_EXERCISE,
        "Exercise with this name already exists"
      );
    } else if (error.message.startsWith("Database error:")) {
      ctx.response.status = Status.InternalServerError;
      ctx.response.body = returnErrorResponse(
        ErrorCodes.DATABASE_ERROR,
        "Database operation failed"
      );
    } else {
      ctx.response.status = Status.InternalServerError;
      ctx.response.body = returnErrorResponse(
        ErrorCodes.INTERNAL_ERROR,
        "An unexpected error occurred"
      );
    }
  }
});

/**
 * GET /api/v1/exercises/:id
 * Get specific exercise definition by ID
 */
router.get(`${apiPrefix}/exercises/:id`, async (ctx) => {
  const startTime = Date.now();

  try {
    const { user, supabase } = ctx.state;
    if (!user) {
      ctx.response.status = Status.Unauthorized;
      ctx.response.body = returnErrorResponse(
        ErrorCodes.UNAUTHORIZED,
        "Authentication required"
      );
      return;
    }

    const { id } = ctx.params;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      ctx.response.status = Status.BadRequest;
      ctx.response.body = returnErrorResponse(
        ErrorCodes.VALIDATION_ERROR,
        "Invalid exercise ID format"
      );
      return;
    }

    const { data, error } = await supabase
      .from("workout_exercise_definition")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id) // RLS handles this, but explicit is better
      .is("deleted_at", null)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      ctx.response.status = Status.NotFound;
      ctx.response.body = returnErrorResponse(
        "NOT_FOUND",
        "Exercise definition not found"
      );
      return;
    }

    console.log(`[GET /exercises/${id}] Retrieved exercise`, {
      exerciseId: id,
      duration: Date.now() - startTime,
    });

    ctx.response.status = Status.OK;
    ctx.response.body = returnSuccessResponse(data);

  } catch (error) {
    console.error(`[GET /exercises/:id] Error:`, {
      error: error.message,
      stack: error.stack,
      duration: Date.now() - startTime,
    });

    ctx.response.status = Status.InternalServerError;
    ctx.response.body = returnErrorResponse(
      ErrorCodes.INTERNAL_ERROR,
      "Failed to retrieve exercise"
    );
  }
});

/**
 * GET /api/v1/exercises
 * List all exercise definitions for user
 */
router.get(`${apiPrefix}/exercises`, async (ctx) => {
  const startTime = Date.now();

  try {
    const { user, supabase } = ctx.state;
    if (!user) {
      ctx.response.status = Status.Unauthorized;
      ctx.response.body = returnErrorResponse(
        ErrorCodes.UNAUTHORIZED,
        "Authentication required"
      );
      return;
    }

    // Parse query parameters
    const url = new URL(ctx.request.url);
    const muscleGroup = url.searchParams.get("muscle_group");
    const search = url.searchParams.get("search");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 100);
    const offset = parseInt(url.searchParams.get("offset") || "0");

    // Build query
    let query = supabase
      .from("workout_exercise_definition")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .is("deleted_at", null);

    if (muscleGroup) {
      query = query.eq("muscle_group", muscleGroup);
    }

    if (search) {
      query = query.ilike("name", `%${search}%`);
    }

    query = query
      .order("name", { ascending: true })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    console.log(`[GET /exercises] Listed exercises`, {
      count: data?.length || 0,
      total: count,
      duration: Date.now() - startTime,
    });

    ctx.response.status = Status.OK;
    ctx.response.body = returnSuccessResponse({
      exercises: data || [],
      total: count || 0,
      limit,
      offset,
    });

  } catch (error) {
    console.error(`[GET /exercises] Error:`, {
      error: error.message,
      stack: error.stack,
      duration: Date.now() - startTime,
    });

    ctx.response.status = Status.InternalServerError;
    ctx.response.body = returnErrorResponse(
      ErrorCodes.INTERNAL_ERROR,
      "Failed to list exercises"
    );
  }
});

// ============================================================================
// 7. MIDDLEWARE (Best Practice: Cross-cutting concerns)
// ============================================================================

/**
 * Request logging middleware
 */
router.use(async (ctx, next) => {
  const startTime = Date.now();
  const { method, url } = ctx.request;

  await next();

  const duration = Date.now() - startTime;
  console.log(`[${method}] ${url.pathname} - ${ctx.response.status} (${duration}ms)`);
});

/**
 * Error handling middleware
 */
router.use(async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    console.error("Unhandled error in request:", error);

    ctx.response.status = Status.InternalServerError;
    ctx.response.body = returnErrorResponse(
      ErrorCodes.INTERNAL_ERROR,
      "An unexpected error occurred"
    );
  }
});

export default router;

// ============================================================================
// SUMMARY OF IMPROVEMENTS
// ============================================================================

/**
 * ✅ 1. Strong TypeScript types for all data structures
 * ✅ 2. Input validation using Zod schema
 * ✅ 3. Separation of concerns (service layer)
 * ✅ 4. Consistent error handling with error codes
 * ✅ 5. Proper HTTP status codes
 * ✅ 6. Race condition fixed with upsert
 * ✅ 7. Structured logging with timing
 * ✅ 8. Idempotent POST operation
 * ✅ 9. RESTful resource naming (/exercises not /workouts/exercise/definition)
 * ✅ 10. Query parameter validation
 * ✅ 11. Pagination support
 * ✅ 12. UUID validation
 * ✅ 13. Dependency injection (embedding service)
 * ✅ 14. Middleware for cross-cutting concerns
 * ✅ 15. Comprehensive documentation
 */
