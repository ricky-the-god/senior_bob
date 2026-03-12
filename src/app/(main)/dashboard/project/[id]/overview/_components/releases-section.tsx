"use client";

import { useState, useTransition } from "react";

import { Plus, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { Release } from "@/lib/project-types";
import { updateProjectMeta } from "@/server/projects";

type Props = {
  projectId: string;
  releases: Release[];
};

const STATUS_STYLES: Record<Release["status"], string> = {
  planned: "bg-muted text-muted-foreground",
  "in-progress": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  released: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

const EMPTY_FORM = { version: "", date: "", status: "planned" as Release["status"] };

export function ReleasesSection({ projectId, releases: initial }: Props) {
  const [releases, setReleases] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [, startTransition] = useTransition();

  function save(next: Release[]) {
    setReleases(next);
    startTransition(async () => {
      await updateProjectMeta(projectId, { releases: next.length ? next : null });
    });
  }

  function addRelease() {
    const version = form.version.trim();
    const date = form.date.trim();
    if (!version) return;
    const newRelease: Release = { id: crypto.randomUUID(), version, date, status: form.status };
    save([...releases, newRelease]);
    setForm(EMPTY_FORM);
    setShowForm(false);
  }

  function removeRelease(id: string) {
    save(releases.filter((r) => r.id !== id));
  }

  return (
    <section className="space-y-3">
      <h2 className="font-medium text-muted-foreground text-xs uppercase tracking-wider">Releases</h2>

      {releases.length === 0 && !showForm && (
        <div className="rounded-lg border border-dashed border-border bg-card/30 px-4 py-6 text-center">
          <p className="text-muted-foreground/60 text-xs">No releases tracked yet.</p>
        </div>
      )}

      <div className="space-y-1">
        {releases.map((release) => (
          <div key={release.id} className="group flex items-center gap-3 py-1.5">
            <span className="w-14 shrink-0 font-mono text-foreground text-xs">{release.version}</span>
            <span className="flex-1 text-muted-foreground text-xs">{release.date}</span>
            <Badge
              variant="outline"
              className={`h-5 border px-1.5 py-0 text-[10px] capitalize ${STATUS_STYLES[release.status]}`}
            >
              {release.status}
            </Badge>
            <button
              type="button"
              onClick={() => removeRelease(release.id)}
              className="text-muted-foreground/40 opacity-0 transition-all hover:text-destructive group-hover:opacity-100"
              aria-label="Delete release"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        ))}
      </div>

      {showForm ? (
        <div className="space-y-2 rounded-lg border border-border bg-card/50 p-3">
          <div className="flex gap-2">
            <input
              value={form.version}
              onChange={(e) => setForm((f) => ({ ...f, version: e.target.value }))}
              placeholder="v1.0.0"
              className="w-24 border-border border-b bg-transparent pb-1 font-mono text-foreground text-xs outline-none focus:border-foreground/30"
            />
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              className="flex-1 border-border border-b bg-transparent pb-1 text-foreground text-xs outline-none focus:border-foreground/30"
            />
          </div>
          <select
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as Release["status"] }))}
            className="rounded border border-border bg-card px-2 py-1 text-foreground text-xs outline-none"
          >
            <option value="planned">Planned</option>
            <option value="in-progress">In Progress</option>
            <option value="released">Released</option>
          </select>
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={addRelease}
              className="rounded bg-foreground/8 px-2.5 py-1 text-foreground text-xs transition-colors hover:bg-foreground/12"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setForm(EMPTY_FORM);
              }}
              className="px-2 text-muted-foreground text-xs transition-colors hover:text-foreground"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="mt-2 flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-muted-foreground text-xs hover:border-foreground/30 hover:text-foreground transition-colors"
        >
          <Plus className="size-3.5" />
          Add release
        </button>
      )}
    </section>
  );
}
