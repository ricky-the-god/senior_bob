"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

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

type Phase = "selecting_tools" | "constraints_input" | "stack_input" | "complete";

function makeId() {
  return crypto.randomUUID();
}

export function IntegrationsChat({ projectId, initialData }: Props) {
  const router = useRouter();

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (initialData?.completed) {
      return [
        { id: makeId(), role: "bot", text: "Which external tools or services will you connect to?" },
        { id: makeId(), role: "user", text: initialData.tools.length > 0 ? initialData.tools.join(", ") : "(none)" },
        {
          id: makeId(),
          role: "bot",
          text: "Any constraints I should know about? (hosting requirements, compliance, budget limits)",
        },
        { id: makeId(), role: "user", text: initialData.constraints || "(none)" },
        { id: makeId(), role: "bot", text: "Any strong stack preferences? (e.g. Next.js + Supabase)" },
        { id: makeId(), role: "user", text: initialData.stackPreference || "(none)" },
        {
          id: makeId(),
          role: "bot",
          text: "Guided Setup complete! 🎉 You've defined your workflow, features, and constraints. SeniorBob has everything needed to generate your architecture.",
        },
      ];
    }
    return [
      {
        id: makeId(),
        role: "bot",
        text: "Which external tools or services will you connect to?",
      },
    ];
  });

  const [phase, setPhase] = useState<Phase>(() => (initialData?.completed ? "complete" : "selecting_tools"));
  const [selectedTools, setSelectedTools] = useState<string[]>(initialData?.tools ?? []);
  const [constraints, setConstraints] = useState(initialData?.constraints ?? "");
  const [inputValue, setInputValue] = useState("");
  const [saving, setSaving] = useState(false);

  const addMessage = (msg: Omit<ChatMessage, "id">) => {
    setMessages((prev) => [...prev, { ...msg, id: makeId() }]);
  };

  const handleChipSelect = (v: string) => {
    setSelectedTools((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));
  };

  const handleToolsConfirm = () => {
    addMessage({ role: "user", text: selectedTools.length > 0 ? selectedTools.join(", ") : "(none)" });
    setPhase("constraints_input");
    addMessage({
      role: "bot",
      text: "Any constraints I should know about? (hosting requirements, compliance, budget limits)",
    });
  };

  const handleSubmit = async () => {
    const text = inputValue.trim();
    setInputValue("");

    if (phase === "constraints_input") {
      setConstraints(text);
      addMessage({ role: "user", text: text || "(none)" });
      setPhase("stack_input");
      addMessage({ role: "bot", text: "Any strong stack preferences? (e.g. Next.js + Supabase)" });
      return;
    }

    if (phase === "stack_input") {
      const stackPreference = text;
      addMessage({ role: "user", text: text || "(none)" });
      setSaving(true);

      try {
        await saveGuidedSetupStep(projectId, {
          step: "integrations",
          data: { tools: selectedTools, constraints, stackPreference, completed: true },
        });
        setPhase("complete");
        addMessage({
          role: "bot",
          text: "Guided Setup complete! You've defined your workflow, features, and constraints. SeniorBob has everything needed to generate your architecture.",
        });
      } catch (err) {
        toast.error("Failed to save", {
          description: err instanceof Error ? err.message : "Unknown error",
        });
      } finally {
        setSaving(false);
      }
    }
  };

  const chips =
    phase === "selecting_tools" ? (
      <AnswerChips
        options={[...TOOL_OPTIONS]}
        selected={selectedTools}
        onSelect={handleChipSelect}
        multiSelect
        onConfirm={handleToolsConfirm}
        disabled={saving}
      />
    ) : null;

  const inputDisabled = saving || phase === "selecting_tools" || phase === "complete";

  const placeholder =
    phase === "constraints_input"
      ? "Any constraints? (or press Enter to skip)"
      : phase === "stack_input"
        ? "Any stack preferences? (or press Enter to skip)"
        : "";

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <StepShell
        messages={messages}
        chips={chips}
        inputValue={inputValue}
        onInputChange={setInputValue}
        onSubmit={() => void handleSubmit()}
        inputPlaceholder={placeholder}
        inputDisabled={inputDisabled}
      />
      {phase === "selecting_tools" && (
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
      {phase === "complete" && (
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
      )}
    </div>
  );
}
