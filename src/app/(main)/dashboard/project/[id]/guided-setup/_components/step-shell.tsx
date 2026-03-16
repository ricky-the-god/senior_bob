"use client";

import { type KeyboardEvent, useCallback, useEffect, useRef, useState } from "react";

import { AnimatePresence, motion } from "framer-motion";
import { Paperclip } from "lucide-react";

import { ChatVanishInput, type ChatVanishInputHandle } from "@/components/ui/chat-vanish-input";
import { cn } from "@/lib/utils";

import { ChatBubble, TypingBubble } from "./chat-bubble";
import type { ChatMessage } from "./guided-setup-types";

type Props = {
  messages: ChatMessage[];
  chips?: React.ReactNode;
  inputValue: string;
  onInputChange: (v: string) => void;
  onSubmit: () => void;
  inputPlaceholder?: string;
  inputPlaceholders?: string[];
  inputDisabled?: boolean;
  botTyping?: boolean;
};

// Animated send arrow — exact replica from the reference
function SendArrow({ hasValue }: { hasValue: boolean }) {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-label="Send"
      role="img"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <motion.path
        d="M5 12l14 0"
        initial={{ strokeDasharray: "50%", strokeDashoffset: "50%" }}
        animate={{ strokeDashoffset: hasValue ? "0%" : "50%" }}
        transition={{ duration: 0.3, ease: "linear" }}
      />
      <path d="M13 18l6 -6" />
      <path d="M13 6l6 6" />
    </motion.svg>
  );
}

export function StepShell({
  messages,
  chips,
  inputValue,
  onInputChange,
  onSubmit,
  inputPlaceholder = "Type your answer…",
  inputPlaceholders,
  inputDisabled = false,
  botTyping = false,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const vanishRef = useRef<ChatVanishInputHandle>(null);
  const [inputFocused, setInputFocused] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [adjustHeight]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!inputDisabled && inputValue.trim()) onSubmit();
    }
  };

  const showVanish = !!inputPlaceholders && inputPlaceholders.length > 0 && !inputDisabled;

  const handleSend = () => {
    if (inputDisabled || !inputValue.trim()) return;
    if (showVanish) {
      vanishRef.current?.submit();
    } else {
      onSubmit();
    }
  };

  const sendEnabled = !inputDisabled && !!inputValue.trim();

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      {/* Ambient gradient orbs — behind everything */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 h-96 w-96 animate-pulse rounded-full bg-violet-500/[0.07] mix-blend-multiply blur-[128px] filter dark:bg-violet-500/10 dark:mix-blend-normal" />
        <div className="absolute right-1/4 bottom-0 h-96 w-96 animate-pulse rounded-full bg-indigo-500/[0.07] mix-blend-multiply blur-[128px] filter [animation-delay:700ms] dark:bg-indigo-500/10 dark:mix-blend-normal" />
        <div className="absolute top-1/4 right-1/3 h-64 w-64 animate-pulse rounded-full bg-fuchsia-500/[0.05] mix-blend-multiply blur-[96px] filter [animation-delay:1000ms] dark:bg-fuchsia-500/10 dark:mix-blend-normal" />
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="relative flex flex-1 flex-col gap-3 overflow-y-auto p-6">
        {messages.map((msg) => (
          <ChatBubble key={msg.id} role={msg.role} text={msg.text} />
        ))}
        <AnimatePresence>{botTyping && <TypingBubble />}</AnimatePresence>
      </div>

      {/* Chips slot */}
      {chips && <div className="relative px-4 pb-2">{chips}</div>}

      {/* Input panel — glass card matching the reference exactly */}
      <div className="relative px-4 pb-4">
        <motion.div
          className={cn(
            "rounded-2xl border shadow-2xl",
            "backdrop-blur-2xl",
            "bg-white/80 dark:bg-white/[0.02]",
            "border-black/[0.06] dark:border-white/[0.05]",
          )}
          initial={{ scale: 0.98, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {/* Text input area */}
          <div className="p-4 pb-0">
            {showVanish ? (
              <ChatVanishInput
                ref={vanishRef}
                placeholders={inputPlaceholders}
                value={inputValue}
                onChange={onInputChange}
                onSubmit={onSubmit}
                disabled={inputDisabled}
              />
            ) : (
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => {
                  onInputChange(e.target.value);
                  adjustHeight();
                }}
                onKeyDown={handleKeyDown}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                placeholder={inputPlaceholder}
                disabled={inputDisabled}
                rows={1}
                className={cn(
                  "w-full resize-none bg-transparent text-sm",
                  "text-foreground/90 dark:text-white/90",
                  "placeholder:text-foreground/30 dark:placeholder:text-white/20",
                  "border-none outline-none focus:outline-none focus:ring-0",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  "max-h-32 min-h-[60px]",
                )}
                style={{ overflow: "hidden" }}
              />
            )}
          </div>

          {/* Toolbar row */}
          <div
            className={cn(
              "flex items-center justify-between gap-4 p-4",
              "border-t",
              "border-black/[0.06] dark:border-white/[0.05]",
            )}
          >
            {/* Left: icon action buttons */}
            <div className="flex items-center gap-1">
              <motion.button
                type="button"
                whileTap={{ scale: 0.94 }}
                disabled={inputDisabled}
                className={cn(
                  "relative rounded-lg p-2 transition-colors",
                  "dark:text-white/40 dark:hover:text-white/90",
                  "text-foreground/40 hover:text-foreground/90",
                  "disabled:cursor-not-allowed disabled:opacity-30",
                  "group",
                )}
              >
                <Paperclip className="h-4 w-4" />
                <span className="absolute inset-0 rounded-lg bg-black/[0.04] opacity-0 transition-opacity group-hover:opacity-100 dark:bg-white/[0.05]" />
              </motion.button>
            </div>

            {/* Right: Send button */}
            <motion.button
              type="button"
              onClick={handleSend}
              disabled={!sendEnabled}
              whileHover={sendEnabled ? { scale: 1.01 } : {}}
              whileTap={sendEnabled ? { scale: 0.98 } : {}}
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-2 font-medium text-sm transition-all duration-200",
                sendEnabled
                  ? "bg-foreground text-background shadow-lg dark:bg-white dark:text-[#0A0A0B] dark:shadow-white/10"
                  : "cursor-not-allowed bg-foreground/[0.05] text-foreground/40 dark:bg-white/[0.05] dark:text-white/40",
              )}
            >
              <SendArrow hasValue={sendEnabled} />
              <span>Send</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Mouse-tracking focus glow — only shown when textarea is focused */}
        <AnimatePresence>
          {inputFocused && (
            <motion.div
              className="-z-10 pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500 opacity-[0.03] blur-[64px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.03 }}
              exit={{ opacity: 0 }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
