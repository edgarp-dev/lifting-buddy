'use client';

import { DumbbellIcon, UserIcon } from "./icons";

interface HeaderProps {
    userName?: string; // Optional for future use
}

export function Header({ userName }: HeaderProps) {
    return (
        <header
            className="border-b"
            style={{
                backgroundColor: "var(--background-secondary)",
                borderBottomColor: "var(--border-subtle)",
            }}
        >
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <DumbbellIcon />
                        <h1
                            className="text-xl font-bold"
                            style={{ color: "var(--text-primary)" }}
                        >
                            Lifting Buddy
                        </h1>
                    </div>
                    <div className="flex items-center">
                        <button
                            className="p-2 rounded-full transition-colors"
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
                            aria-label="User profile"
                        >
                            <UserIcon />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
