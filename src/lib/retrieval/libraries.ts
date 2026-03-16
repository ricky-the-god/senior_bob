import type { RetrievalSignals } from "./classify";
import type { KnowledgeEntry } from "./knowledge-base";
import { queryKnowledge } from "./knowledge-base";

function formatEntries(entries: KnowledgeEntry[], header: string): string {
  if (entries.length === 0) return "";
  const body = entries.map((e) => `\n### ${e.title}\n${e.content}`).join("\n");
  return `## ${header}${body}`;
}

/**
 * Phase 1 — Guided Setup: lightweight hints to improve question quality.
 */
export function getPhase1Library(signals: RetrievalSignals): string {
  const entries = queryKnowledge(signals, "guided-setup");
  return formatEntries(entries, "Architectural Guidance (Phase 1 — Guided Setup)");
}

/**
 * Phase 2 — System Design: heavy architecture patterns and guardrails.
 */
export function getPhase2Library(signals: RetrievalSignals): string {
  const entries = queryKnowledge(signals, "system-design");
  return formatEntries(entries, "Architectural Guidance (Phase 2 — System Design)");
}

/**
 * Phase 3 — Output Pack: structural templates for ADRs and Claude Code prompts.
 */
export function getPhase3Library(signals: RetrievalSignals): string {
  const entries = queryKnowledge(signals, "output-pack");
  return formatEntries(entries, "Architectural Guidance (Phase 3 — Output Pack)");
}
