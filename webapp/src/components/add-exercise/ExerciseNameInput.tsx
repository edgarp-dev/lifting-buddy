"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/Input";
import { ExerciseDefinition } from "@/types";

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

    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (value.length < 2) {
            setResults([]);
            setIsOpen(false);
            return;
        }

        const timer = setTimeout(() => {
            console.log('Searching for:', value);
        }, 300);

        return () => clearTimeout(timer);
    }, [value]);

    return (
        <div ref={containerRef} className="relative">
            <Input
                label="Exercise Name"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Search for an exercise..."
                disabled={disabled}
            />
        </div>
    );
}
