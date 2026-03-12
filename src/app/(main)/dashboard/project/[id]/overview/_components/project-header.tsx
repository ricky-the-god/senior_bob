"use client";

import { useEffect, useRef, useState, useTransition } from "react";

import { updateProjectMeta, updateProjectName } from "@/server/projects";

type Props = {
  projectId: string;
  name: string;
  bio: string | null;
};

export function ProjectHeader({ projectId, name, bio }: Props) {
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(name);
  const [bioValue, setBioValue] = useState(bio ?? "");
  const [, startTransition] = useTransition();
  const nameRef = useRef<HTMLInputElement>(null);

  // Focus the input when edit mode activates (replaces autoFocus)
  useEffect(() => {
    if (editingName) nameRef.current?.focus();
  }, [editingName]);

  function saveName() {
    setEditingName(false);
    if (nameValue.trim() === name || !nameValue.trim()) {
      setNameValue(name);
      return;
    }
    startTransition(async () => {
      await updateProjectName(projectId, nameValue.trim());
    });
  }

  function saveBio() {
    const trimmed = bioValue.trim();
    if (trimmed === (bio ?? "")) return;
    startTransition(async () => {
      await updateProjectMeta(projectId, { bio: trimmed || null });
    });
  }

  return (
    <div className="space-y-3">
      {editingName ? (
        <input
          ref={nameRef}
          value={nameValue}
          onChange={(e) => setNameValue(e.target.value)}
          onBlur={saveName}
          onKeyDown={(e) => {
            if (e.key === "Enter") saveName();
            if (e.key === "Escape") {
              setNameValue(name);
              setEditingName(false);
            }
          }}
          className="-mx-1 w-full rounded bg-transparent px-1 font-bold text-foreground text-2xl tracking-tight outline-none ring-1 ring-border focus:ring-foreground/30"
        />
      ) : (
        <button
          type="button"
          className="cursor-text text-left font-bold text-foreground text-2xl tracking-tight transition-colors hover:text-foreground/80"
          onClick={() => setEditingName(true)}
          title="Click to edit"
        >
          {nameValue}
        </button>
      )}

      <div className="rounded-xl border border-border bg-card/60 px-4 py-3">
        <textarea
          value={bioValue}
          onChange={(e) => setBioValue(e.target.value)}
          onBlur={saveBio}
          rows={2}
          placeholder="Add a project description…"
          className="w-full resize-none bg-transparent text-muted-foreground text-sm leading-relaxed outline-none placeholder:text-muted-foreground/40 focus:text-foreground"
        />
      </div>
    </div>
  );
}
