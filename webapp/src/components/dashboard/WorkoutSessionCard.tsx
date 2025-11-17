"use client";
import { CalendarIcon, ChevronRightIcon, DumbbellIcon } from "../ui/icons";
import { formatWorkoutDate } from "@/lib/utils";

interface WorkoutSessionCardProps {
    sessionId: string;
    exercises: string[];
    date: string;
    onClick?: () => void;
}

export function WorkoutSessionCard({
    sessionId,
    exercises,
    date,
    onClick,
}: WorkoutSessionCardProps) {
    const formattedDate = formatWorkoutDate(date);
    const exerciseText = exercises.join(", ");
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
                    <div className="flex items-center gap-2">
                        <DumbbellIcon
                            size={20}
                            className="text-[var(--accent-primary)]"
                        />
                        <span className="text-[var(--text-primary)] font-medium text-base">
                            {exerciseText}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                        <CalendarIcon
                            size={14}
                            className="text-[var(--text-secondary)]"
                        />
                        <span className="text-[var(--text-secondary)] text-sm">
                            {formattedDate}
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
