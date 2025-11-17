'use client';

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "./ui/Button";

interface LogoutButtonProps {
    className?: string;
    variant?: 'primary' | 'secondary';
}

export function LogoutButton({ className = '', variant = 'secondary' }: LogoutButtonProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    async function handleLogout() {
        setIsLoading(true);

        try {
            const supabase = createClient();
            await supabase.auth.signOut();

            router.push('/auth/login');
            router.refresh();
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Button
            onClick={handleLogout}
            isLoading={isLoading}
            variant={variant}
            className={className}
        >
            Sign Out
        </Button>
    )
}
