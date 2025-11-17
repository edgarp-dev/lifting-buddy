export function EmptyState() {
    return (
        <div className="text-center py-12">
            <p className="text-[var(--text-secondary)] text-lg">
                No workouts completed this week yet.
            </p>
            <p className="text-[var(--text-secondary)] text-sm mt-2">
                Start a new workout to see it here!
            </p>
        </div>
    );
}
