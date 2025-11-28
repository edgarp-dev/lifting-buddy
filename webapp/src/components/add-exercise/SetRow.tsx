"use client";

import { TrashIcon } from "../ui/icons";

interface SetRowProps {
	setNumber: number;
	reps: number;
	weightKg: number;
	onRepsChange: (value: number) => void;
	onWeightChange: (value: number) => void;
	onDelete: () => void;
	disabled?: boolean;
}

export function SetRow({
	setNumber,
	reps,
	weightKg,
	onRepsChange,
	onWeightChange,
	onDelete,
	disabled = false,
}: SetRowProps) {
	return (
		<div className="grid grid-cols-[50px_1fr_1fr_44px] gap-3 items-center">
			<div className="text-center text-[var(--text-primary)] font-medium">
				{setNumber}
			</div>

			<input
				type="number"
				value={reps || ""}
				onChange={(e) => onRepsChange(Number(e.target.value))}
				placeholder="0"
				disabled={disabled}
				min="0"
				className="px-3 py-2 rounded-lg bg-[var(--background-tertiary)] text-[var(--text-primary)] border border-[var(--border-default)] focus:border-[var(--accent-primary)] focus:outline-none disabled:opacity-50"
			/>
			<input
				type="number"
				value={weightKg || ""}
				onChange={(e) => onWeightChange(Number(e.target.value))}
				placeholder="0"
				disabled={disabled}
				min="0"
				step="0.5"
				className="px-3 py-2 rounded-lg bg-[var(--background-tertiary)] text-[var(--text-primary)] border border-[var(--border-default)] focus:border-[var(--accent-primary)] focus:outline-none disabled:opacity-50"
			/>
			<button
				onClick={onDelete}
				disabled={disabled}
				className="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-[var(--background-tertiary)] disabled:opacity-50 transition-colors"
				aria-label="Delete set"
			>
				<TrashIcon size={20} className="text-[var(--accent-error)]" />
			</button>
		</div>
	);
}
