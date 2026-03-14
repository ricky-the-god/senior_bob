"use client";

import Link from "next/link";

import { ArrowRight, CheckCircle2, FileCode2, Lock, Sparkles } from "lucide-react";

import type { Prereqs } from "./output-pack-shell";

type Props = {
  prereqs: Prereqs;
  projectId: string;
};

const STEPS: { key: keyof Prereqs; step: number; label: string; description: string; path: string }[] = [
  {
    key: "workflow",
    step: 1,
    label: "Workflow",
    description: "Define your main goal and primary user flow",
    path: "guided-setup/workflow",
  },
  {
    key: "features",
    step: 2,
    label: "Features",
    description: "Select your core features",
    path: "guided-setup/features",
  },
  {
    key: "integrations",
    step: 3,
    label: "Integrations",
    description: "Specify tools, stack preferences, and constraints",
    path: "guided-setup/integrations",
  },
  {
    key: "diagram",
    step: 4,
    label: "System Design",
    description: "Build your architecture diagram with at least one node",
    path: "system-design",
  },
];

const OUTPUT_FILES = [
  { name: "project-overview.md", color: "text-sky-400", bg: "bg-sky-400/10", border: "border-l-sky-400/40" },
  { name: "requirements.md", color: "text-violet-400", bg: "bg-violet-400/10", border: "border-l-violet-400/40" },
  { name: "system-design.md", color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-l-emerald-400/40" },
  { name: "implementation-plan.md", color: "text-amber-400", bg: "bg-amber-400/10", border: "border-l-amber-400/40" },
  { name: "claude-code-prompt.md", color: "text-rose-400", bg: "bg-rose-400/10", border: "border-l-rose-400/40" },
];

// Workflow breadcrumb steps for context strip
const WORKFLOW_STEPS = [
  { label: "Setup", sublabel: "Guided" },
  { label: "Design", sublabel: "System" },
  { label: "Tasks", sublabel: "Plan" },
  { label: "Output", sublabel: "Pack", current: true },
];

export function PrerequisiteChecklist({ prereqs, projectId }: Props) {
  const doneCount = Object.values(prereqs).filter(Boolean).length;
  const totalSteps = STEPS.length;
  const progressPct = (doneCount / totalSteps) * 100;
  const remaining = totalSteps - doneCount;

  // Find the first incomplete step to direct the user there
  const nextStep = STEPS.find((s) => !prereqs[s.key]);

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      {/* Workflow position strip */}
      <div className="border-border/50 border-b bg-card/20 px-6 py-2.5">
        <div className="mx-auto flex w-full max-w-2xl items-center gap-1">
          {WORKFLOW_STEPS.map((wStep, i) => (
            <div key={wStep.label} className="flex items-center gap-1">
              {i > 0 && <div className="h-px w-4 bg-border" />}
              <div
                className={`flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-medium text-[10px] transition-colors ${
                  wStep.current ? "bg-foreground/10 text-foreground" : "text-muted-foreground/50"
                }`}
              >
                <span
                  className={`size-1.5 rounded-full ${wStep.current ? "bg-foreground/60" : "bg-muted-foreground/20"}`}
                />
                {wStep.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hero section */}
      <div className="border-border border-b bg-card/40 px-6 py-7">
        <div className="mx-auto w-full max-w-2xl">
          <div className="mb-4 flex items-start gap-3">
            <div className="mt-0.5 flex size-9 flex-shrink-0 items-center justify-center rounded-xl border border-border bg-card">
              <Sparkles className="size-4 text-foreground/40" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground text-xl tracking-tight">Almost there — Output Pack</h1>
              <p className="mt-1 max-w-lg text-muted-foreground text-sm leading-relaxed">
                Complete {remaining === 1 ? "1 more step" : `${remaining} more steps`} and SeniorBob will generate{" "}
                <span className="font-medium text-foreground">5 implementation-ready files</span> you can drop straight
                into a Claude Code session.
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-2">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-muted-foreground text-xs">
                {doneCount} of {totalSteps} prereqs complete
              </span>
              <span
                className={`font-medium text-xs ${progressPct >= 75 ? "text-emerald-400" : progressPct >= 50 ? "text-amber-400" : "text-muted-foreground"}`}
              >
                {Math.round(progressPct)}%
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-foreground/8">
              <div
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  progressPct >= 75 ? "bg-emerald-500/70" : progressPct >= 50 ? "bg-amber-500/70" : "bg-foreground/30"
                }`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col gap-8 px-6 py-7">
        <div className="mx-auto w-full max-w-2xl">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_220px]">
            {/* Steps column */}
            <div className="flex flex-col gap-3">
              <h2 className="font-medium text-foreground text-sm">
                {doneCount === 0
                  ? "Complete these steps to unlock generation"
                  : `${remaining} step${remaining === 1 ? "" : "s"} remaining`}
              </h2>

              <ul className="flex flex-col gap-2">
                {STEPS.map(({ key, step, label, description, path }) => {
                  const done = prereqs[key];
                  const isNext = nextStep?.key === key;
                  const href = `/dashboard/project/${projectId}/${path}`;

                  return (
                    <li key={key}>
                      {done ? (
                        <div className="flex items-start gap-3 rounded-lg border border-border/40 bg-emerald-500/[0.04] px-3.5 py-3">
                          <CheckCircle2 className="mt-0.5 size-4 flex-shrink-0 text-emerald-500/70" />
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-foreground/60 text-sm">{label}</p>
                            <p className="mt-0.5 text-muted-foreground/50 text-xs">{description}</p>
                          </div>
                          <span className="mt-0.5 flex-shrink-0 font-medium text-[10px] text-emerald-500/60">Done</span>
                        </div>
                      ) : (
                        <Link
                          href={href}
                          className={`group flex items-start gap-3 rounded-lg border px-3.5 py-3 transition-all ${
                            isNext
                              ? "border-foreground/20 bg-foreground/[0.04] hover:bg-foreground/[0.07]"
                              : "border-border bg-card hover:bg-foreground/[0.03]"
                          }`}
                        >
                          <div
                            className={`mt-0.5 flex size-5 flex-shrink-0 items-center justify-center rounded-full border font-bold text-[10px] ${
                              isNext
                                ? "border-foreground/30 bg-foreground/10 text-foreground"
                                : "border-border text-muted-foreground/40"
                            }`}
                          >
                            {step}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p
                              className={`font-medium text-sm ${isNext ? "text-foreground" : "text-muted-foreground/70"}`}
                            >
                              {label}
                            </p>
                            <p className="mt-0.5 text-muted-foreground/60 text-xs">{description}</p>
                          </div>
                          <ArrowRight
                            className={`mt-0.5 size-3.5 flex-shrink-0 transition-transform group-hover:translate-x-0.5 ${
                              isNext ? "text-foreground/60" : "text-muted-foreground/25"
                            }`}
                          />
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>

              {nextStep && (
                <Link
                  href={`/dashboard/project/${projectId}/${nextStep.path}`}
                  className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg bg-foreground px-4 py-2.5 font-medium text-background text-sm transition-opacity hover:opacity-80"
                >
                  Continue to {nextStep.label}
                  <ArrowRight className="size-3.5" />
                </Link>
              )}
            </div>

            {/* Files preview column */}
            <div className="flex flex-col gap-3">
              <h2 className="font-medium text-foreground text-sm">What you&apos;ll get</h2>
              <div className="overflow-hidden rounded-xl border border-border bg-card">
                <div className="border-border border-b px-3 py-2.5">
                  <p className="text-muted-foreground text-xs">5 files · Ready for Claude Code</p>
                </div>
                <ul className="flex flex-col divide-y divide-border">
                  {OUTPUT_FILES.map((f) => (
                    <li key={f.name} className={`flex items-center gap-2.5 border-l-2 px-3 py-2.5 ${f.border}`}>
                      <div className={`flex size-5 flex-shrink-0 items-center justify-center rounded ${f.bg}`}>
                        <Lock className={`size-2.5 ${f.color}`} />
                      </div>
                      <span className="truncate font-mono text-[11px] text-muted-foreground/70">{f.name}</span>
                    </li>
                  ))}
                </ul>
                <div className="border-border border-t bg-foreground/[0.02] px-3 py-2">
                  <p className="text-[10px] text-muted-foreground/40 leading-relaxed">Complete all steps to unlock</p>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card p-3">
                <div className="mb-1.5 flex items-center gap-2">
                  <FileCode2 className="size-3.5 text-muted-foreground/50" />
                  <span className="font-medium text-foreground text-xs">How to use</span>
                </div>
                <p className="text-[11px] text-muted-foreground/70 leading-relaxed">
                  Drop these files into your project root, then paste the{" "}
                  <span className="font-mono text-foreground/60">claude-code-prompt.md</span> as your first message in
                  Claude Code.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
