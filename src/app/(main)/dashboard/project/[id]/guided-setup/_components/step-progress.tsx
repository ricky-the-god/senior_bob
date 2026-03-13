"use client";

import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

type StepDef = {
  label: string;
  href: string;
  completed: boolean;
};

type Props = {
  steps: StepDef[];
};

export function StepProgress({ steps }: Props) {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-6 border-border border-b bg-card/40 px-6 py-3 text-sm">
      {steps.map((step, i) => {
        const _isActive = pathname.endsWith(new URL(step.href, "http://x").pathname.split("/").pop() ?? "");
        const isActiveExact = pathname.includes(step.href.split("/").pop() ?? "");

        return (
          <div key={step.href} className="flex items-center gap-2">
            <div
              className={cn(
                "flex size-5 items-center justify-center rounded-full font-medium text-[11px] transition-colors",
                step.completed
                  ? "bg-blue-500 text-white"
                  : isActiveExact
                    ? "border border-foreground/50 text-foreground"
                    : "border border-foreground/15 text-muted-foreground",
              )}
            >
              {step.completed ? "✓" : i + 1}
            </div>
            <span
              className={cn(
                "transition-colors",
                step.completed
                  ? "text-foreground/60"
                  : isActiveExact
                    ? "font-medium text-foreground"
                    : "text-muted-foreground",
              )}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
