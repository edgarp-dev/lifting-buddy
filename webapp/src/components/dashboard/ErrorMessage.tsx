interface ErrorMessageProps {
    message: string;
    onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
    return (
        <div className="text-center py-8">
            <p className="text-[var(--text-secondary)] mb-4">
                {message || " Failed to load workout sessions."}
            </p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="
                px-4 py-2
                bg-[var(--accent-primary)]
                text-white
                rounded-lg
                hover:opacity-90
                transition-opacity"
                >
                    Retry
                </button>
            )}
        </div>
    );
}
