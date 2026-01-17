export function formatWorkoutDate(date: string): string {
    const [year, month, day] = date.split('-').map(Number);
    const d = new Date(year, month - 1, day);

    return d.toLocaleDateString("en-US", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}
