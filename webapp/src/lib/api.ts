import { createClient } from "@/lib/supabase/client";
import {
	ApiResponse,
	ExerciseDefinition,
	WeeklySession,
	WorkoutSet,
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
		return this.request<ApiResponse<{ id: string }>>(
			"/api/v1/workouts/exercise",
			{
				method: "POST",
				body: JSON.stringify({
					exercise_definition_id: exerciseDefinitionId,
					sets,
				}),
			}
		);
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
	process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
);
