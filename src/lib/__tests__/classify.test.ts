import { describe, expect, it } from "vitest";

import { DEFAULT_PROJECT_META } from "../project-types";
import { classifyProject } from "../retrieval/classify";

const base = { ...DEFAULT_PROJECT_META };

describe("classifyProject", () => {
  it("returns all false flags for an empty meta", () => {
    const result = classifyProject(base);
    expect(result.isAiApp).toBe(false);
    expect(result.hasAuth).toBe(false);
    expect(result.hasPayments).toBe(false);
    expect(result.hasFileUpload).toBe(false);
    expect(result.isExistingCodebase).toBe(false);
  });

  it("detects AI app from features", () => {
    const meta = {
      ...base,
      guided_setup: { features: { selected: ["AI generation", "chat"], custom: [], completed: true } },
    };
    expect(classifyProject(meta).isAiApp).toBe(true);
  });

  it("detects AI app from tools", () => {
    const meta = {
      ...base,
      guided_setup: { integrations: { tools: ["openai"], constraints: null, stackPreference: null, completed: true } },
    };
    expect(classifyProject(meta).isAiApp).toBe(true);
  });

  it("detects auth from features", () => {
    const meta = {
      ...base,
      guided_setup: { features: { selected: ["User login", "signup"], custom: [], completed: true } },
    };
    expect(classifyProject(meta).hasAuth).toBe(true);
  });

  it("detects payments from stripe tool", () => {
    const meta = {
      ...base,
      guided_setup: { integrations: { tools: ["stripe"], constraints: null, stackPreference: null, completed: true } },
    };
    expect(classifyProject(meta).hasPayments).toBe(true);
  });

  it("detects file upload from features", () => {
    const meta = {
      ...base,
      guided_setup: { features: { selected: ["file upload", "storage"], custom: [], completed: true } },
    };
    expect(classifyProject(meta).hasFileUpload).toBe(true);
  });

  it("biasMonolith is false for microservices app_type", () => {
    const meta = { ...base, app_type: "microservices" as const };
    expect(classifyProject(meta).biasMonolith).toBe(false);
  });

  it("biasMonolith is true for saas app_type", () => {
    const meta = { ...base, app_type: "saas" as const };
    expect(classifyProject(meta).biasMonolith).toBe(true);
  });

  it("isExistingCodebase is true when is_new_app is false", () => {
    const meta = { ...base, is_new_app: false };
    expect(classifyProject(meta).isExistingCodebase).toBe(true);
  });
});
