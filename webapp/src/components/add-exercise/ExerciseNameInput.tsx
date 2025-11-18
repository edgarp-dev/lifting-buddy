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
                const response = await api.searchExercises(value);

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
