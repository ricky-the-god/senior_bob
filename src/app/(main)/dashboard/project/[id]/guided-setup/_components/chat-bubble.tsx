import { Bot } from "lucide-react";

import { cn } from "@/lib/utils";

type Props = {
  role: "bot" | "user";
  text: string;
};

export function ChatBubble({ role, text }: Props) {
  if (role === "bot") {
    return (
      <div className="flex items-start gap-2">
        <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-border bg-card">
          <Bot className="size-3.5 text-muted-foreground" />
        </div>
        <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-tl-sm border border-border bg-card px-4 py-2.5 text-foreground/80 text-sm">
          {text}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-end">
      <div
        className={cn(
          "max-w-[85%] self-end whitespace-pre-wrap rounded-2xl rounded-tr-sm bg-foreground/8 px-4 py-2.5 text-foreground text-sm",
        )}
      >
        {text}
      </div>
    </div>
  );
}
