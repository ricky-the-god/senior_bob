import type { ReactNode } from "react";

import Link from "next/link";

import { Check, Lock } from "lucide-react";

import { cn } from "@/lib/utils";

type StepState = "not_started" | "in_progress" | "completed";

type Props = {
  stepNumber: number;
  label: string;
  description: string;
  state: StepState;
  href: string;
  children?: ReactNode;
  disabled?: boolean;
};

export function StepCard({ stepNumber, label, description, state, href, children, disabled }: Props) {
  const isLocked = disabled && state !== "completed";
  const ctaLabel = state === "in_progress" ? "Continue" : "Start with SeniorBob";

  return (
    <div
      className={cn(
        "flex min-h-[280px] flex-col rounded-xl border bg-card p-5 transition-colors",
        state === "not_started" && !isLocked && "border-blue-500/30 ring-1 ring-blue-500/10",
        state === "in_progress" && "border-blue-500/30 ring-1 ring-blue-500/10",
        state === "completed" && "border-green-500/20",
        isLocked && "border-border opacity-60",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "flex size-7 shrink-0 items-center justify-center rounded-full border font-semibold text-xs",
              isLocked && "border-foreground/10 text-muted-foreground/40",
              state === "not_started" && !isLocked && "border-blue-500/40 bg-blue-500/10 text-blue-400",
              state === "in_progress" && "border-blue-500/40 bg-blue-500/10 text-blue-400",
              state === "completed" && "border-green-500 bg-green-500 text-white",
            )}
          >
            {state === "completed" ? (
              <Check className="size-3.5" />
            ) : isLocked ? (
              <Lock className="size-3" />
            ) : (
              stepNumber
            )}
          </div>
          <p className="font-medium text-foreground text-sm">{label}</p>
        </div>

        {state === "completed" && (
          <Link
            href={href}
            className="shrink-0 text-muted-foreground text-xs underline-offset-2 transition-colors hover:text-foreground hover:underline"
          >
            Edit
          </Link>
        )}
      </div>

      {/* Body */}
      <div className="mt-4 flex flex-1 flex-col">
        {state === "completed" && children ? (
          children
        ) : (
          <div className="flex flex-1 flex-col justify-between">
            <p className="text-muted-foreground text-xs leading-relaxed">{description}</p>
            {!isLocked && (
              <Link
                href={href}
                className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-blue-500 px-3.5 py-2 font-medium text-white text-xs transition-colors hover:bg-blue-600"
              >
                {ctaLabel}
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
