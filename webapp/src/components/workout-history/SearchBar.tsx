"use client";
import { SearchIcon, XIcon } from "../ui/icons";

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = "Search workouts..." }: SearchBarProps) {
    const handleClear = () => {
        onChange("");
    };

    return (
        <div className="relative">
            <SearchIcon
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
            />
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full pl-12 pr-12 py-3 bg-[var(--background-secondary)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent"
            />
            {value && (
                <button
                    onClick={handleClear}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                    <XIcon size={20} />
                </button>
            )}
        </div>
    );
}
