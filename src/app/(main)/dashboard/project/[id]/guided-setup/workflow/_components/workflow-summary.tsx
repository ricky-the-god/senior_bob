"use client";

import { useState, useTransition } from "react";

import { useRouter } from "next/navigation";

import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

import type { GuidedSetupWorkflow } from "@/lib/project-types";
import { saveGuidedSetupStep } from "@/server/projects";

type Props = {
  projectId: string;
  initialData: GuidedSetupWorkflow;
};

const textareaClass =
  "w-full resize-none rounded-lg border border-border bg-card/50 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 disabled:opacity-60 transition-all";

export function WorkflowSummary({ projectId, initialData }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [mainGoal, setMainGoal] = useState(initialData.mainGoal);
  const [mainFlow, setMainFlow] = useState(initialData.mainFlow);

  const handleSave = () => {
    startTransition(async () => {
      try {
        await saveGuidedSetupStep(projectId, {
          step: "workflow",
          data: { mainGoal, mainFlow, completed: true },
        });
        toast.success("Workflow saved");
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
          <h2 className="font-semibold text-base text-foreground">Workflow</h2>
          <span className="flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-blue-400 text-xs">
            <Check className="size-3" /> Complete
          </span>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="mainGoal" className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
              Main Goal
            </label>
            <textarea
              id="mainGoal"
              rows={3}
              value={mainGoal}
              onChange={(e) => setMainGoal(e.target.value)}
              disabled={isPending}
              placeholder="What does your app help users do?"
              className={textareaClass}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="mainFlow" className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
              Main Flow
            </label>
            <textarea
              id="mainFlow"
              rows={4}
              value={mainFlow}
              onChange={(e) => setMainFlow(e.target.value)}
              disabled={isPending}
              placeholder="Walk through the main user flow from start to finish…"
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
