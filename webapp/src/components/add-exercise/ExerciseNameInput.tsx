"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/Input";
import { ExerciseDefinition } from "@/types";
import { api } from "@/lib/api";

interface ExerciseNameInputProps {
	value: string;
	onChange: (value: string) => void;
	onSelectExercise: (exercise: ExerciseDefinition) => void;
	muscleGroup: string;
	disabled?: boolean;
}

export function ExerciseNameInput({
	value,
	onChange,
	onSelectExercise,
	muscleGroup,
	disabled = false,
}: ExerciseNameInputProps) {
	const [results, setResults] = useState<ExerciseDefinition[]>([]);
	const [isSearching, setIsSearching] = useState(false);
	const [isOpen, setIsOpen] = useState(false);
	const [isCreating, setIsCreating] = useState(false);

	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (value.length < 2) {
			setResults([]);
			setIsOpen(false);
			return;
		}

		const timer = setTimeout(async () => {
			try {
				setIsSearching(true);
				const response = await api.searchExercises(value, muscleGroup);

				if (response.success && response.data) {
					setResults(response.data);
					setIsOpen(true);
				}
			} catch (error) {
				console.error("Search failed:", error);
				setResults([]);
			} finally {
				setIsSearching(false);
			}
		}, 300);

		return () => clearTimeout(timer);
	}, [value, muscleGroup]);

	useEffect(() => {
		function handleClickOutised(event: MouseEvent) {
			if (
				containerRef.current &&
				!containerRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		}

		document.addEventListener("mousedown", handleClickOutised);
		return () => {
			document.removeEventListener("mousedown", handleClickOutised);
		};
	}, []);

	async function handleCreateExercise() {
		if (!value.trim() || !muscleGroup) return;

		try {
			setIsCreating(true);
			const response = await api.createExerciseDefinition(
				value.trim(),
				muscleGroup
			);

			if (response.success && response.data) {
				onSelectExercise(response.data);
				onChange(response.data.name);
				setIsOpen(false);
			}
		} catch (error) {
			console.error("Create exercise failed:", error);
		} finally {
			setIsCreating(false);
		}
	}

	return (
		<div ref={containerRef} className="relative">
			<Input
				label="Exercise Name"
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder="Search for an exercise..."
				disabled={disabled}
			/>
			{isOpen && (
				<div className="absolute z-10 mt-1 w-full rounded-lg border border-[var(--border-default)] bg-[var(--background-secondary)] shadow-lg">
					{isSearching ? (
						<div className="px-4 py-3 text-[var(--text-secondary)]">
							Searching...
						</div>
					) : (
						<>
							{results.length > 0 ? (
								<ul className="max-h-60 overflow-y-auto py-1">
									{results.map((exercise) => (
										<li
											key={exercise.id}
											onClick={() => {
												onSelectExercise(exercise);
												onChange(exercise.name);
												setIsOpen(false);
											}}
											className="cursor-pointer px-4 py-2 hover:bg-[var(--background-tertiary)]"
										>
											<span className="font-medium text-[var(--text-primary)]">
												{exercise.name}
											</span>
											<span className="ml-2 text-sm text-[var(--text-secondary)]">
												{exercise.muscle_group}
											</span>
										</li>
									))}
								</ul>
							) : (
								<p className="px-4 py-3 text-[var(--text-secondary)]">
									No exercises found
								</p>
							)}
							<div className="px-4 py-3 border-t border-[var(--border-default)]">
								<button
									onClick={handleCreateExercise}
									disabled={isCreating || !muscleGroup}
									className="w-full px-4 py-2 rounded-lg bg-[var(--accent-primary)] text-white font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{isCreating ? "Creating..." : `Create "${value}"`}
								</button>
								{!muscleGroup && (
									<p className="text-[var(--accent-warning)] text-sm mt-2">
										Select a muscle group first
									</p>
								)}
							</div>
						</>
					)}
				</div>
			)}
		</div>
	);
}
