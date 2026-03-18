import { describe, expect, it } from "vitest";

import { DEFAULT_PROJECT_META } from "../project-types";
import { deriveArchitectureDraft, deriveInferredNeeds } from "../retrieval/derive";

const base = { ...DEFAULT_PROJECT_META };

describe("deriveInferredNeeds", () => {
  it("returns all false for empty meta", () => {
    const needs = deriveInferredNeeds(base);
    expect(needs.needsAuth).toBe(false);
    expect(needs.needsPayments).toBe(false);
    expect(needs.needsRealtime).toBe(false);
    expect(needs.needsSearch).toBe(false);
    expect(needs.needsAsyncJobs).toBe(false);
  });

  it("detects realtime from app_type", () => {
    const meta = { ...base, app_type: "realtime" as const };
    expect(deriveInferredNeeds(meta).needsRealtime).toBe(true);
  });

  it("detects realtime from features", () => {
    const meta = {
      ...base,
      guided_setup: { features: { selected: ["live updates", "websocket"], custom: [], completed: true } },
    };
    expect(deriveInferredNeeds(meta).needsRealtime).toBe(true);
  });

  it("detects search from features", () => {
    const meta = {
      ...base,
      guided_setup: { features: { selected: ["search bar", "filter results"], custom: [], completed: true } },
    };
    expect(deriveInferredNeeds(meta).needsSearch).toBe(true);
  });

  it("detects async jobs from notification feature", () => {
    const meta = {
      ...base,
      guided_setup: { features: { selected: ["email notifications"], custom: [], completed: true } },
    };
    expect(deriveInferredNeeds(meta).needsAsyncJobs).toBe(true);
  });

  it("detects external API when tools are present", () => {
    const meta = {
      ...base,
      guided_setup: {
        integrations: { tools: ["sendgrid"], constraints: null, stackPreference: null, completed: true },
      },
    };
    expect(deriveInferredNeeds(meta).needsExternalApi).toBe(true);
  });
});

describe("deriveArchitectureDraft", () => {
  it("defaults to modular-monolith style", () => {
    const draft = deriveArchitectureDraft(base);
    expect(draft.style).toBe("modular-monolith");
  });

  it("returns microservices style for microservices app_type", () => {
    const meta = { ...base, app_type: "microservices" as const };
    expect(deriveArchitectureDraft(meta).style).toBe("microservices");
  });

  it("returns serverless style for serverless infra", () => {
    const meta = { ...base, infra: "serverless" as const };
    expect(deriveArchitectureDraft(meta).style).toBe("serverless");
  });

  it("always includes API Layer and Database components", () => {
    const draft = deriveArchitectureDraft(base);
    expect(draft.components).toContain("API Layer");
    expect(draft.components).toContain("Database");
  });

  it("adds Auth Service when auth is needed", () => {
    const meta = {
      ...base,
      guided_setup: { features: { selected: ["user login"], custom: [], completed: true } },
    };
    expect(deriveArchitectureDraft(meta).components).toContain("Auth Service");
  });

  it("adds LLM Gateway when AI integration is needed", () => {
    const meta = {
      ...base,
      guided_setup: { features: { selected: ["AI generation"], custom: [], completed: true } },
    };
    expect(deriveArchitectureDraft(meta).components).toContain("LLM Gateway");
  });

  it("produces a non-empty summary", () => {
    const draft = deriveArchitectureDraft({ ...base, app_type: "saas" });
    expect(draft.summary).toMatch(/modular-monolith saas/);
  });

  it("biasMonolith is false for microservices", () => {
    const meta = { ...base, app_type: "microservices" as const };
    expect(deriveArchitectureDraft(meta).biasMonolith).toBe(false);
  });
});
