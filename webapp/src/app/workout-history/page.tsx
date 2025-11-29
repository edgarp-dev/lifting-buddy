"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/ui/Header";
import { FilterIcon } from "@/components/ui/icons";
import { SearchBar } from "@/components/workout-history/SearchBar";
import { FilterModal } from "@/components/workout-history/FilterModal";
import { HistorySessionCard } from "@/components/workout-history/HistorySessionCard";
import { api } from "@/lib/api";
import { WorkoutSession, SessionFilters } from "@/types";

export default function WorkoutHistoryPage() {
    const router = useRouter();
    const [sessions, setSessions] = useState<WorkoutSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filters, setFilters] = useState<SessionFilters>({});
    const [showFilterModal, setShowFilterModal] = useState(false);

    // Fetch sessions on mount and when filters or search changes
    useEffect(() => {
        fetchSessions();
    }, [filters, searchQuery]);

    const fetchSessions = async () => {
        try {
            setLoading(true);
            const response = await api.getWorkoutSessions({
                q: searchQuery.trim() || undefined,
                start_date: filters.startDate,
                end_date: filters.endDate,
                limit: 50,
            });

            if (response.success && response.data) {
                let sessionsList = response.data.sessions;

                // Filter by muscle group if specified (client-side filtering)
                if (filters.muscleGroup) {
                    sessionsList = sessionsList.filter((session) =>
                        session.muscle_groups
                            .toLowerCase()
                            .includes(filters.muscleGroup!.toLowerCase())
                    );
                }

                setSessions(sessionsList);
            }
        } catch (error) {
            console.error("Error fetching sessions:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSessionClick = (sessionId: string) => {
        router.push(`/workout-session/${sessionId}`);
    };

    const handleApplyFilters = (newFilters: SessionFilters) => {
        setFilters(newFilters);
        setSearchQuery(""); // Clear search when applying filters
    };

    const hasActiveFilters = filters.startDate || filters.endDate || filters.muscleGroup;

    return (
        <div className="min-h-screen bg-[var(--background-primary)] flex flex-col">
            <Header />

            <main className="container mx-auto px-4 py-6 max-w-2xl flex-1">
                {/* Page Title */}
                <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">
                    Workout History
                </h1>

                {/* Search and Filter */}
                <div className="flex gap-3 mb-6">
                    <div className="flex-1">
                        <SearchBar
                            value={searchQuery}
                            onChange={setSearchQuery}
                            placeholder="Search by exercise or muscle group..."
                        />
                    </div>
                    <button
                        onClick={() => setShowFilterModal(true)}
                        className={`
                            px-4 py-3 rounded-lg border transition-all
                            ${hasActiveFilters
                                ? "bg-[var(--accent-primary)] border-[var(--accent-primary)] text-white"
                                : "bg-[var(--background-secondary)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--border-default)]"
                            }
                        `}
                    >
                        <FilterIcon size={20} />
                    </button>
                </div>

                {/* Results Count */}
                <div className="mb-4">
                    <p className="text-sm text-[var(--text-secondary)]">
                        {loading ? "Loading..." : `${sessions.length} workout${sessions.length !== 1 ? "s" : ""} found`}
                    </p>
                </div>

                {/* Sessions List */}
                <div className="space-y-3">
                    {sessions.length === 0 && !loading && (
                        <div className="text-center py-12">
                            <p className="text-[var(--text-secondary)]">
                                {searchQuery || hasActiveFilters
                                    ? "No workouts match your search"
                                    : "No workout history yet"}
                            </p>
                        </div>
                    )}

                    {sessions.map((session) => (
                        <HistorySessionCard
                            key={session.id}
                            session={session}
                            onClick={() => handleSessionClick(session.id)}
                        />
                    ))}
                </div>
            </main>

            {/* Filter Modal */}
            <FilterModal
                isOpen={showFilterModal}
                onClose={() => setShowFilterModal(false)}
                onApply={handleApplyFilters}
                currentFilters={filters}
            />
        </div>
    );
}
