import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useWorkoutSessionDetail(sessionId: string) {
    return useQuery({
        queryKey: ["workout-session-detail", sessionId],
        queryFn: () => api.getWorkoutSessionDetail(sessionId),
        enabled: !!sessionId,
    });
}
