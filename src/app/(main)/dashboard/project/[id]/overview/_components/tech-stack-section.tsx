"use client";

import { useEffect, useRef, useState, useTransition } from "react";

import { Plus, X } from "lucide-react";

import { updateProjectMeta } from "@/server/projects";

type Props = {
  projectId: string;
  techStack: string[];
};

export function TechStackSection({ projectId, techStack: initial }: Props) {
  const [stack, setStack] = useState(initial);
  const [inputValue, setInputValue] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the input when it mounts (replaces autoFocus)
  useEffect(() => {
    if (showInput) inputRef.current?.focus();
  }, [showInput]);

  function save(next: string[]) {
    setStack(next);
    startTransition(async () => {
      await updateProjectMeta(projectId, { tech_stack: next.length ? next : null });
    });
  }

  function addTag() {
    const tag = inputValue.trim();
    if (!tag || stack.includes(tag)) {
      setInputValue("");
      setShowInput(false);
      return;
    }
    save([...stack, tag]);
    setInputValue("");
    setShowInput(false);
  }

  function removeTag(tag: string) {
    save(stack.filter((t) => t !== tag));
  }

  return (
    <section className="space-y-3">
      <h2 className="font-medium text-muted-foreground text-xs uppercase tracking-wider">Tech Stack</h2>
      {stack.length === 0 && !showInput && (
        <p className="text-muted-foreground/50 text-xs">
          Add your languages, frameworks, and tools — the AI uses this when designing your architecture.
        </p>
      )}
      <div className="flex flex-wrap items-center gap-1.5">
        {stack.map((tag) => (
          <span
            key={tag}
            className="group flex items-center gap-1 rounded-md border border-border bg-card px-2 py-0.5 text-foreground text-xs"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="text-muted-foreground/40 transition-colors hover:text-foreground"
              aria-label={`Remove ${tag}`}
            >
              <X className="size-3" />
            </button>
          </span>
        ))}

        {showInput ? (
          <input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={addTag}
            onKeyDown={(e) => {
              if (e.key === "Enter") addTag();
              if (e.key === "Escape") {
                setInputValue("");
                setShowInput(false);
              }
            }}
            placeholder="e.g. Next.js"
            className="w-28 rounded-md border border-border border-dashed bg-transparent px-2 py-0.5 text-xs outline-none focus:border-foreground/30"
          />
        ) : (
          <button
            type="button"
            onClick={() => setShowInput(true)}
            className="flex items-center gap-1 rounded-md border border-border border-dashed px-2 py-0.5 text-muted-foreground text-xs transition-colors hover:border-foreground/30 hover:text-foreground"
          >
            <Plus className="size-3" />
            Add technology
          </button>
        )}
      </div>
    </section>
  );
}
