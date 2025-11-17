"use client";

import { InputHTMLAttributes, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
}

export function Input({ label, error, leftIcon, rightIcon, className = "", ...props }: InputProps) {
    return (
        <div className="w-full">
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                {label}
            </label>
            <div className="relative">
                {leftIcon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]">
                        {leftIcon}
                    </div>
                )}
                <input
                    className={`
                        w-full
                        ${leftIcon ? "pl-12" : "pl-4"}
                        ${rightIcon ? "pr-12" : "pr-4"}
                        py-3
                        bg-[var(--input-background)]
                        border
                        border-[var(--input-border)]
                        rounded-lg
                        text-[var(--text-primary)]
                        placeholder:text-[var(--text-tertiary)]
                        focus:ring-2
                        focus:ring-[var(--accent-primary)]
                        focus:border-transparent
                        outline-none
                        transition-all
                        ${error ? "border-[var(--accent-error)]" : ""}
                        ${className}
                    `}
                    {...props}
                />
                {rightIcon && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]">
                        {rightIcon}
                    </div>
                )}
            </div>
            {error && (
                <p className="mt-1 text-sm text-[var(--accent-error)]">
                    {error}
                </p>
            )}
        </div>
    );
}
