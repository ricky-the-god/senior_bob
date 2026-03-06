import type { LucideIcon } from "lucide-react";

type Props = {
  title: string;
  subtitle: string;
  emptyTitle: string;
  emptyDescription: string;
  icon: LucideIcon;
};

export function CanvasPlaceholder({ title, subtitle, emptyTitle, emptyDescription, icon: Icon }: Props) {
  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto">
      {/* Header */}
      <div>
        <h1 className="font-semibold text-foreground text-lg tracking-tight">{title}</h1>
        <p className="mt-1 text-muted-foreground text-xs">{subtitle}</p>
      </div>

      {/* Empty state */}
      <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-xl border border-border border-dashed py-20 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-card">
          <Icon className="size-5 text-foreground/30" />
        </div>
        <div>
          <p className="font-medium text-foreground text-sm">{emptyTitle}</p>
          <p className="mt-1 max-w-xs text-muted-foreground text-xs leading-relaxed">{emptyDescription}</p>
        </div>
      </div>
    </div>
  );
}
