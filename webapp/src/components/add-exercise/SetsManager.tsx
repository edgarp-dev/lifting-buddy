"use client";

import { WorkoutSet } from "@/types";
import { SetRow } from "./SetRow";
import { Button } from "../ui/Button";

interface SetsManagerProps {
	sets: WorkoutSet[];
	onSetsChange: (sets: WorkoutSet[]) => void;
	disabled?: boolean;
}

export function SetsManager({
	sets,
	onSetsChange,
	disabled = false,
}: SetsManagerProps) {
	function handleAddSet() {
		const newSet: WorkoutSet = {
			set: sets.length + 1,
			reps: 0,
			weight_kg: 0,
		};

		onSetsChange([...sets, newSet]);
	}

	function handleCopyPrevious() {
		if (sets.length === 0) return;

		const lastSet = sets[sets.length - 1];
		const newSet: WorkoutSet = {
			set: sets.length + 1,
			reps: lastSet.reps,
			weight_kg: lastSet.weight_kg,
		};

		onSetsChange([...sets, newSet]);
	}

	function handleRepsChange(index: number, reps: number) {
		const newSets = [...sets];
		newSets[index] = { ...newSets[index], reps };

		onSetsChange(newSets);
	}

	function handleWeightChange(index: number, weight_kg: number) {
		const newSets = [...sets];
		newSets[index] = { ...newSets[index], weight_kg };

		onSetsChange(newSets);
	}

	function handleDelete(index: number) {
		const newSets = sets.filter((_, i) => i !== index);
		const renumberedSets = newSets.map((set, i) => ({
			...set,
			set: i + 1,
		}));

		onSetsChange(renumberedSets);
	}

	return (
		<div className="mt-6">
			<h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
				Performance
			</h3>
			<div className="grid grid-cols-[50px_1fr_1fr_44px] gap-3 mb-2 px-1">
				<div className="text-sm font-medium text-[var(--text-secondary)] text-center">
					Set
				</div>
				<div className="text-sm font-medium text-[var(--text-secondary)]">
					Reps
				</div>
				<div className="text-sm font-medium text-[var(--text-secondary)]">
					Weight (kg)
				</div>
				<div className="w-11"></div>
			</div>
			<div className="space-y-2">
				{sets.map(({ set, reps, weight_kg }, index) => (
					<SetRow
						key={index}
						setNumber={set}
						reps={reps}
						weightKg={weight_kg}
						onRepsChange={(value) => handleRepsChange(index, value)}
						onWeightChange={(value) => handleWeightChange(index, value)}
						onDelete={() => handleDelete(index)}
						disabled={disabled}
					/>
				))}
			</div>
			<div className="flex gap-3 mt-4">
				<Button
					onClick={handleAddSet}
					disabled={disabled}
					variant="secondary"
					className="flex-1"
				>
					Add Set
				</Button>
				<Button
					onClick={handleCopyPrevious}
					disabled={disabled || sets.length === 0}
					variant="secondary"
					className="flex-1"
				>
					Copy Previous
				</Button>
			</div>
		</div>
	);
}
