import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Header } from "@/components/ui/Header";
import { GreetingSection } from "@/components/dashboard/GreetingSection";
import { WeeklySessionsList } from "@/components/dashboard/WeeklySessionsList";
import { DashboardActions } from "@/components/dashboard/DashboardActions";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const username = user.email?.split("@")[0] || "User";

  return (
    <div className="min-h-screen bg-[var(--background-primary)] flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-2xl flex-1 flex flex-col">
        <GreetingSection username={username} />
        <div className="flex-1">
          <WeeklySessionsList />
        </div>
        <DashboardActions />
      </main>
    </div>
  );
}
