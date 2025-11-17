import { AddExerciseHeader } from "@/components/add-exercise/AddExerciseHeader";

export default async function AddExercisePage() {
    return (
        <div className="bg-[var(--background-primary)] min-h-screen">
            <AddExerciseHeader />
            <h1 className="text-[var(--text-primary)]">Add Exercise</h1>
        </div>
    );
}
