export function formatWorkoutDate(date: string): string {
    const d = new Date(date);

    return d.toLocaleDateString("en-US", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}
