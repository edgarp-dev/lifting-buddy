import { Suspense } from "react";
import { LoginForm } from "@/components/LoginForm";

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--background-primary)] px-4">
            <Suspense>
                <LoginForm />
            </Suspense>
        </div>
    );
}
