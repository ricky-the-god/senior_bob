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
      <div className="flex items-baseline justify-between">
        <h2 className="font-medium text-muted-foreground text-xs uppercase tracking-wider">Project Context</h2>
        <span className="text-[10px] text-muted-foreground/40">Used by AI to generate designs &amp; tasks</span>
      </div>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
        disabled={isPending}
        placeholder="What does this project do? Who is it for? What are the key constraints or goals? The more context you add, the better the AI-generated outputs will be."
        rows={4}
        className="w-full resize-none rounded-lg border border-border bg-card/50 px-3 py-2.5 text-foreground text-xs leading-relaxed outline-none placeholder:text-muted-foreground/50 focus:border-foreground/30 focus:bg-card disabled:opacity-60"
      />
    </section>
  );
}
