import { AddExerciseHeader } from "@/components/add-exercise/AddExerciseHeader";
import { AddExerciseForm } from "@/components/add-exercise/AddExerciseForm";

export default async function AddExercisePage() {
    return (
        <div className="bg-[var(--background-primary)] min-h-screen">
            <AddExerciseHeader />
            <AddExerciseForm />
        </div>
    );
}
