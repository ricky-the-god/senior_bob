import { cn } from "@/lib/utils";

type Props = {
  options: string[];
  selected?: string[];
  onSelect: (v: string) => void;
  multiSelect?: boolean;
  onConfirm?: () => void;
  disabled?: boolean;
};

export function AnswerChips({
  options,
  selected = [],
  onSelect,
  multiSelect = false,
  onConfirm,
  disabled = false,
}: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isSelected = selected.includes(option);
        return (
          <button
            key={option}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(option)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs transition-colors",
              "border-foreground/10 bg-card/50 hover:border-blue-500/40 hover:bg-blue-500/5",
              isSelected && "border-blue-500/50 bg-blue-500/10 text-blue-400",
              disabled && "pointer-events-none opacity-50",
            )}
          >
            {option}
          </button>
        );
      })}
      {multiSelect && onConfirm && selected.length > 0 && (
        <button
          type="button"
          disabled={disabled}
          onClick={onConfirm}
          className={cn(
            "rounded-full border border-foreground/20 bg-foreground px-3 py-1.5 font-medium text-background text-xs transition-colors hover:opacity-90",
            disabled && "pointer-events-none opacity-50",
          )}
        >
          Confirm
        </button>
      )}
    </div>
  );
}
