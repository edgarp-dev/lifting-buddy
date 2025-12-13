import { WorkoutSetDetail } from "@/types";

interface ExerciseSetRowProps {
    set: WorkoutSetDetail;
}

export function ExerciseSetRow({ set }: ExerciseSetRowProps) {
    return (
        <div className="flex items-center justify-between py-2 border-b border-[var(--border-subtle)] last:border-0">
            <div className="flex gap-8">
                <span className="text-[var(--text-secondary)] min-w-[60px]">
                    Set {set.set_number}
                </span>
                <span className="text-[var(--text-primary)] min-w-[40px]">
                    {set.reps}
                </span>
            </div>
            <span className="text-[var(--text-primary)] font-semibold">
                {set.weight_kg} kg
            </span>
        </div>
    );
}