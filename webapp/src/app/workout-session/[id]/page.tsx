"use client";

import { useParams } from "next/navigation";
import { useWorkoutSessionDetail } from "@/hooks/useWorkoutSessionDetail";
import { SessionDetailHeader } from "@/components/workout-session/SessionDetailHeader";
import { ExerciseDetailCard } from "@/components/workout-session/ExerciseDetailCard";
import { ExerciseDetailCount } from "@/components/workout-session/ExerciseDetailCount";
import { LoadingSkeleton } from "@/components/dashboard/LoadingSkeleton";
import { ErrorMessage } from "@/components/dashboard/ErrorMessage";

export default function WorkoutSessionPage() {
    const params = useParams();
    const sessionId = params.id as string;

    const { data: response, isLoading, isError, error, refetch } = useWorkoutSessionDetail(sessionId);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[var(--background-primary)]">
                <SessionDetailHeader />
                <div className="max-w-2xl mx-auto px-6 py-6">
                    <LoadingSkeleton />
                </div>
            </div>
        );
    }

    if (isError || !response?.data) {
        return (
            <div className="min-h-screen bg-[var(--background-primary)]">
                <SessionDetailHeader />
                <div className="max-w-2xl mx-auto px-6 py-6">
                    <ErrorMessage
                        message={error?.message || "Failed to load workout session"}
                        onRetry={refetch}
                    />
                </div>
            </div>
        );
    }

    const data = response.data;

    const formattedDate = new Date(data.workout_date).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <div className="min-h-screen bg-[var(--background-primary)]">
            <SessionDetailHeader />
            <div className="max-w-2xl mx-auto px-6 py-6">
                <p className="text-sm text-[var(--text-secondary)] mb-6">
                    {formattedDate}
                </p>
                <div className="mb-6">
                    <ExerciseDetailCount count={data.exercises.length} />
                </div>
                <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
                    Exercises Performed
                </h2>
                <div className="space-y-3">
                    {data.exercises.map((exercise) => (
                        <ExerciseDetailCard key={exercise.id} exercise={exercise} />
                    ))}
                </div>
            </div>
        </div>
    );
}