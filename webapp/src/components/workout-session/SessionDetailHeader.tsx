"use client";

import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "@/components/ui/icons";

export function SessionDetailHeader() {
    const router = useRouter();

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
                            onClick={() => router.back()}
                            className="p-2 rounded-lg text-[var(--text-primary)] hover:bg-[var(--background-tertiary)]"
                            aria-label="Go back"
                        >
                            <ArrowLeftIcon size={20} />
                        </button>
                    </div>
                    <h1
                        className="text-xl font-semibold text-center"
                        style={{ color: "var(--text-primary)" }}
                    >
                        Workout Details
                    </h1>
                    <div></div>
                </div>
            </div>
        </header>
    );
}