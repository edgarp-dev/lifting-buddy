"use client";
import { RobotIcon } from "../ui/icons";
import { useRouter } from "next/navigation";

export function DashboardActions() {
	const router = useRouter();

	const handleCreateWorkout = () => {
		router.push("/dashboard/add-exercise");
	};

	const handleOpenAIChat = () => {
		// TODO: Implement AI chat interface
		alert("Open AI Chat clicked!");
	};

	const handleViewHistory = () => {
		// TODO: Implement view history logic
		alert("View History clicked!");
	};

	return (
		<div className="mt-8">
			<div className="flex gap-3 mb-4">
				<button
					onClick={handleCreateWorkout}
					className="
                flex-1
                flex items-center justify-center gap-2
                px-6 py-4
                bg-[var(--accent-primary)]
                text-white
                rounded-lg
                font-semibold
                hover:opacity-90
                transition-opacity
                "
				>
					<span className="text-2xl">+</span>
					<span>Create workout</span>
				</button>
				<button
					onClick={handleOpenAIChat}
					className="
                    px-4 py-4
                    bg-[var(--background-secondary)]
                    border border-[var(--border-subtle)]
                    rounded-lg
                    hover:border-[var(--border-default)]
                    transition-colors"
					aria-label="Open AI chat"
				>
					<RobotIcon size={30} className="text-[var(--text-primary)]" />
				</button>
			</div>
			<div className="text-center">
				<button
					onClick={handleViewHistory}
					className="
                text-[var(--accent-primary)]
                hover:underline
                transition-all"
				>
					View Full History
				</button>
			</div>
		</div>
	);
}
