"use client";
import { XIcon } from "../ui/icons";
import { SessionFilters } from "@/types";
import { useState } from "react";

interface FilterModalProps {
	isOpen: boolean;
	onClose: () => void;
	onApply: (filters: SessionFilters) => void;
	currentFilters: SessionFilters;
}

export function FilterModal({
	isOpen,
	onClose,
	onApply,
	currentFilters,
}: FilterModalProps) {
	const [startDate, setStartDate] = useState(currentFilters.startDate || "");
	const [endDate, setEndDate] = useState(currentFilters.endDate || "");
	const [muscleGroup, setMuscleGroup] = useState(
		currentFilters.muscleGroup || ""
	);

	if (!isOpen) return null;

	const handleApply = () => {
		onApply({
			startDate: startDate || undefined,
			endDate: endDate || undefined,
			muscleGroup: muscleGroup || undefined,
		});
		onClose();
	};

	const handleClear = () => {
		setStartDate("");
		setEndDate("");
		setMuscleGroup("");
		onApply({});
		onClose();
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			<div className="absolute inset-0 bg-black/70" onClick={onClose} />
			<div className="relative bg-[var(--background-secondary)] rounded-xl p-6 w-full max-w-md mx-4 border border-[var(--border-subtle)]">
				<div className="flex items-center justify-between mb-6">
					<h2 className="text-xl font-semibold text-[var(--text-primary)]">
						Filter Workouts
					</h2>
					<button
						onClick={onClose}
						className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
					>
						<XIcon size={24} />
					</button>
				</div>
				<div className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
							Start Date
						</label>
						<input
							type="date"
							value={startDate}
							onChange={(e) => setStartDate(e.target.value)}
							className="w-full px-4 py-2 bg-[var(--input-background)] border border-[var(--input-border)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--input-focus-ring)]"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
							End Date
						</label>
						<input
							type="date"
							value={endDate}
							onChange={(e) => setEndDate(e.target.value)}
							className="w-full px-4 py-2 bg-[var(--input-background)] border border-[var(--input-border)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--input-focus-ring)]"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
							Muscle Group
						</label>
						<input
							type="text"
							value={muscleGroup}
							onChange={(e) => setMuscleGroup(e.target.value)}
							placeholder="e.g., Chest, Back, Legs"
							className="w-full px-4 py-2 bg-[var(--input-background)] border border-[var(--input-border)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--input-focus-ring)]"
						/>
					</div>
				</div>
				<div className="flex gap-3 mt-6">
					<button
						onClick={handleClear}
						className="flex-1 px-4 py-3 bg-[var(--background-tertiary)] text-[var(--text-primary)] rounded-lg font-medium hover:bg-[var(--border-default)] transition-colors"
					>
						Clear All
					</button>
					<button
						onClick={handleApply}
						className="flex-1 px-4 py-3 bg-[var(--accent-primary)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
					>
						Apply Filters
					</button>
				</div>
			</div>
		</div>
	);
}
