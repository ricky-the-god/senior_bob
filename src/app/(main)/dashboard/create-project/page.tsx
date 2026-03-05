"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  Building2,
  Code2,
  GitBranch,
  LayoutDashboard,
  Network,
  Settings2,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Zap,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { cn } from "@/lib/utils";
import { createProjectFromWizard } from "@/server/projects";

// ─── Types ───────────────────────────────────────────────────────────────────

type WizardData = {
  is_new_app: boolean | null;
  app_type: string | null;
  name: string;
};

type Step = 1 | 2 | 3;

// ─── Constants ────────────────────────────────────────────────────────────────

const FALLBACK_PROJECT_NAME = "My Project";

// Shared interactive styles for every selectable option card in the wizard
const WIZARD_OPTION_CLASSES =
  "rounded-xl border border-foreground/10 bg-card/50 transition-all duration-150 " +
  "hover:border-blue-500/50 hover:bg-blue-500/5 hover:shadow-blue-500/10 hover:shadow-md " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

const APP_TYPES = [
  { id: "saas", label: "SaaS Platform", Icon: LayoutDashboard },
  { id: "mobile", label: "Mobile App", Icon: Smartphone },
  { id: "microservices", label: "Microservices", Icon: Network },
  { id: "ecommerce", label: "E-commerce", Icon: ShoppingCart },
  { id: "api", label: "API Platform", Icon: Code2 },
  { id: "internal", label: "Internal Tool", Icon: Settings2 },
  { id: "data-pipeline", label: "Data Pipeline", Icon: GitBranch },
  { id: "realtime", label: "Real-time App", Icon: Zap },
] as const;

const DEFAULT_NAMES: Record<string, string> = {
  saas: "My SaaS Platform",
  mobile: "My Mobile App",
  microservices: "My Microservices",
  ecommerce: "My E-commerce Store",
  api: "My API Platform",
  internal: "My Internal Tool",
  "data-pipeline": "My Data Pipeline",
  realtime: "My Real-time App",
};

// ─── Form Schema ──────────────────────────────────────────────────────────────

const nameSchema = z.object({
  name: z.string().min(1, "Project name is required").max(100, "Name must be under 100 characters").trim(),
});

type NameFormData = z.infer<typeof nameSchema>;

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
    <div className="flex items-center gap-1.5">
      {([1, 2, 3] as const).map((s) => (
        <motion.div
          key={s}
          className="h-1.5 rounded-full bg-foreground"
          animate={{
            width: s === step ? 24 : 12,
            opacity: s < step ? 0.5 : s === step ? 1 : 0.2,
          }}
          transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as const }}
        />
      ))}
    </div>
  );
}

// ─── Step 1 — Origin ──────────────────────────────────────────────────────────

type OriginOptionProps = {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  onClick: () => void;
};

function OriginOption({ icon: Icon, title, subtitle, onClick }: OriginOptionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("flex items-center gap-4 p-4 text-left", WIZARD_OPTION_CLASSES)}
    >
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-foreground/5">
        <Icon className="size-5 text-foreground/70" />
      </div>
      <div>
        <p className="font-medium text-foreground text-sm">{title}</p>
        <p className="mt-0.5 text-muted-foreground text-xs">{subtitle}</p>
      </div>
    </button>
  );
}

function StepOrigin({ onSelect }: { onSelect: (isNew: boolean) => void }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h2 className="font-semibold text-foreground text-xl tracking-tight">What&apos;s your starting point?</h2>
        <p className="mt-1.5 text-muted-foreground text-sm">Tell us about your project origin</p>
      </div>

      <div className="flex flex-col gap-3">
        <OriginOption
          icon={Sparkles}
          title="Brand new app"
          subtitle="Start from scratch with a clean slate"
          onClick={() => onSelect(true)}
        />
        <OriginOption
          icon={Building2}
          title="Existing app"
          subtitle="Document or redesign an existing system"
          onClick={() => onSelect(false)}
        />
      </div>
    </div>
  );
}

// ─── Step 2 — App Type ────────────────────────────────────────────────────────

function StepAppType({ onSelect }: { onSelect: (type: string) => void }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h2 className="font-semibold text-foreground text-xl tracking-tight">What type of application?</h2>
        <p className="mt-1.5 text-muted-foreground text-sm">Choose the category that best fits your project</p>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {APP_TYPES.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            className={cn("flex flex-col items-center gap-2 p-3.5", WIZARD_OPTION_CLASSES)}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-foreground/5">
              <Icon className="size-4 text-foreground/70" />
            </div>
            <span className="text-center font-medium text-foreground text-xs leading-tight">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Step 3 — Name ────────────────────────────────────────────────────────────

function StepName({
  defaultName,
  isSubmitting,
  onSubmit,
}: {
  defaultName: string;
  isSubmitting: boolean;
  onSubmit: (data: NameFormData) => Promise<void>;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NameFormData>({
    resolver: zodResolver(nameSchema),
    defaultValues: { name: defaultName },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h2 className="font-semibold text-foreground text-xl tracking-tight">Name your project</h2>
        <p className="mt-1.5 text-muted-foreground text-sm">You can always change this later</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="project-name" className="font-medium text-foreground text-xs">
            Project name
          </label>
          <input
            id="project-name"
            type="text"
            placeholder="e.g. My Awesome App"
            {...register("name")}
            className={cn(
              "w-full rounded-lg border border-foreground/10 bg-card/50 px-3.5 py-2.5",
              "text-foreground text-sm placeholder:text-muted-foreground/50",
              "outline-none transition-all duration-150",
              "focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20",
              errors.name && "border-red-500/50",
            )}
          />
          {errors.name && <p className="text-red-400 text-xs">{errors.name.message}</p>}
        </div>

        <motion.button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "relative w-full rounded-lg px-4 py-3",
            "bg-foreground text-background",
            "font-medium text-sm",
            "transition-all duration-300 hover:opacity-90",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            "disabled:pointer-events-none disabled:opacity-50",
          )}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          {isSubmitting ? (
            <motion.div
              className="mx-auto size-5 rounded-full border-2 border-background/20 border-t-background"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          ) : (
            "Create project"
          )}
        </motion.button>
      </form>
    </div>
  );
}

// ─── Wizard Shell ─────────────────────────────────────────────────────────────

function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [data, setData] = useState<WizardData>({ is_new_app: null, app_type: null, name: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const goForward = (next: Step) => {
    setDirection(1);
    setStep(next);
  };

  const goBack = () => {
    setDirection(-1);
    setStep((s) => (s > 1 ? ((s - 1) as Step) : s));
  };

  const handleOriginSelect = (isNew: boolean) => {
    setData((d) => ({ ...d, is_new_app: isNew }));
    goForward(2);
  };

  const handleTypeSelect = (type: string) => {
    setData((d) => ({ ...d, app_type: type, name: DEFAULT_NAMES[type] ?? FALLBACK_PROJECT_NAME }));
    goForward(3);
  };

  const handleNameSubmit = async (formData: NameFormData) => {
    setIsSubmitting(true);
    try {
      const { id } = await createProjectFromWizard({
        name: formData.name,
        app_type: data.app_type ?? undefined,
        is_new_app: data.is_new_app ?? undefined,
      });
      router.push(`/dashboard/canvas/${id}/schema`);
    } catch (err) {
      toast.error("Failed to create project", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative w-full max-w-[520px] overflow-hidden rounded-2xl border-[0.5px] border-foreground/10 bg-card/80 p-8 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-10">
      {/* Grain texture overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Header row: back button + progress */}
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
            {step === 1 && <StepOrigin onSelect={handleOriginSelect} />}
            {step === 2 && <StepAppType onSelect={handleTypeSelect} />}
            {step === 3 && (
              <StepName
                defaultName={data.name || FALLBACK_PROJECT_NAME}
                isSubmitting={isSubmitting}
                onSubmit={handleNameSubmit}
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
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <OnboardingWizard />
    </div>
  );
}
