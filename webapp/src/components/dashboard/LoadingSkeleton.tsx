export function LoadingSkeleton() {
    return (
        <div className="space-y-4">
            {[1, 2, 3].map((i) => (
                <div
                    key={i}
                    className="
            p-4 
            rounded-lg 
            bg-[var(--background-secondary)] 
            border border-[var(--border-subtle)]
            animate-pulse
          "
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                            <div className="w-5 h-5 bg-[var(--background-tertiary)] rounded" />
                            <div className="h-4 bg-[var(--background-tertiary)] rounded w-48" />
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="h-4 bg-[var(--background-tertiary)] rounded w-24" />
                            <div className="w-5 h-5 bg-[var(--background-tertiary)] rounded" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
