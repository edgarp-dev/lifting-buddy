interface GreetingSectionProps {
    username: string;
}

export function GreetingSection({ username }: GreetingSectionProps) {
    return (
        <div className="mb-8">
            <h1 className="text-4xl font-bold text-[var(--text-primary)]">
                Hello, {username}!
            </h1>
        </div>
    );
}
