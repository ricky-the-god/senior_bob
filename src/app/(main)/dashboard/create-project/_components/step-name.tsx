import { useEffect, useRef, useState } from "react";

import { motion } from "framer-motion";
import { CheckCircle, Loader2, Sparkles, Wand2 } from "lucide-react";

import { cn } from "@/lib/utils";

import type { SubmitPhase } from "./wizard-types";

type Props = {
  suggestedName: string;
  suggestedNameReason?: string;
  submitPhase: SubmitPhase;
  onSubmit: (name: string) => void;
};

const PHASE_LABELS: Record<SubmitPhase, string> = {
  idle: "Create Project",
  creating: "Creating project…",
  done: "Done!",
};

export function StepName({ suggestedName, suggestedNameReason, submitPhase, onSubmit }: Props) {
  const [name, setName] = useState(suggestedName);
  const appliedRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Pre-fill once when the AI suggestion arrives. Use a ref so remounting
  // the step doesn't overwrite the user's edits.
  useEffect(() => {
    if (suggestedName && !appliedRef.current) {
      setName(suggestedName);
      appliedRef.current = true;
    }
  }, [suggestedName]);

  const isValid = name.trim().length > 0 && name.trim().length <= 100;
  const isBusy = submitPhase === "creating";

  const applySuggestion = () => {
    setName(suggestedName);
    appliedRef.current = true;
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h2 className="font-semibold text-foreground text-xl tracking-tight">Name your project</h2>
        <p className="mt-1.5 text-muted-foreground text-sm">You can always change this later</p>
      </div>

      <div className="flex flex-col gap-3">
        {suggestedName && (
          <button
            type="button"
            onClick={applySuggestion}
            className="flex items-center gap-2 rounded-lg border border-violet-500/20 bg-violet-500/5 px-3 py-2 text-left transition-colors hover:bg-violet-500/10"
          >
            <Wand2 className="size-3.5 shrink-0 text-violet-400" />
            <div className="flex-1 min-w-0">
              <p className="text-violet-300 text-xs font-medium truncate">{suggestedName}</p>
              {suggestedNameReason && (
                <p className="text-muted-foreground text-[10px] mt-0.5 line-clamp-1">{suggestedNameReason}</p>
              )}
            </div>
            <Sparkles className="size-3 text-violet-400/60 shrink-0" />
          </button>
        )}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="project-name" className="font-medium text-foreground text-xs">
            Project name
          </label>
          <input
            ref={inputRef}
            id="project-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. My Awesome App"
            maxLength={100}
            className={cn(
              "w-full rounded-lg border border-foreground/10 bg-card/50 px-3.5 py-2.5",
              "text-foreground text-sm placeholder:text-muted-foreground/50",
              "outline-none transition-all duration-150",
              "focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20",
            )}
          />
        </div>
      </div>

      <motion.button
        type="button"
        disabled={!isValid || isBusy}
        onClick={() => isValid && !isBusy && onSubmit(name.trim())}
        className={cn(
          "relative flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3",
          "bg-foreground text-background font-medium text-sm",
          "transition-all duration-300 hover:opacity-90",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "disabled:pointer-events-none disabled:opacity-50",
        )}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        {isBusy ? (
          <Loader2 className="size-4 animate-spin" />
        ) : submitPhase === "done" ? (
          <CheckCircle className="size-4" />
        ) : null}
        {PHASE_LABELS[submitPhase]}
      </motion.button>
    </div>
  );
}
