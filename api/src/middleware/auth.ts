import { createClient, SupabaseClient, User } from "@supabase/supabase-js";
import { Context, Status } from "@oak/oak";

interface AppState {
    user?: User
    supabase?: SupabaseClient
}

export const authMiddleware = async (
    ctx: Context<AppState>,
    next: () => Promise<unknown>
) => {
    try {
        const authHeader = ctx.request.headers.get("Authorization");

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            ctx.response.status = Status.Unauthorized;
            ctx.response.body = { error: "Missing or invalid Authorization header" };
            return;
        }

        const jwt = authHeader.split(" ")[1];

        const serviceClient = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );

        const { data: { user }, error } = await serviceClient.auth.getUser(jwt);

        if (error || !user) {
            console.error("JWT validation error:", error?.message);
            ctx.response.status = Status.Unauthorized;
            ctx.response.body = { error: "Invalid token" };
            return;
        }

        const authenticatedClient = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_ANON_KEY")!,
            {
                global: {
                    headers: { Authorization: `Bearer ${jwt}` }
                }
            }
        );

        ctx.state.user = user;
        ctx.state.supabase = authenticatedClient;

        await next();
    } catch(error) {
        console.error("Authentication middleware error:", (error as Error).message);
        
        ctx.response.status = Status.InternalServerError;
        ctx.response.body = { error: "Internal server error" };
    }
}
