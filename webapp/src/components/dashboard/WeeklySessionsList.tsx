'use client';
import { useRouter } from "next/navigation";
import { useWeeklySummary } from "@/hooks/useWeeklySummary";
import { WorkoutSessionCard } from "./WorkoutSessionCard";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { ErrorMessage } from "./ErrorMessage";
import { EmptyState } from "./EmptyState";

export function WeeklySessionsList() {
    const router = useRouter();
    const { data: response, isLoading, isError, error, refetch } = useWeeklySummary();

    if (isLoading) {
        return (
            <section className="mb-8">
                <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
                    This Week&apos;s Completed Sessions
                </h2>
                <LoadingSkeleton />
            </section>
        );
    }

    if (isError) {
        return (
            <section className="mb-8">
                <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
                    This Week&apos;s Completed Sessions
                </h2>
                <ErrorMessage
                    message={error?.message || "Failed to load workouts"}
                    onRetry={() => refetch()}
                />
            </section>
        );
    }

    if (!response?.data || response.data.length === 0) {
        return (
            <section className="mb-8">
                <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
                    This Week&apos;s Completed Sessions
                </h2>
                <EmptyState />
            </section>
        );
    }

    return (
        <section className="mb-8">
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
                This Week&apos;s Completed Sessions
            </h2>
            <div className="space-y-3">
                {response.data?.map(({ session_id, muscle_groups, workout_date }) => (
                    <WorkoutSessionCard
                        key={session_id}
                        sessionId={session_id}
                        exercises={muscle_groups.split(", ")}
                        date={workout_date}
                        onClick={() => {
                            router.push(`/workout-session/${session_id}`);
                        }}
                    />
                ))}
            </div>
        </section>
    );
}
