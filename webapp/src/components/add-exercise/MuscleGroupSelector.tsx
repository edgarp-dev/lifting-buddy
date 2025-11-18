"use client";

const MUSCLE_GROUPS = [
    "Leg",
    "Chest",
    "Back",
    "Tricep",
    "Bicep",
    "Shoulders",
    "Core",
];

interface MuscleGroupSelectorProps {
    disabled?: boolean;
    onSelect: (muscleGroup: string) => void;
    selected: string;
}

export function MuscleGroupSelector(
    { disabled, onSelect, selected }: MuscleGroupSelectorProps,
) {
    return (
        <div className="mb-6">
            <label className="text-[var(--text-primary)] text-sm mb-3 block font-medium">
                Muscle Group
            </label>
            <div className="overflow-x-auto flex gap-2 pb-2 scrollbar-hide snap-x snap-mandatory -mx-4 px-4">
                {MUSCLE_GROUPS.map((muscleGroup: string) => (
                    <button
                        key={muscleGroup}
                        onClick={() => onSelect(muscleGroup)}
                        disabled={disabled}
                        className={`px-5 py-2.5 rounded-full whitespace-nowrap transition-colors snap-start flex-shrink-0
                            ${
                            selected === muscleGroup
                                ? "bg-[var(--accent-primary)] text-white"
                                : "bg-[var(--background-tertiary)] text-[var(--text-secondary)]"
                        } ${
                            disabled
                                ? "opacity-50 cursor-not-allowed"
                                : "hover:opacity-80 active:scale-95"
                        }`}
                    >
                        {muscleGroup}
                    </button>
                ))}
            </div>
        </div>
    );
}
