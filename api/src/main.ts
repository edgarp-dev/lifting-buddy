import { Application, Router, Status } from "@oak/oak";
import { oakCors } from "@tajpouria/cors";
import { z } from "@zod/zod";
import { ContentGenerator, Embedding, QueryAnalyzer } from "./rag/index.ts";
import { authMiddleware } from "./middleware/auth.ts";

const router = new Router();
router.use(authMiddleware);

router.get("/", (ctx) => {
  ctx.response.body = "Fitness RAG API is running!";
});

// v1
const apiPrefix = "/api/v1";

router.get(`${apiPrefix}/info`, async (ctx) => {
  ctx.response.status = Status.OK;
  ctx.response.body = {
    name: "Lifting Buddy API",
    version: "1.0.1"
  }
});

router.post(`${apiPrefix}/workouts/exercise-definition`, async (ctx) => {
  try {
    const schema = z.object({
      name: z.string().min(1).max(100),
      muscle_group: z.string().max(50),
    });

    const validated = schema.parse(await ctx.request.body.json());

    const { name, muscle_group } = validated;
    const { user, supabase } = ctx.state;

    const startTime = Date.now();
    console.log(`[POST /workouts/exercise-definition] Success`, {
      userId: user.id,
      duration: Date.now() - startTime,
    });

    const { data: exerciseDefinition, error } = await supabase
      .from("workout_exercise_definition")
      .select("id, name, muscle_group, created_at, updated_at")
      .ilike("name", name)
      .limit(1)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!exerciseDefinition) {
      const excerciseDefinitionTextForEmbedding = `${name}. Muscle group: ${
        muscle_group || "N/A"
      }.`;
      const excerciseDefinitionEmbedding = await new Embedding().create(
        excerciseDefinitionTextForEmbedding,
      );
      const { data: newExerciseDefinition, error: createError } = await supabase
        .from("workout_exercise_definition").insert({
          user_id: user.id,
          name,
          muscle_group,
          embedding: excerciseDefinitionEmbedding,
        }).select("id, name, muscle_group, created_at, updated_at").single();

      if (createError) {
        throw createError;
      }

      ctx.response.status = Status.OK;
      ctx.response.body = returnSuccessResponseBody(newExerciseDefinition);
      return;
    } else {
      ctx.response.status = Status.OK;
      ctx.response.body = returnSuccessResponseBody(exerciseDefinition);
      return;
    }
  } catch (error) {
    console.error(
      "Error handling /api/v1/workouts/exercise/definition request:",
      error,
    );
    const errorName = (error as Error).name;
    const errorMessage = (error as Error).message || "Internal server error";

    if (error instanceof z.ZodError || errorName === "BadRequestError") {
      ctx.response.status = Status.BadRequest;
      ctx.response.body = returnErrorResponseBody(errorMessage);
    } else {
      ctx.response.status = Status.InternalServerError;
      ctx.response.body = returnErrorResponseBody(errorMessage);
    }
  }
});

router.post(`${apiPrefix}/workouts/exercise`, async (ctx) => {
  const startTime = Date.now();

  try {
    const WorkoutSetSchema = z.object({
      set: z.union([
        z.string().regex(/^\d+$/).transform(Number),
        z.number().int().positive(),
      ]),
      reps: z.union([
        z.string().regex(/^\d+$/).transform(Number),
        z.number().int().positive(),
      ]),
      weight_kg: z.union([
        z.string().regex(/^\d+\.?\d*$/).transform(Number),
        z.number().nonnegative(),
      ]),
    }).transform((data) => ({
      set_number: typeof data.set === "number" ? data.set : Number(data.set),
      reps: typeof data.reps === "number" ? data.reps : Number(data.reps),
      weight_kg: typeof data.weight_kg === "number"
        ? data.weight_kg
        : Number(data.weight_kg),
    }));

    const CreateWorkoutExerciseSchema = z.object({
      exercise_definition_id: z.uuidv4(
        "Invalid exercise definition ID format",
      ),
      sets: z.array(WorkoutSetSchema)
        .min(1, "At least one set is required")
        .max(20, "Maximum 20 sets allowed per exercise")
        .refine(
          (sets) => {
            const setNumbers = sets.map((s) => s.set_number);
            return new Set(setNumbers).size === setNumbers.length;
          },
          "Set numbers must be unique",
        ),
    });

    const validated = CreateWorkoutExerciseSchema.parse(
      await ctx.request.body.json(),
    );
    const { exercise_definition_id, sets } = validated;
    const { user, supabase } = ctx.state;
    const today = new Date().toISOString().split("T")[0];

    const { data: exerciseDefinition, error: exerciseError } = await supabase
      .from("workout_exercise_definition")
      .select("id, name, muscle_group")
      .eq("id", exercise_definition_id)
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .maybeSingle();

    if (exerciseError) {
      throw exerciseError;
    }

    if (!exerciseDefinition) {
      ctx.response.status = Status.NotFound;
      ctx.response.body = returnErrorResponseBody(
        "Exercise definition not found",
      );
      return;
    }

    let { data: session, error: sessionFindError } = await supabase
      .from("workout_session")
      .select("id, workout_date")
      .eq("user_id", user.id)
      .eq("workout_date", today)
      .is("deleted_at", null)
      .maybeSingle();

    if (sessionFindError) {
      throw sessionFindError;
    }
    if (!session) {
      console.log(`Creating new session for ${today}`);
      const { data: newSession, error: sessionCreateError } = await supabase
        .from("workout_session")
        .insert({
          user_id: user.id,
          workout_date: today,
        })
        .select("id, workout_date")
        .single();

      if (sessionCreateError) {
        // Handle race condition
        if (sessionCreateError.code === "23505") {
          const { data: raced } = await supabase
            .from("workout_session")
            .select("id, workout_date")
            .eq("user_id", user.id)
            .eq("workout_date", today)
            .is("deleted_at", null)
            .single();
          session = raced;
        } else {
          throw sessionCreateError;
        }
      } else {
        session = newSession;
      }
    }

    const { data: lastExercise } = await supabase
      .from("workout_session_exercise")
      .select("exercise_order")
      .eq("session_id", session.id)
      .is("deleted_at", null)
      .order("exercise_order", { ascending: false })
      .limit(1)
      .maybeSingle();

    const exerciseOrder = lastExercise ? lastExercise.exercise_order + 1 : 1;

    const { data: sessionExercise, error: sessionExerciseError } =
      await supabase
        .from("workout_session_exercise")
        .insert({
          user_id: user.id,
          session_id: session.id,
          exercise_definition_id: exercise_definition_id,
          exercise_order: exerciseOrder,
        })
        .select("id")
        .single();

    if (sessionExerciseError) {
      throw sessionExerciseError;
    }

    const setsWithEmbeddings = await Promise.all(
      sets.map(async (set) => {
        const embeddingText =
          `${exerciseDefinition.name}: ${set.reps} reps at ${set.weight_kg}kg`;
        const embedding = await new Embedding().create(embeddingText);

        return {
          user_id: user.id,
          session_exercise_id: sessionExercise.id,
          set_number: set.set_number,
          reps: set.reps,
          weight_kg: set.weight_kg,
          embedding,
        };
      }),
    );

    const { data: createdSets, error: setsError } = await supabase
      .from("workout_set")
      .insert(setsWithEmbeddings)
      .select("id, set_number, reps, weight_kg");

    if (setsError) {
      throw setsError;
    }

    console.log(`[POST /workouts/exercise] Success`, {
      userId: user.id,
      sessionId: session.id,
      exerciseName: exerciseDefinition.name,
      setsCount: createdSets.length,
      duration: Date.now() - startTime,
    });

    ctx.response.status = Status.Created;
    ctx.response.body = returnSuccessResponseBody({
      id: sessionExercise.id,
    });
  } catch (error) {
    console.error(`[POST /workouts/exercise] Error:`, {
      error: (error as Error).message,
      stack: (error as Error).stack,
      userId: ctx.state.user?.id,
      duration: Date.now() - startTime,
    });

    const errorName = (error as Error).name;
    const errorMessage = (error as Error).message || "Internal server error";

    if (error instanceof z.ZodError || errorName === "ZodError") {
      ctx.response.status = Status.BadRequest;
      ctx.response.body = returnErrorResponseBody(
        `Validation error: ${errorMessage}`,
      );
    } else {
      ctx.response.status = Status.InternalServerError;
      ctx.response.body = returnErrorResponseBody(errorMessage);
    }
  }
});

router.get(`${apiPrefix}/workouts/sessions`, async (ctx) => {
  const startTime = Date.now();
  try {
    const SessionsQuerySchema = z.object({
      q: z.string().optional(),
      start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      limit: z.string().transform(Number).pipe(
        z.number().int().nonnegative().max(100),
      ).optional().default(20),
      offset: z.string().transform(Number).pipe(
        z.number().int().nonnegative(),
      ).optional().default(0),
    });

    const { url } = ctx.request;
    const queryParams = {
      q: url.searchParams.get("q") || undefined,
      start_date: url.searchParams.get("start_date") || undefined,
      end_date: url.searchParams.get("end_date") || undefined,
      limit: url.searchParams.get("limit") || undefined,
      offset: url.searchParams.get("offset") || undefined,
    };

    const validate = SessionsQuerySchema.parse(queryParams);
    const { q, start_date, end_date, limit, offset } = validate;
    console.log(
      `[GET /workouts/sessions] Fetching sessions with params:`,
      { q, start_date, end_date, limit, offset },
    );

    const { user, supabase } = ctx.state;
    const query = supabase.from("workout_session")
      .select(`
          id,
          workout_date,
          created_at,
          workout_session_exercise (
            id,
            exercise_definition_id,
            workout_exercise_definition (
              name,
              muscle_group
            ),
            workout_set (
              id,
              reps,
              weight_kg
            )
          )
        `)
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .order("workout_date", { ascending: false })
      .range(offset, offset + limit - 1);

    if (start_date) {
      query.gte("workout_date", start_date);
    }

    if (end_date) {
      query.lte("workout_date", end_date);
    }

    const { data: sessions, error } = await query;

    if (error) {
      throw error;
    }

    let filteredSessions = sessions;
    if (q && q.trim()) {
      filteredSessions = sessions.filter((session: any) => {
        const exercises = session.workout_session_exercise || [];
        return exercises.some((ex: any) => {
          const name = ex.workout_exercise_definition?.name || "";
          const muscleGroup = ex.workout_exercise_definition?.muscle_group || "";
          const searchLower = q.toLowerCase();
          return (
            name.toLowerCase().includes(searchLower) ||
            muscleGroup.toLowerCase().includes(searchLower)
          );
        });
      });
    }

    const sessionsExtendedData = filteredSessions.map(
      (session: Record<string, any>) => {
        const exercises = session.workout_session_exercise || [];
        const allSets = exercises.flatMap((ex: Record<string, any>) =>
          ex.workout_set || []
        );
        const muscleGroups = [
          ...new Set(
            exercises
              .map((ex: Record<string, any>) =>
                ex.workout_exercise_definition?.muscle_group
              )
              .filter(Boolean),
          ),
        ];

        return {
          id: session.id,
          workout_date: session.workout_date,
          created_at: session.created_at,
          exercise_count: exercises.length,
          total_sets: allSets.length,
          total_volume_kg: allSets.reduce(
            (sum: any, set: any) => sum + (set.reps * set.weight_kg),
            0,
          ),
          muscle_groups: muscleGroups.join(", "),
        };
      },
    );
    ctx.response.status = Status.OK;
    ctx.response.body = returnSuccessResponseBody({
      sessions: sessionsExtendedData,
      pagination: { limit, offset, count: sessionsExtendedData.length },
    });
  } catch (error) {
    console.error(`[GET /workouts/sessions] Error:`, {
      error: (error as Error).message,
      stack: (error as Error).stack,
      userId: ctx.state.user?.id,
      duration: Date.now() - startTime,
    });

    const errorMessage = (error as Error).message || "Internal server error";

    if (error instanceof z.ZodError) {
      ctx.response.status = Status.BadRequest;
      ctx.response.body = returnErrorResponseBody(
        `Validation error: ${errorMessage}`,
      );
    } else {
      ctx.response.status = Status.InternalServerError;
      ctx.response.body = returnErrorResponseBody(errorMessage);
    }
  }
});

router.get(`${apiPrefix}/workouts/week`, async (ctx) => {
  const startTime = Date.now();
  try {
    const { user, supabase } = ctx.state;

    const { data: weekWorkouts, error } = await supabase.from(
      "current_week_workout_summary",
    ).select("*");

    if (error) {
      ctx.response.status = Status.InternalServerError;
      ctx.response.body = returnErrorResponseBody(error.message);
      return;
    }

    console.log(
      `[GET /workout/week] Retrieved current week workouts for user ${user.id}`,
      {
        duration: Date.now() - startTime,
      },
    );

    ctx.response.status = Status.OK;
    ctx.response.body = returnSuccessResponseBody(weekWorkouts);
  } catch (error) {
    console.error(`[GET /workout/week] Error:`, {
      error: (error as Error).message,
      stack: (error as Error).stack,
      userId: ctx.state.user?.id,
      duration: Date.now() - startTime,
    });

    const errorMessage = (error as Error).message || "Internal server error";

    ctx.response.status = Status.InternalServerError;
    ctx.response.body = returnErrorResponseBody(errorMessage);
  }
});

router.get(`${apiPrefix}/search/exercises`, async (ctx) => {
  const startTime = Date.now();
  try {
    const SearchExercisesQuerySchema = z.object({
      q: z.string().min(1, "Search query is required"),
    });

    const { url } = ctx.request;
    const queryParams = {
      q: url.searchParams.get("q") || "",
    };

    const validatedParams = SearchExercisesQuerySchema.parse(queryParams);
    const { q } = validatedParams;

    const { user, supabase } = ctx.state;
    const { data: exercises, error } = await supabase
      .rpc("search_exercises", {
        query_text: q,
      });

    if (error) {
      throw error;
    }

    console.log(
      `[GET /search/exercises] Searched for for user ${user.id}`,
      {
        duration: Date.now() - startTime,
      },
    );

    ctx.response.status = Status.OK;
    ctx.response.body = returnSuccessResponseBody(exercises);
  } catch (error) {
    console.error("Error handling /search/exercises request:", error);
    const errorMessage = (error as Error).message || "Internal server error";

    if (error instanceof z.ZodError) {
      ctx.response.status = Status.BadRequest;
      ctx.response.body = returnErrorResponseBody(
        `Validation error: ${errorMessage}`,
      );
    } else {
      ctx.response.status = Status.InternalServerError;
      ctx.response.body = returnErrorResponseBody(errorMessage);
    }
  }
});

router.get(`${apiPrefix}/workouts/sessions/:session_id`, async (ctx) => {
  try {
    const SessionIdParamsSchema = z.object({
      session_id: z.uuidv4("Invalid session ID format"),
    });

    const params = {
      session_id: ctx.params.session_id || "",
    };

    const validatedParams = SessionIdParamsSchema.parse(params);

    const { user, supabase } = ctx.state;
    const { session_id } = validatedParams;

    const { data: sessionData, error: sessionError } = await supabase
      .from(
        "workout_session",
      )
      .select("id, workout_date, created_at")
      .eq("id", session_id)
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .single();

    if (sessionError) {
      throw sessionError;
    }

    if (!sessionData) {
      ctx.response.status = Status.NotFound;
      ctx.response.body = returnErrorResponseBody("Session not found");
      return;
    }

    const { data: exercisesData, error: exercisesError } = await supabase
      .from("workout_session_exercise")
      .select(`
        id,
        exercise_order,
        exercise_definition_id,
        workout_exercise_definition (
          name,
          muscle_group
        ),
        workout_set (
          id,
          set_number,
          reps,
          weight_kg
        )
      `)
      .eq("session_id", session_id)
      .is("deleted_at", null)
      .order("exercise_order", { ascending: true });

    if (exercisesError) {
      throw exercisesError;
    }

    console.log(
      `[GET /workouts/sessions/:session_id] Retrieved session ${session_id} for user ${user.id}`,
    );

    const exercises = exercisesData?.map((exercise: any) => ({
      id: exercise.id,
      exercise_definition_id: exercise.exercise_definition_id,
      name: exercise.workout_exercise_definition?.name || "",
      muscle_group: exercise.workout_exercise_definition?.muscle_group || "",
      order: exercise.exercise_order,
      sets: (exercise.workout_set || [])
        .filter((set: any) => set.id)
        .sort((a: any, b: any) => a.set_number - b.set_number)
        .map((set: any) => ({
          id: set.id,
          set_number: set.set_number,
          reps: set.reps,
          weight_kg: set.weight_kg,
        })),
    })) || [];

    ctx.response.status = 200;
    ctx.response.body = returnSuccessResponseBody({
      id: sessionData.id,
      workout_date: sessionData.workout_date,
      created_at: sessionData.created_at,
      exercises: exercises,
    });
  } catch (error) {
    console.error("Error handling /workouts/sessions/:session_id:", error);
    const errorMessage = (error as Error).message || "Internal server error";

    if (error instanceof z.ZodError) {
      ctx.response.status = Status.BadRequest;
      ctx.response.body = returnErrorResponseBody(
        `Validation error: ${errorMessage}`,
      );
    } else {
      ctx.response.status = Status.InternalServerError;
      ctx.response.body = returnErrorResponseBody(errorMessage);
    }
  }
});

router.post(`${apiPrefix}/chat`, async (ctx) => {
  try {
    const { query } = await ctx.request.body.json();

    if (!query) {
      ctx.response.status = Status.BadRequest;
      ctx.response.body = { error: "Query is required" };
      return;
    }

    const { supabase } = ctx.state;
    const queryAnalyzer = new QueryAnalyzer();
    const dateRange = await queryAnalyzer.extractDateRange(query);
    let documents: any[] = [];

    console.log(`Processing query: "${query}"`);

    if (dateRange) {
      const { start_date, end_date } = dateRange;
      console.log(`Date query detected. Range: ${start_date} to ${end_date}`);

      const { data, error: rpcError } = await supabase.rpc(
        "get_workouts_by_date_range",
        {
          start_date,
          end_date,
        },
      );

      if (rpcError) throw rpcError;

      documents = data || [];
    } else {
      console.log(`Creating embedding for query: "${query}"`);
      const queryEmbedding = await new Embedding().create(query);

      console.log("Searching for relevant workouts in Supabase...");

      const { data, error: rpcError } = await supabase.rpc(
        "match_workouts",
        {
          query_embedding: queryEmbedding,
          match_threshold: 0.5,
          match_count: 5,
        },
      );

      if (rpcError) throw rpcError;

      documents = data || [];
    }

    console.log(`Found ${documents.length} relevant documents.`);

    const contextText = documents.map((doc: any) => {
      return `On ${
        new Date(doc.workout_date).toLocaleDateString()
      }, you did ${doc.exercise_name} for ${doc.reps} reps at ${doc.weight_kg}kg.`;
    }).join("\n---\n");

    const prompt = `
            You are a very enthusiastic fitness assistant who helps users understand their workout data.
            Based on the context provided below, please answer the user's question.
            The current date is ${new Date().toLocaleDateString("en-CA")}.
            If the context is empty or does not contain the answer, say "I couldn't find any data for that, please try asking another question.".
            Do not make up information that is not in the context.

            Context:
            ---
            ${contextText}
            ---

            Question: "${query}"

            Answer:
        `;

    const contentGenerator = new ContentGenerator();
    const answer = await contentGenerator.generate(prompt);

    ctx.response.status = Status.OK;
    ctx.response.body = { answer };
  } catch (error) {
    console.error("Error handling /chat request:", error);
    ctx.response.status = Status.InternalServerError;
    ctx.response.body = { error: (error as Error).message };
  }
});

function returnErrorResponseBody(
  errorMessage: string,
): { success: boolean; error: string; data: null } {
  return {
    success: false,
    error: errorMessage,
    data: null,
  };
}

function returnSuccessResponseBody(
  data: any,
): { success: boolean; error: null; data: any } {
  return {
    success: true,
    error: null,
    data,
  };
}

const app = new Application();
app.use(oakCors({
  origin: "*",
  credentials: true,
}));
app.use(router.routes());
app.use(router.allowedMethods());

const port = 8000;
console.log(`Server running on port ${port}`);
await app.listen({ port });
