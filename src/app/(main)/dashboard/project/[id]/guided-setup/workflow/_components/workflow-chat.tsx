"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import type { GuidedSetupWorkflow } from "@/lib/project-types";
import { saveGuidedSetupStep } from "@/server/projects";

import type { ChatMessage } from "../../_components/guided-setup-types";
import { StepShell } from "../../_components/step-shell";

type Props = {
  projectId: string;
  initialData: GuidedSetupWorkflow | null;
};

type Phase = "waiting_goal" | "waiting_flow" | "complete";

function makeId() {
  return crypto.randomUUID();
}

export function WorkflowChat({ projectId, initialData }: Props) {
  const router = useRouter();

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (initialData?.completed) {
      return [
        { id: makeId(), role: "bot", text: "What does your app help users do? Describe the main problem it solves." },
        { id: makeId(), role: "user", text: initialData.mainGoal },
        {
          id: makeId(),
          role: "bot",
          text: `Got it — sounds like you're building something to help with: "${initialData.mainGoal}". Walk me through the main flow — what does a user do from start to finish?`,
        },
        { id: makeId(), role: "user", text: initialData.mainFlow },
        {
          id: makeId(),
          role: "bot",
          text: `Here's what I've captured:\n\n**Goal:** ${initialData.mainGoal}\n**Flow:** ${initialData.mainFlow}\n\nThis gives us a solid foundation.`,
        },
        { id: makeId(), role: "bot", text: "Step 1 complete. Let's define your core features next →" },
      ];
    }
    return [
      {
        id: makeId(),
        role: "bot",
        text: "What does your app help users do? Describe the main problem it solves.",
      },
    ];
  });

  const [phase, setPhase] = useState<Phase>(() => (initialData?.completed ? "complete" : "waiting_goal"));
  const [mainGoal, setMainGoal] = useState(initialData?.mainGoal ?? "");
  const [inputValue, setInputValue] = useState("");
  const [saving, setSaving] = useState(false);

  const addMessage = (msg: Omit<ChatMessage, "id">) => {
    setMessages((prev) => [...prev, { ...msg, id: makeId() }]);
  };

  const handleSubmit = async () => {
    const text = inputValue.trim();
    if (!text || saving) return;
    setInputValue("");
    addMessage({ role: "user", text });

    if (phase === "waiting_goal") {
      setMainGoal(text);
      setPhase("waiting_flow");
      addMessage({
        role: "bot",
        text: `Got it — sounds like you're building something to help with: "${text}". Walk me through the main flow — what does a user do from start to finish?`,
      });
      return;
    }

    if (phase === "waiting_flow") {
      const mainFlow = text;
      setSaving(true);
      addMessage({
        role: "bot",
        text: `Here's what I've captured:\n\n**Goal:** ${mainGoal}\n**Flow:** ${mainFlow}\n\nThis gives us a solid foundation.`,
      });

      try {
        await saveGuidedSetupStep(projectId, {
          step: "workflow",
          data: { mainGoal, mainFlow, completed: true },
        });
        setPhase("complete");
        addMessage({ role: "bot", text: "Step 1 complete. Let's define your core features next →" });
        router.push(`/dashboard/project/${projectId}/guided-setup`);
      } catch (err) {
        toast.error("Failed to save", {
          description: err instanceof Error ? err.message : "Unknown error",
        });
      } finally {
        setSaving(false);
      }
    }
  };

  if (phase === "complete") {
    return (
      <div className="flex flex-1 flex-col overflow-hidden">
        <StepShell
          messages={messages}
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
    <StepShell
      messages={messages}
      inputValue={inputValue}
      onInputChange={setInputValue}
      onSubmit={() => void handleSubmit()}
      inputPlaceholder={
        phase === "waiting_goal" ? "Describe the problem your app solves…" : "Walk through the main user flow…"
      }
      inputDisabled={saving}
    />
  );
}
