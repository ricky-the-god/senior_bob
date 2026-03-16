import { Check, Zap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface PlanCardsProps {
  projectsUsed: number;
  projectLimit: number;
}

const FREE_FEATURES = [
  "Up to 5 projects",
  "System design canvas",
  "AI diagram generation",
  "Output pack export",
  "Community support",
];

const PRO_FEATURES = [
  "Unlimited projects",
  "Priority AI generation",
  "Advanced output packs",
  "Team collaboration",
  "Custom templates",
  "Priority support",
];

export function PlanCards({ projectsUsed, projectLimit }: PlanCardsProps) {
  const usagePercent = Math.min((projectsUsed / projectLimit) * 100, 100);
  const remaining = Math.max(projectLimit - projectsUsed, 0);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {/* Free Plan */}
      <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Current Plan</p>
          <h3 className="text-lg font-semibold text-foreground">Free</h3>
          <p className="text-muted-foreground text-sm mt-0.5">Everything you need to get started</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Projects used</span>
            <span className="font-medium text-foreground">
              {projectsUsed} / {projectLimit}
            </span>
          </div>
          <Progress value={usagePercent} className="h-1.5" />
          <p className="text-xs text-muted-foreground">
            {remaining === 0
              ? "Limit reached — upgrade to create more"
              : `${remaining} project${remaining === 1 ? "" : "s"} remaining`}
          </p>
        </div>

        <ul className="flex flex-col gap-2 flex-1">
          {FREE_FEATURES.map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-foreground">
              <Check className="size-3.5 shrink-0 text-emerald-500" />
              {f}
            </li>
          ))}
        </ul>

        <Button variant="outline" size="sm" disabled className="w-full mt-auto">
          Current plan
        </Button>
      </div>

      {/* Pro Plan */}
      <div className="relative rounded-xl border border-primary/40 bg-gradient-to-br from-card to-primary/5 p-5 flex flex-col gap-4">
        <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 shadow-sm">Most Popular</Badge>

        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Upgrade to</p>
          <div className="flex items-baseline gap-1.5">
            <h3 className="text-lg font-semibold text-foreground">Pro</h3>
            <span className="text-2xl font-bold text-foreground">$12</span>
            <span className="text-muted-foreground text-sm">/mo</span>
          </div>
          <p className="text-muted-foreground text-sm mt-0.5">For serious builders</p>
        </div>

        <ul className="flex flex-col gap-2 flex-1">
          {PRO_FEATURES.map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-foreground">
              <Check className="size-3.5 shrink-0 text-primary" />
              {f}
            </li>
          ))}
        </ul>

        <Button size="sm" disabled className="w-full gap-2 mt-auto">
          <Zap className="size-3.5" />
          Upgrade Now
        </Button>
      </div>
    </div>
  );
}
