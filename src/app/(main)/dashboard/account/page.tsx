import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

import { PlanCards } from "./_components/plan-cards";
import { ProfileCard } from "./_components/profile-card";
import { UsageStats } from "./_components/usage-stats";

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/v3/login");
  }

  const { count: projectCount } = await supabase
    .from("projects")
    .select("*", { count: "exact", head: true })
    .eq("owner_id", user.id);

  const name = user.user_metadata?.full_name ?? user.user_metadata?.name ?? user.email?.split("@")[0] ?? "User";

  const avatarUrl: string | null = user.user_metadata?.avatar_url ?? null;
  const projects = projectCount ?? 0;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Account & Billing</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your profile, plan, and account settings</p>
      </div>

      <ProfileCard name={name} email={user.email ?? ""} avatarUrl={avatarUrl} memberSince={user.created_at} />

      <PlanCards projectsUsed={projects} projectLimit={5} />

      <UsageStats projectCount={projects} memberSince={user.created_at} />

      {/* Danger Zone */}
      <div className="rounded-xl border border-destructive/40 bg-card p-5">
        <h3 className="font-semibold text-destructive mb-1">Danger Zone</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
        <Button variant="destructive" size="sm" disabled>
          Delete Account
        </Button>
      </div>
    </div>
  );
}
