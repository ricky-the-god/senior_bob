"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useRouter } from "next/navigation";

import { type UIMessage, useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import type { GuidedSetupIntegrations } from "@/lib/project-types";
import { saveGuidedSetupStep } from "@/server/projects";

import { AnswerChips } from "../../_components/answer-chips";
import type { ChatMessage } from "../../_components/guided-setup-types";
import { StepShell } from "../../_components/step-shell";
import { TOOL_OPTIONS } from "./tool-options";

type Props = {
  projectId: string;
  initialData: GuidedSetupIntegrations | null;
};

function getMessageText(msg: UIMessage): string {
  return msg.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
}

function toDisplayMessages(msgs: UIMessage[]): ChatMessage[] {
  return msgs.map((m) => ({
    id: m.id,
    role: m.role === "assistant" ? "bot" : "user",
    text: getMessageText(m).replace("[[READY]]", "").trim(),
  }));
}

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

const INITIAL_BOT_MESSAGE: UIMessage = {
  id: "init",
  role: "assistant",
  parts: [
    {
      type: "text",
      text: "Which external tools or services will you connect to? Select from the list or describe them below.",
    },
  ],
};

export function IntegrationsChat({ projectId, initialData }: Props) {
  const router = useRouter();
  const [inputValue, setInputValue] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [isComplete, setIsComplete] = useState(() => !!initialData?.completed);
  const [chipsSent, setChipsSent] = useState(false);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const readyFiredRef = useRef(false);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/guided-setup/chat",
        fetch: async (url, options) => {
          const body = JSON.parse((options?.body as string) ?? "{}") as Record<string, unknown>;
          return fetch(url, {
            ...options,
            body: JSON.stringify({ ...body, step: "integrations", projectId }),
          });
        },
      }),
    [projectId],
  );

  const { messages, sendMessage, status } = useChat({
    transport,
    messages: [INITIAL_BOT_MESSAGE],
  });

  const handleExtractAndSave = useCallback(
    async (snapshot: UIMessage[]) => {
      setExtracting(true);
      try {
        const res = await fetch("/api/guided-setup/extract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: snapshot, step: "integrations", projectId }),
        });
        if (!res.ok) throw new Error("Extract failed");
        const data = (await res.json()) as { tools: string[]; constraints: string; stackPreference: string };
        await saveGuidedSetupStep(projectId, {
          step: "integrations",
          data: { ...data, completed: true },
        });
        setIsComplete(true);
        await delay(600);
        router.push(`/dashboard/project/${projectId}/guided-setup`);
      } catch (err) {
        toast.error("Failed to save", {
          description: err instanceof Error ? err.message : "Unknown error",
        });
        readyFiredRef.current = false;
      } finally {
        setExtracting(false);
      }
    },
    [projectId, router],
  );

  useEffect(() => {
    if (readyFiredRef.current || extracting || isComplete) return;
    const last = [...messages].reverse().find((m) => m.role === "assistant");
    if (!last) return;
    const text = getMessageText(last);
    if (!text.includes("[[READY]]")) return;
    readyFiredRef.current = true;
    void handleExtractAndSave(messages);
  }, [messages, extracting, isComplete, handleExtractAndSave]);

  const handleChipSelect = (v: string) => {
    setSelectedTools((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));
  };

  const handleToolsConfirm = () => {
    setChipsSent(true);
    sendMessage({ text: selectedTools.length > 0 ? selectedTools.join(", ") : "none" });
  };

  const chips =
    !chipsSent && messages.length <= 1 ? (
      <AnswerChips
        options={[...TOOL_OPTIONS]}
        selected={selectedTools}
        onSelect={handleChipSelect}
        multiSelect
        onConfirm={handleToolsConfirm}
        disabled={status === "streaming" || status === "submitted" || extracting}
      />
    ) : null;

  if (isComplete) {
    return (
      <div className="flex flex-1 flex-col overflow-hidden">
        <StepShell
          messages={toDisplayMessages(messages)}
          inputValue=""
          onInputChange={() => undefined}
          onSubmit={() => undefined}
          inputDisabled
        />
        <div className="border-border border-t px-6 py-4">
          <button
            type="button"
            onClick={() => router.push(`/dashboard/project/${projectId}/guided-setup`)}
            className="flex items-center gap-2 rounded-lg bg-foreground px-4 py-2.5 font-medium text-background text-sm transition-opacity hover:opacity-90"
          >
            <ArrowLeft className="size-4" />
            Back to Overview
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <StepShell
        messages={toDisplayMessages(messages)}
        chips={chips}
        inputValue={inputValue}
        onInputChange={setInputValue}
        onSubmit={() => {
          sendMessage({ text: inputValue });
          setInputValue("");
        }}
        botTyping={status === "streaming" || status === "submitted" || extracting}
        inputDisabled={status === "streaming" || status === "submitted" || extracting || isComplete}
        inputPlaceholders={[
          "Name a tool or service not in the list...",
          "Any hosting or compliance requirements?",
          "Stack preferences? (e.g. Next.js + Supabase)",
        ]}
      />
      {!chipsSent && messages.length <= 1 && (
        <div className="border-border border-t px-6 py-3">
          <button
            type="button"
            onClick={handleToolsConfirm}
            className="text-muted-foreground text-xs underline-offset-2 hover:underline"
          >
            Skip (no external tools)
          </button>
        </div>
      )}
    </div>
  );
}
