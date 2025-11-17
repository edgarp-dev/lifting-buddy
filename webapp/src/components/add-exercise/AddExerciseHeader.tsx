"use client";

import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "../ui/icons";

interface AddExerciseHeaderProps {
    disabled?: boolean;
}

export function AddExerciseHeader(
    { disabled = false }: AddExerciseHeaderProps,
) {
    const router = useRouter();

    const handleBack = () => {
        router.push("/dashboard");
    };

    return (
        <header
            className="border-b"
            style={{
                backgroundColor: "var(--background-secondary)",
                borderBottomColor: "var(--border-subtle)",
            }}
        >
            <div className="container mx-auto px-4 py-4">
                <div className="grid grid-cols-3 items-center">
                    <div>
                        <button
                            onClick={handleBack}
                            disabled={disabled}
                            className="p-2 rounded-lg text-[var(--text-primary)] hover:bg-[var(--background-tertiary)] disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Go back"
                        >
                            <ArrowLeftIcon size={20} />
                        </button>
                    </div>
                    <h1
                        className="text-xl font-semibold text-center"
                        style={{ color: "var(--text-primary)" }}
                    >
                        Add Exercise
                    </h1>
                    <div></div>
                </div>
            </div>
        </header>
    );
}
