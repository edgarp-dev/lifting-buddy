"use client";

import { useState } from "react";
import { WorkoutExerciseDetail } from "@/types";
import { ChevronDownIcon } from "@/components/ui/icons";
import { ExerciseSetRow } from "./ExerciseSetRow";

interface ExerciseDetailCardProps {
    exercise: WorkoutExerciseDetail;
}

export function ExerciseDetailCard({ exercise }: ExerciseDetailCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div className="bg-[var(--background-secondary)] border border-[var(--border-subtle)] rounded-lg overflow-hidden">
            <button
                onClick={toggleExpanded}
                className="w-full p-4 flex items-center justify-between hover:bg-[var(--background-tertiary)] transition-colors"
            >
                <div className="text-left">
                    <h3 className="text-[var(--text-primary)] font-semibold">
                        {exercise.name}
                    </h3>
                    <p className="text-[var(--text-secondary)] text-sm mt-1">
                        {exercise.sets.length} sets / {exercise.muscle_group}
                    </p>
                </div>
                <ChevronDownIcon
                    className={`text-[var(--text-secondary)] transition-transform ${isExpanded ? "rotate-180" : ""}`}
                />
            </button>
            {isExpanded && (
                <div className="px-4 pb-4 pt-2">
                    <div className="flex items-center justify-between mb-2 text-sm text-[var(--text-secondary)] border-b border-[var(--border-subtle)] pb-2">
                        <div className="flex gap-8">
                            <span className="min-w-[60px]">Set</span>
                            <span className="min-w-[40px]">Reps</span>
                        </div>
                        <span>Weight</span>
                    </div>
                    <div>
                        {exercise.sets.map((set) => (
                            <ExerciseSetRow key={set.id} set={set} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}