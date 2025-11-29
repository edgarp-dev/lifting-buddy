"use client";
import { CalendarIcon, ChevronRightIcon, DumbbellIcon } from "../ui/icons";
import { WorkoutSession } from "@/types";

interface HistorySessionCardProps {
    session: WorkoutSession;
    onClick?: () => void;
}

export function HistorySessionCard({ session, onClick }: HistorySessionCardProps) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const muscleGroups = session.muscle_groups || "No muscle groups";
    const stats = `${session.exercise_count} exercises • ${session.total_sets} sets • ${Math.round(session.total_volume_kg)}kg`;

    return (
        <div
            onClick={onClick}
            className="
                p-4
                rounded-lg
                bg-[var(--background-secondary)]
                border border-[var(--border-subtle)]
                flex items-center justify-between
                cursor-pointer
                transition-all
                hover:scale-[1.02]
                hover:border-[var(--border-default)]
            "
        >
            <div className="flex items-center gap-3 flex-1">
                <div className="flex flex-col gap-1">
                    {/* Muscle Groups */}
                    <div className="flex items-center gap-2">
                        <DumbbellIcon
                            size={20}
                            className="text-[var(--accent-primary)]"
                        />
                        <span className="text-[var(--text-primary)] font-medium text-base">
                            {muscleGroups}
                        </span>
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-2 mt-2">
                        <CalendarIcon
                            size={14}
                            className="text-[var(--text-secondary)]"
                        />
                        <span className="text-[var(--text-secondary)] text-sm">
                            {formatDate(session.workout_date)}
                        </span>
                    </div>
                </div>
            </div>

            <ChevronRightIcon
                size={20}
                className="text-[var(--text-secondary)] flex-shrink-0"
            />
        </div>
    );
}
