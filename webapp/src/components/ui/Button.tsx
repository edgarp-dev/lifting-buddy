"use client";

import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary";
    isLoading?: boolean;
}

export function Button({
    children,
    variant = "primary",
    isLoading = false,
    className = "",
    disabled,
    ...props
}: ButtonProps) {
    const baseStyles = `
    px-6
    py-3
    rounded-lg
    font-medium
    transition-all
    disabled:opacity-50
    disabled:cursor-not-allowed
  `;

    const variantStyles = {
        primary: "bg-[var(--accent-primary)] text-white hover:bg-[#2563eb] active:bg-[#1d4ed8]",
        secondary: "bg-[var(--background-secondary)] text-[var(--text-primary)] hover:bg-[var(--background-tertiary)] border border-[var(--border-default)]",
    };

    return (
        <button
            className={`${baseStyles} ${variantStyles[variant]} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading
                ? (
                    <span className="flex items-center justify-center gap-2">
                        <svg
                            className="animate-spin h-5 w-5"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                        </svg>
                        Loading...
                    </span>
                )
                : children}
        </button>
    );
}
