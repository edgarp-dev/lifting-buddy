export interface User {
    id: string;
    email: string;
    created_at: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface AuthResponse {
    email: string;
    token: string;
}

export interface ApiError {
    message: string;
    code?: string;
}

export interface WeeklySession {
    session_id: string;
    workout_date: string;
    created_at: string;
    muscle_groups: string;
}

export interface ApiResponse<T> {
    success: boolean;
    error: string | null;
    data: T | null;
}

export interface ExerciseDefinition {
    id: string;
    name: string;
    muscle_group: string;
    created_at: string;
    updated_at: string;
}

export interface WorkoutSet {
    set: number;
    reps: number;
    weight_kg: number;
}

export interface WorkoutSession {
    id: string;
    workout_date: string;
    created_at: string;
    exercise_count: number;
    total_sets: number;
    total_volume_kg: number;
    muscle_groups: string;
}

export interface WorkoutSessionsResponse {
    sessions: WorkoutSession[];
    pagination: {
        limit: number;
        offset: number;
        count: number;
    };
}

export interface SessionFilters {
    startDate?: string;
    endDate?: string;
    muscleGroup?: string;
}
