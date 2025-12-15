"use client";

import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "../ui/icons";

interface ChatHeaderProps {
    title?: string;
}

export function ChatHeader({ title = "AI Coach" }: ChatHeaderProps) {
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
                <div className="flex items-center justify-center relative">
                    <button
                        onClick={() => router.back()}
                        className="p-2 rounded-full transition-colors absolute left-0"
                        style={{
                            color: "var(--text-secondary)",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor =
                                "var(--background-tertiary)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                                "transparent";
                        }}
                        aria-label="Go back"
                    >
                        <ArrowLeftIcon size={20} />
                    </button>
                    <h1
                        className="text-xl font-bold"
                        style={{ color: "var(--text-primary)" }}
                    >
                        {title}
                    </h1>
                </div>
            </div>
        </header>
    );
}
