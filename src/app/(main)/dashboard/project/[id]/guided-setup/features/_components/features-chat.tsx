"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import type { GuidedSetupFeatures } from "@/lib/project-types";
import { saveGuidedSetupStep } from "@/server/projects";

import { AnswerChips } from "../../_components/answer-chips";
import type { ChatMessage } from "../../_components/guided-setup-types";
import { StepShell } from "../../_components/step-shell";
import { FEATURE_OPTIONS } from "./feature-options";

type Props = {
  projectId: string;
  initialData: GuidedSetupFeatures | null;
};

type Phase = "selecting" | "custom_input" | "complete";

function makeId() {
  return crypto.randomUUID();
}

export function FeaturesChat({ projectId, initialData }: Props) {
  const router = useRouter();

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (initialData?.completed) {
      const all = [...initialData.selected, ...initialData.custom];
      return [
        {
          id: makeId(),
          role: "bot",
          text: "Based on your workflow, which core features does your product need? Select all that apply.",
        },
        { id: makeId(), role: "user", text: initialData.selected.join(", ") },
        { id: makeId(), role: "bot", text: "Got it. Anything not on the list? Add custom features below, or skip." },
        ...(initialData.custom.length > 0
          ? [{ id: makeId(), role: "user" as const, text: initialData.custom.join(", ") }]
          : [{ id: makeId(), role: "user" as const, text: "(none)" }]),
        {
          id: makeId(),
          role: "bot",
          text: `Your feature set: ${all.join(", ")}. I'll use this to shape the architecture.`,
        },
        { id: makeId(), role: "bot", text: "Step 2 complete. Now let's capture your integrations →" },
      ];
    }
    return [
      {
        id: makeId(),
        role: "bot",
        text: "Based on your workflow, which core features does your product need? Select all that apply.",
      },
    ];
  });

  const [phase, setPhase] = useState<Phase>(() => (initialData?.completed ? "complete" : "selecting"));
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(initialData?.selected ?? []);
  const [inputValue, setInputValue] = useState("");
  const [saving, setSaving] = useState(false);

  const addMessage = (msg: Omit<ChatMessage, "id">) => {
    setMessages((prev) => [...prev, { ...msg, id: makeId() }]);
  };

  const handleChipSelect = (v: string) => {
    setSelectedFeatures((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));
  };

  const handleChipConfirm = () => {
    addMessage({ role: "user", text: selectedFeatures.join(", ") });
    setPhase("custom_input");
    addMessage({ role: "bot", text: "Got it. Anything not on the list? Add custom features below, or skip." });
  };

  const handleCustomSubmit = async () => {
    const customText = inputValue.trim();
    const custom = customText
      ? customText
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    if (selectedFeatures.length === 0 && custom.length === 0) {
      toast.error("Select at least one feature or add a custom one.");
      return;
    }

    addMessage({ role: "user", text: customText || "(none)" });
    setSaving(true);

    const all = [...selectedFeatures, ...custom];
    addMessage({
      role: "bot",
      text: `Your feature set: ${all.join(", ")}. I'll use this to shape the architecture.`,
    });

    try {
      await saveGuidedSetupStep(projectId, {
        step: "features",
        data: { selected: selectedFeatures, custom, completed: true },
      });
      setPhase("complete");
      addMessage({ role: "bot", text: "Step 2 complete. Now let's capture your integrations →" });
      router.push(`/dashboard/project/${projectId}/guided-setup`);
    } catch (err) {
      toast.error("Failed to save", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setSaving(false);
    }
  };

  const chips =
    phase === "selecting" ? (
      <AnswerChips
        options={[...FEATURE_OPTIONS]}
        selected={selectedFeatures}
        onSelect={handleChipSelect}
        multiSelect
        onConfirm={handleChipConfirm}
        disabled={saving}
      />
    ) : null;

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
      chips={chips}
      inputValue={inputValue}
      onInputChange={setInputValue}
      onSubmit={() => void handleCustomSubmit()}
      inputPlaceholder={
        phase === "custom_input" ? "Add custom features (comma-separated), or leave empty to skip…" : ""
      }
      inputDisabled={saving || phase === "selecting"}
    />
  );
}
