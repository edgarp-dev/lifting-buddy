interface ExerciseDetailCountProps {
    count: number;
}

export function ExerciseDetailCount({ count }: ExerciseDetailCountProps) {
    return (
        <div className="bg-[var(--background-secondary)] border border-[var(--border-subtle)] rounded-lg p-4">
            <p className="text-sm text-[var(--text-secondary)] mb-1">
                Exercises
            </p>
            <p className="text-2xl font-bold text-[var(--text-primary)]">
                {count}
            </p>
        </div>
    );
}
