"use client";
import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import { createClient } from "@/lib/supabase/client";

// Icons
function MailIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 4C2.44772 4 2 4.44772 2 5V15C2 15.5523 2.44772 16 3 16H17C17.5523 16 18 15.5523 18 15V5C18 4.44772 17.5523 4 17 4H3Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 5L10 10L18 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    );
}

function LockIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 9V6C5 3.79086 6.79086 2 9 2H11C13.2091 2 15 3.79086 15 6V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 9H17V17C17 17.5523 16.5523 18 16 18H4C3.44772 18 3 17.5523 3 17V9Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    );
}

function EyeIcon({ onClick }: { onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="hover:text-[var(--text-secondary)] transition-colors"
        >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 4C5.58172 4 2.37258 6.96896 1.28961 10C2.37258 13.031 5.58172 16 10 16C14.4183 16 17.6274 13.031 18.7104 10C17.6274 6.96896 14.4183 4 10 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        </button>
    );
}

export function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const supabase = createClient();

            const { data, error: signInError } = await supabase.auth
                .signInWithPassword({
                    email,
                    password,
                });

            if (signInError) {
                throw signInError;
            }

            if (!data.user) {
                throw new Error('No user data returned');
            }

            const redirectTo = searchParams.get('redirect') || '/dashboard';

            router.push(redirectTo);
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
            {error && (
                <div className="
            bg-[var(--accent-error)]/10
            border
            border-[var(--accent-error)]
            text-[var(--accent-error)]
            px-4
            py-3
            rounded-lg
          ">
                    {error}
                </div>
            )}

            <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                leftIcon={<MailIcon />}
            />

            <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                leftIcon={<LockIcon />}
                rightIcon={<EyeIcon onClick={() => setShowPassword(!showPassword)} />}
            />

            <Button
                type="submit"
                isLoading={isLoading}
                className="w-full"
            >
                Log In
            </Button>
        </form>
    );
}
