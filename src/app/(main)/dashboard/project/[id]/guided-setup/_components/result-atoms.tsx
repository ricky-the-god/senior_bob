export function Chip({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-border bg-card/60 px-2.5 py-0.5 text-[11px] text-foreground/70">
      {label}
    </span>
  );
}

export function Section({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-xs leading-relaxed text-foreground/80">{text}</p>
    </div>
  );
}
