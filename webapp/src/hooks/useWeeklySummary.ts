import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useWeeklySummary() {
    return useQuery({
        queryKey: ["weekly-summary"],
        queryFn: () => api.getWeeklySummary(),
    });
}
