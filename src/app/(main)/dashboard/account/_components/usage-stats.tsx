import { CalendarDays, Folder, Package, Sparkles } from "lucide-react";

interface UsageStatsProps {
  projectCount: number;
  memberSince: string;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-2xl font-semibold text-foreground tabular-nums">{value}</p>
    </div>
  );
}

export function UsageStats({ projectCount, memberSince }: UsageStatsProps) {
  const memberYear = new Date(memberSince).getFullYear().toString();

  return (
    <div>
      <h3 className="text-sm font-medium text-muted-foreground mb-3">Usage Overview</h3>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard icon={<Folder className="size-3.5" />} label="Projects" value={projectCount.toString()} />
        <StatCard icon={<Sparkles className="size-3.5" />} label="AI Generations" value="—" />
        <StatCard icon={<Package className="size-3.5" />} label="Output Packs" value="—" />
        <StatCard icon={<CalendarDays className="size-3.5" />} label="Member Since" value={memberYear} />
      </div>
    </div>
  );
}
