"use client";

import { type KeyboardEvent, useEffect, useRef } from "react";

import { ArrowUp } from "lucide-react";

import { cn } from "@/lib/utils";

import { ChatBubble } from "./chat-bubble";
import type { ChatMessage } from "./guided-setup-types";

type Props = {
  messages: ChatMessage[];
  chips?: React.ReactNode;
  inputValue: string;
  onInputChange: (v: string) => void;
  onSubmit: () => void;
  inputPlaceholder?: string;
  inputDisabled?: boolean;
};

export function StepShell({
  messages,
  chips,
  inputValue,
  onInputChange,
  onSubmit,
  inputPlaceholder = "Type your answer…",
  inputDisabled = false,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!inputDisabled && inputValue.trim()) onSubmit();
    }
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Messages */}
      <div ref={scrollRef} className="flex flex-1 flex-col gap-3 overflow-y-auto p-6">
        {messages.map((msg) => (
          <ChatBubble key={msg.id} role={msg.role} text={msg.text} />
        ))}
      </div>

      {/* Chips slot */}
      {chips && <div className="px-6 pb-3">{chips}</div>}

      {/* Input */}
      <div className="flex gap-3 border-border border-t p-4">
        <textarea
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={inputPlaceholder}
          disabled={inputDisabled}
          rows={1}
          className={cn(
            "flex-1 resize-none rounded-lg border border-foreground/10 bg-card/50 px-3.5 py-2.5",
            "text-foreground text-sm placeholder:text-muted-foreground/50",
            "outline-none transition-all duration-150 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "max-h-32 overflow-y-auto",
          )}
        />
        <button
          type="button"
          disabled={inputDisabled || !inputValue.trim()}
          onClick={onSubmit}
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-lg border border-foreground/10 bg-foreground/5 transition-colors",
            "hover:bg-foreground/10 disabled:cursor-not-allowed disabled:opacity-40",
          )}
        >
          <ArrowUp className="size-4 text-foreground" />
        </button>
      </div>
    </div>
  );
}
