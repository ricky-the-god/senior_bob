import { Database } from "lucide-react";

export default function SchemaPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto">
      {/* Header */}
      <div>
        <h1 className="font-semibold text-foreground text-lg tracking-tight">Schema Visualizer</h1>
        <p className="mt-1 text-muted-foreground text-xs">Visualize and explore your data models</p>
      </div>

      {/* Empty state */}
      <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-xl border border-border border-dashed py-20 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-card">
          <Database className="size-5 text-foreground/30" />
        </div>
        <div>
          <p className="font-medium text-foreground text-sm">No schema connected</p>
          <p className="mt-1 max-w-xs text-muted-foreground text-xs leading-relaxed">
            Connect a database or define your entities to visualize your data models here.
          </p>
        </div>
      </div>
    </div>
  );
}
