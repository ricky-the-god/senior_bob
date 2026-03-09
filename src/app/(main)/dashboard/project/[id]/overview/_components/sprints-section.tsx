import type { TaskSprint } from "@/lib/project-types";

type Props = {
  taskSprints: TaskSprint[];
};

export function SprintsSection({ taskSprints }: Props) {
  return (
    <section className="space-y-3">
      <h2 className="font-medium text-muted-foreground text-xs uppercase tracking-wider">Engineering Backlog</h2>

      {taskSprints.length === 0 ? (
        <p className="text-muted-foreground text-xs">No sprints yet — generate tasks from System Design.</p>
      ) : (
        <div className="space-y-4">
          {taskSprints.map((sprint, index) => {
            const total = sprint.tasks.length;
            const done = sprint.tasks.filter((t) => t.status === "done").length;
            const isStub = total === 0;
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
            const isComplete = !isStub && pct === 100;

            return (
              <div key={sprint.id} className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="rounded bg-foreground/8 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground/60">
                      S{index + 1}
                    </span>
                    <span className="truncate font-medium text-foreground text-xs">{sprint.name}</span>
                    {isComplete && (
                      <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[10px] text-emerald-400">
                        Complete
                      </span>
                    )}
                    {isStub && (
                      <span className="rounded-full bg-foreground/8 px-1.5 py-0.5 text-[10px] text-muted-foreground/40">
                        Pending
                      </span>
                    )}
                  </div>
                  {!isStub && (
                    <span className="shrink-0 tabular-nums text-muted-foreground text-[11px]">
                      {done}/{total} · {pct}%
                    </span>
                  )}
                </div>

                {/* Progress bar */}
                <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-foreground/6">
                  {!isStub && pct > 0 && (
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  )}
                </div>

                <p className="truncate text-muted-foreground/50 text-[11px]">{sprint.goal}</p>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
