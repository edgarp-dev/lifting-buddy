"use client";

import { useState } from "react";
import { MuscleGroupSelector } from "./MuscleGroupSelector";
import { ExerciseNameInput } from "./ExerciseNameInput";
import { ExerciseDefinition } from "@/types";

export function AddExerciseForm() {
	const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>("");
	const [exerciseName, setExerciseName] = useState<string>("");
	const [selectedExercise, setSelectedExercise] =
		useState<ExerciseDefinition | null>(null);

	return (
		<main className="container mx-auto px-4 py-8 max-w-2xl">
			<MuscleGroupSelector
				selected={selectedMuscleGroup}
				onSelect={setSelectedMuscleGroup}
			/>
			<div className="mt-6">
				<ExerciseNameInput
					value={exerciseName}
					onChange={setExerciseName}
					onSelectExercise={setSelectedExercise}
					muscleGroup={selectedMuscleGroup}
				/>
			</div>
			{selectedExercise && (
				<p className="text-[var(--text-primary)] mt-4">
					Selected Exercise: {selectedExercise.name} (
					{selectedExercise.muscle_group})
				</p>
			)}
		</main>
	);
}
