import { createClient } from "@/lib/supabase/client";
import {
	ApiResponse,
	ExerciseDefinition,
	WeeklySession,
	WorkoutSet,
	WorkoutSessionsResponse,
	WorkoutSessionDetail,
	ChatResponse
} from "@/types";

interface ApiRequestOptions extends RequestInit {
	token?: string;
}

class ApiClient {
	private baseUrl: string;

	constructor(baseUrl: string) {
		this.baseUrl = baseUrl;
	}

	async getWeeklySummary() {
		return this.request<ApiResponse<WeeklySession[]>>("/api/v1/workouts/week", {
			method: "GET",
		});
	}

	async searchExercises(query: string) {
		return this.request<ApiResponse<ExerciseDefinition[]>>(
			`/api/v1/search/exercises?q=${encodeURIComponent(query)}`,
			{
				method: "GET",
			}
		);
	}

	async createExerciseDefinition(name: string, muscleGroup: string) {
		return this.request<ApiResponse<ExerciseDefinition>>(
			"/api/v1/workouts/exercise-definition",
			{
				method: "POST",
				body: JSON.stringify({ name, muscle_group: muscleGroup }),
			}
		);
	}

	async logWorkoutExercise(exerciseDefinitionId: string, sets: WorkoutSet[]) {
		const workoutDate = new Date().toLocaleDateString("en-CA");
		return this.request<ApiResponse<{ id: string }>>(
			"/api/v1/workouts/exercise",
			{
				method: "POST",
				body: JSON.stringify({
					exercise_definition_id: exerciseDefinitionId,
					workout_date: workoutDate,
					sets,
				}),
			}
		);
	}

	async getWorkoutSessions(params?: {
		q?: string;
		start_date?: string;
		end_date?: string;
		limit?: number;
		offset?: number;
	}) {
		const queryParams = new URLSearchParams();
		if (params?.q) queryParams.set("q", params.q);
		if (params?.start_date) queryParams.set("start_date", params.start_date);
		if (params?.end_date) queryParams.set("end_date", params.end_date);
		if (params?.limit) queryParams.set("limit", params.limit.toString());
		if (params?.offset) queryParams.set("offset", params.offset.toString());

		const query = queryParams.toString();
		const endpoint = `/api/v1/workouts/sessions${query ? `?${query}` : ""}`;

		return this.request<ApiResponse<WorkoutSessionsResponse>>(endpoint, {
			method: "GET",
		});
	}

	async getWorkoutSessionDetail(sessionId: string) {
		return this.request<ApiResponse<WorkoutSessionDetail>>(
			`/api/v1/workouts/sessions/${sessionId}`,
			{
				method: "GET",
			}
		);
	}

	async sendChatMessage(query: string) {
		return this.request<ChatResponse>(
			"/api/v1/chat",
			{
				method: "POST",
				body: JSON.stringify({ query }),
			}
		)
	}

	private async request<T>(
		endpoint: string,
		options: ApiRequestOptions = {}
	): Promise<T> {
		const { token, ...fetchOptions } = options;

		const authToken = token || (await this.getAuthToken());

		const headers = new Headers(fetchOptions.headers as HeadersInit);
		headers.set("Content-Type", "application/json");

		if (authToken) {
			headers.set("Authorization", `Bearer ${authToken}`);
		}

		const response = await fetch(`${this.baseUrl}${endpoint}`, {
			...fetchOptions,
			headers,
		});

		if (!response.ok) {
			const error = await response.json().catch(() => ({
				message: "An error occurred",
			}));
			throw new Error(error.message || `HTTP ${response.status}`);
		}

		return response.json();
	}

	private async getAuthToken(): Promise<string | null> {
		const supabase = createClient();
		const {
			data: { session },
		} = await supabase.auth.getSession();
		return session?.access_token || null;
	}
}

// Export singleton instance
export const api = new ApiClient(
	process.env.NEXT_PUBLIC_REST_API_URL || "http://localhost:8000"
);
