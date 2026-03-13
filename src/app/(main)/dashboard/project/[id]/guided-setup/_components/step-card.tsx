import Link from "next/link";

import { Check, Lock } from "lucide-react";

import { cn } from "@/lib/utils";

type StepState = "locked" | "active" | "completed";

type Props = {
  stepNumber: number;
  label: string;
  description: string;
  state: StepState;
  href: string;
  preview?: string;
  ctaLabel?: string;
};

export function StepCard({ stepNumber, label, description, state, href, preview, ctaLabel = "Start" }: Props) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-5 transition-colors",
        state === "active" && "border-blue-500/30 ring-1 ring-blue-500/10",
        state === "locked" && "border-border opacity-60",
        state === "completed" && "border-border",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          {/* Step indicator */}
          <div
            className={cn(
              "flex size-7 shrink-0 items-center justify-center rounded-full border font-semibold text-xs",
              state === "locked" && "border-foreground/10 text-muted-foreground/40",
              state === "active" && "border-blue-500/40 bg-blue-500/10 text-blue-400",
              state === "completed" && "border-blue-500 bg-blue-500 text-white",
            )}
          >
            {state === "completed" ? <Check className="size-3.5" /> : stepNumber}
          </div>

          {/* Label + description */}
          <div>
            <p className="font-medium text-foreground text-sm">{label}</p>
            <p className="mt-0.5 text-muted-foreground text-xs">{description}</p>
            {state === "completed" && preview && (
              <p className="mt-1.5 max-w-xs truncate text-muted-foreground/70 text-xs">{preview}</p>
            )}
          </div>
        </div>

        {/* Right CTA */}
        <div className="shrink-0">
          {state === "locked" && <Lock className="size-4 text-muted-foreground/40" />}
          {state === "active" && (
            <Link
              href={href}
              className="rounded-lg bg-blue-500 px-3.5 py-2 font-medium text-white text-xs transition-colors hover:bg-blue-600"
            >
              {ctaLabel}
            </Link>
          )}
          {state === "completed" && (
            <Link
              href={href}
              className="text-muted-foreground text-xs underline-offset-2 transition-colors hover:text-foreground hover:underline"
            >
              Review
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
