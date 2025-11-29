"use client";

import { useState } from "react";
import { MuscleGroupSelector } from "./MuscleGroupSelector";
import { ExerciseNameInput } from "./ExerciseNameInput";
import { ExerciseDefinition, WorkoutSet } from "@/types";
import { SetsManager } from "./SetsManager";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";

export function AddExerciseForm() {
	const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>("");
	const [exerciseName, setExerciseName] = useState<string>("");
	const [selectedExercise, setSelectedExercise] =
		useState<ExerciseDefinition | null>(null);
	const [sets, setSets] = useState<WorkoutSet[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [errorMessage, setErrorMessage] = useState<string>("");
	const router = useRouter();

	const validateForm = (): { isValid: boolean; errorMessage: string } => {
		if (!selectedExercise) {
			return { isValid: false, errorMessage: "Please select an exercise." };
		}

		if (sets.length === 0) {
			return { isValid: false, errorMessage: "Please add at least one set." };
		}

		for (const set of sets) {
			if (!set.reps || set.reps <= 0) {
				return {
					isValid: false,
					errorMessage: `Set ${set.set}: Please enter valid reps`,
				};
			}

			if (!set.weight_kg || set.weight_kg <= 0) {
				return {
					isValid: false,
					errorMessage: `Set ${set.set}: Please enter valid weight`,
				};
			}
		}

		return { isValid: true, errorMessage: "" };
	};

	const handleSubmit = async () => {
		setErrorMessage("");

		const validation = validateForm();
		if (!validation.isValid) {
			setErrorMessage(validation.errorMessage);
			return;
		}

		setIsLoading(true);

		try {
			await api.logWorkoutExercise(selectedExercise!.id, sets);

			router.push("/dashboard");
		} catch (error) {
			const errorMessageLog =
				error instanceof Error ? error.message : "Failed to log exercise.";
			setErrorMessage(errorMessageLog);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<main className="container mx-auto px-4 py-8 max-w-2xl">
			<MuscleGroupSelector
				selected={selectedMuscleGroup}
				onSelect={setSelectedMuscleGroup}
				disabled={isLoading}
			/>
			<div className="mt-6">
				<ExerciseNameInput
					value={exerciseName}
					onChange={setExerciseName}
					onSelectExercise={setSelectedExercise}
					muscleGroup={selectedMuscleGroup}
					disabled={isLoading || !selectedMuscleGroup}
				/>
			</div>
			{selectedExercise && (
				<SetsManager sets={sets} onSetsChange={setSets} disabled={isLoading} />
			)}
			{errorMessage && (
				<div className="mt-4 p-4 bg-[var(--accent-error)] text-white rounded-lg">
					{errorMessage}
				</div>
			)}
			<div className="mt-6">
				<Button
					onClick={handleSubmit}
					isLoading={isLoading}
					className="w-full"
					disabled={isLoading}
				>
					Log Exercise
				</Button>
			</div>
		</main>
	);
}
