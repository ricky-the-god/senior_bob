"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import type { DiagramPayload } from "@/lib/diagram-types";
import type { AppTypeId, BackendId, InfraId, UserScaleId, WizardRecommendations } from "@/lib/project-types";
import { DEFAULT_NAMES } from "@/lib/project-types";
import { saveDiagram } from "@/server/diagrams";
import { createProjectFromWizard } from "@/server/projects";

import { StepAppType } from "./_components/step-app-type";
import { StepBackend } from "./_components/step-backend";
import { StepDescription } from "./_components/step-description";
import { StepInfra } from "./_components/step-infra";
import { StepName } from "./_components/step-name";
import { StepOrigin } from "./_components/step-origin";
import { StepTechStack } from "./_components/step-tech-stack";
import { StepUserScale } from "./_components/step-user-scale";
import type { SubmitPhase } from "./_components/wizard-types";

// ─── Types ───────────────────────────────────────────────────────────────────

type WizardState = {
  description: string;
  app_type: AppTypeId | null;
  is_new_app: boolean | null;
  tech_stack: string[];
  user_scale: UserScaleId | null;
  infra: InfraId | null;
  backend: BackendId | null;
  name: string;
  recommendations: WizardRecommendations | null;
  recommendationLoading: boolean;
};

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

const TOTAL_STEPS = 8;
const FALLBACK_PROJECT_NAME = "My Project";

// ─── Slide Variants ───────────────────────────────────────────────────────────

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -40 : 40,
    opacity: 0,
    transition: { duration: 0.2 },
  }),
};

// ─── Progress Pills ───────────────────────────────────────────────────────────

function WizardProgress({ step }: { step: Step }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((s) => (
        <motion.div
          key={s}
          className="h-1 rounded-full bg-foreground"
          animate={{
            width: s === step ? 20 : 8,
            opacity: s < step ? 0.5 : s === step ? 1 : 0.15,
          }}
          transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as const }}
        />
      ))}
    </div>
  );
}

// ─── Prompt builder ───────────────────────────────────────────────────────────

function buildDiagramPrompt(state: WizardState): string {
  const lines = [
    `Generate a complete system design diagram for the following project:`,
    `Name: ${state.name}`,
    `Description: ${state.description}`,
    `App type: ${state.app_type ?? "unspecified"}`,
    `New app: ${state.is_new_app === null ? "unspecified" : state.is_new_app ? "yes" : "no"}`,
    `Tech stack: ${state.tech_stack.length > 0 ? state.tech_stack.join(", ") : "unspecified"}`,
    `Expected scale: ${state.user_scale ?? "unspecified"}`,
    `Infrastructure: ${state.infra ?? "unspecified"}`,
    `Backend: ${state.backend ?? "unspecified"}`,
    `Include all major components: clients, API gateway, services, databases, caches, and external integrations.`,
  ];
  return lines.join("\n");
}

// ─── Wizard Shell ─────────────────────────────────────────────────────────────

function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [state, setState] = useState<WizardState>({
    description: "",
    app_type: null,
    is_new_app: null,
    tech_stack: [],
    user_scale: null,
    infra: null,
    backend: null,
    name: "",
    recommendations: null,
    recommendationLoading: false,
  });
  const [submitPhase, setSubmitPhase] = useState<SubmitPhase>("idle");

  const goTo = (next: Step, dir: 1 | -1 = 1) => {
    setDirection(dir);
    setStep(next);
  };

  const goBack = () => {
    if (step > 1) goTo((step - 1) as Step, -1);
  };

  const fetchRecommendations = async (description: string) => {
    setState((s) => ({ ...s, recommendationLoading: true }));
    try {
      const res = await fetch("/api/wizard/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });
      if (!res.ok) return;
      const recs = (await res.json()) as WizardRecommendations;
      setState((s) => ({
        ...s,
        recommendations: recs,
        recommendationLoading: false,
        // Pre-fill tech stack with recommendations
        tech_stack: s.tech_stack.length === 0 ? recs.tech_stack : s.tech_stack,
        // Pre-fill name if not yet set
        name: s.name === "" ? recs.suggested_name : s.name,
      }));
    } catch {
      setState((s) => ({ ...s, recommendationLoading: false }));
    }
  };

  // Step handlers
  const handleDescription = (description: string) => {
    setState((s) => ({ ...s, description }));
    goTo(2);
    void fetchRecommendations(description);
  };

  const handleAppType = (app_type: AppTypeId) => {
    setState((s) => ({
      ...s,
      app_type,
      name: s.name === "" ? (DEFAULT_NAMES[app_type] ?? FALLBACK_PROJECT_NAME) : s.name,
    }));
    goTo(3);
  };

  const handleOrigin = (is_new_app: boolean) => {
    setState((s) => ({ ...s, is_new_app }));
    goTo(4);
  };

  const handleTechStack = () => goTo(5);

  const handleUserScale = (user_scale: UserScaleId) => {
    setState((s) => ({ ...s, user_scale }));
    goTo(6);
  };

  const handleInfra = (infra: InfraId) => {
    setState((s) => ({ ...s, infra }));
    goTo(7);
  };

  const handleBackend = (backend: BackendId) => {
    setState((s) => ({ ...s, backend }));
    goTo(8);
  };

  const handleFinalSubmit = async (name: string) => {
    setSubmitPhase("creating");
    try {
      const { id } = await createProjectFromWizard({
        name,
        app_type: state.app_type ?? undefined,
        is_new_app: state.is_new_app ?? undefined,
        user_scale: state.user_scale ?? undefined,
        infra: state.infra ?? undefined,
        backend: state.backend ?? undefined,
        tech_stack: state.tech_stack.length > 0 ? state.tech_stack : undefined,
        wizard_description: state.description || undefined,
      });

      setSubmitPhase("generating");
      try {
        const prompt = buildDiagramPrompt({ ...state, name });
        const res = await fetch("/api/diagram-ai/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
        });
        if (res.ok) {
          const diagram = (await res.json()) as DiagramPayload;
          await saveDiagram(id, "system-design", diagram);
        }
      } catch {
        // Diagram generation is best-effort — don't block redirect
      }

      setSubmitPhase("done");
      router.push(`/dashboard/project/${id}/system-design`);
    } catch (err) {
      toast.error("Failed to create project", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
      setSubmitPhase("idle");
    }
  };

  const recs = state.recommendations;

  return (
    <div className="relative w-full max-w-[560px] overflow-hidden rounded-2xl border-[0.5px] border-foreground/10 bg-card/80 p-8 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-10">
      {/* Grain texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Header: back + progress */}
      <div className="relative z-10 mb-8 flex items-center justify-between">
        <div className="h-7 w-16">
          <AnimatePresence>
            {step > 1 && (
              <motion.button
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                type="button"
                onClick={goBack}
                className="flex items-center gap-1.5 text-muted-foreground text-sm transition-colors hover:text-foreground"
              >
                <ArrowLeft className="size-4" />
                Back
              </motion.button>
            )}
          </AnimatePresence>
        </div>
        <WizardProgress step={step} />
      </div>

      {/* Step content */}
      <div className="relative z-10 overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            {step === 1 && <StepDescription onContinue={handleDescription} />}

            {step === 2 && (
              <StepAppType
                recommended={recs?.app_type ?? null}
                recommendedReason={recs?.app_type_reason}
                recommendationLoading={state.recommendationLoading}
                onSelect={handleAppType}
              />
            )}

            {step === 3 && (
              <StepOrigin
                recommended={recs?.is_new_app ?? null}
                recommendedReason={recs?.is_new_app_reason}
                recommendationLoading={state.recommendationLoading}
                onSelect={handleOrigin}
              />
            )}

            {step === 4 && (
              <StepTechStack
                selected={state.tech_stack}
                recommended={recs?.tech_stack ?? []}
                recommendedReason={recs?.tech_stack_reason}
                recommendationLoading={state.recommendationLoading}
                onChange={(tech_stack) => setState((s) => ({ ...s, tech_stack }))}
                onContinue={handleTechStack}
              />
            )}

            {step === 5 && (
              <StepUserScale
                recommended={recs?.user_scale ?? null}
                recommendedReason={recs?.user_scale_reason}
                recommendationLoading={state.recommendationLoading}
                onSelect={handleUserScale}
              />
            )}

            {step === 6 && (
              <StepInfra
                recommended={recs?.infra ?? null}
                recommendedReason={recs?.infra_reason}
                recommendationLoading={state.recommendationLoading}
                onSelect={handleInfra}
              />
            )}

            {step === 7 && (
              <StepBackend
                recommended={recs?.backend ?? null}
                recommendedReason={recs?.backend_reason}
                recommendationLoading={state.recommendationLoading}
                onSelect={handleBackend}
              />
            )}

            {step === 8 && (
              <StepName
                suggestedName={recs?.suggested_name ?? state.name}
                suggestedNameReason={recs?.suggested_name_reason}
                submitPhase={submitPhase}
                onSubmit={handleFinalSubmit}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NewProjectPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-8">
      <OnboardingWizard />
    </div>
  );
}
