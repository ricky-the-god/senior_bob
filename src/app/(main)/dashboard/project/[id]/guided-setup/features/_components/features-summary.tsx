"use client";

import { useState, useTransition } from "react";

import { useRouter } from "next/navigation";

import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

import type { GuidedSetupFeatures } from "@/lib/project-types";
import { saveGuidedSetupStep } from "@/server/projects";

import { AnswerChips } from "../../_components/answer-chips";
import { FEATURE_OPTIONS } from "./feature-options";

type Props = {
  projectId: string;
  initialData: GuidedSetupFeatures;
};

const textareaClass =
  "w-full resize-none rounded-lg border border-border bg-card/50 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 disabled:opacity-60 transition-all";

export function FeaturesSummary({ projectId, initialData }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selected, setSelected] = useState<string[]>(initialData.selected);
  const [customText, setCustomText] = useState(initialData.custom.join(", "));

  const handleChipSelect = (v: string) => {
    setSelected((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));
  };

  const handleSave = () => {
    const custom = customText
      ? customText
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
    startTransition(async () => {
      try {
        await saveGuidedSetupStep(projectId, {
          step: "features",
          data: { selected, custom, completed: true },
        });
        toast.success("Features saved");
        router.push(`/dashboard/project/${projectId}/guided-setup`);
      } catch (err) {
        toast.error("Failed to save", {
          description: err instanceof Error ? err.message : "Unknown error",
        });
      }
    });
  };

  return (
    <div className="flex flex-1 flex-col overflow-y-auto p-6">
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <div className="flex items-center gap-3">
          <h2 className="font-semibold text-base text-foreground">Features</h2>
          <span className="flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-blue-400 text-xs">
            <Check className="size-3" /> Complete
          </span>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <span className="font-medium text-muted-foreground text-xs uppercase tracking-wider">Core Features</span>
            <AnswerChips
              options={[...FEATURE_OPTIONS]}
              selected={selected}
              onSelect={handleChipSelect}
              multiSelect
              disabled={isPending}
            />
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="customFeatures"
              className="font-medium text-muted-foreground text-xs uppercase tracking-wider"
            >
              Custom Features
            </label>
            <textarea
              id="customFeatures"
              rows={3}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              disabled={isPending}
              placeholder="Add custom features (comma-separated)…"
              className={textareaClass}
            />
          </div>
        </div>

        <button
          type="button"
          disabled={isPending}
          onClick={handleSave}
          className="flex items-center gap-2 rounded-lg bg-foreground px-4 py-2.5 font-medium text-background text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Saving…
            </>
          ) : (
            "Save Changes"
          )}
        </button>
      </div>
    </div>
  );
}
