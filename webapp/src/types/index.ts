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
