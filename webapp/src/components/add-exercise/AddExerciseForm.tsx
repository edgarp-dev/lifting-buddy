"use client";

import { useState } from "react";
import { MuscleGroupSelector } from "./MuscleGroupSelector";

export function AddExerciseForm() {
    const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>("");

    return (
        <main className="container mx-auto px-4 py-8 max-w-2xl">
            <MuscleGroupSelector
                selected={selectedMuscleGroup}
                onSelect={setSelectedMuscleGroup}
            />
            {/* Debug output - we can remove this later */}
            {selectedMuscleGroup && (
                <p className="text-[var(--text-primary)] mt-4">
                    Selected: {selectedMuscleGroup}
                </p>
            )}
        </main>
    );
}
