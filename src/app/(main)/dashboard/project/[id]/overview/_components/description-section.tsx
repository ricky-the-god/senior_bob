"use client";

import { useState, useTransition } from "react";

import { updateProjectMeta } from "@/server/projects";

type Props = {
  projectId: string;
  description: string | null;
};

export function DescriptionSection({ projectId, description: initial }: Props) {
  const [value, setValue] = useState(initial ?? "");
  const [isPending, startTransition] = useTransition();

  function handleBlur() {
    const trimmed = value.trim();
    // Skip the network round-trip when nothing has changed
    if (trimmed === (initial ?? "")) return;
    startTransition(async () => {
      await updateProjectMeta(projectId, { wizard_description: trimmed || null });
    });
  }

  return (
    <section className="space-y-3">
      <h2 className="font-medium text-muted-foreground text-xs uppercase tracking-wider">Project Description</h2>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
        disabled={isPending}
        placeholder="Describe what this project does, its goals, constraints, and any important context. The AI will use this when generating system designs and tasks."
        rows={4}
        className="w-full resize-none rounded-lg border border-border bg-card/50 px-3 py-2.5 text-foreground text-xs leading-relaxed outline-none placeholder:text-muted-foreground/50 focus:border-foreground/30 focus:bg-card disabled:opacity-60"
      />
    </section>
  );
}
