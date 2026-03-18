import { describe, expect, it } from "vitest";

import { DEFAULT_PROJECT_META, parseProjectMeta } from "../project-types";

describe("parseProjectMeta", () => {
  it("returns default meta for null input", () => {
    expect(parseProjectMeta(null)).toEqual(DEFAULT_PROJECT_META);
  });

  it("returns default meta for empty string", () => {
    expect(parseProjectMeta("")).toEqual(DEFAULT_PROJECT_META);
  });

  it("returns default meta for invalid JSON", () => {
    expect(parseProjectMeta("not json {{{")).toEqual(DEFAULT_PROJECT_META);
  });

  it("parses valid JSON and merges with defaults", () => {
    const input = JSON.stringify({ app_type: "saas", is_new_app: true });
    const result = parseProjectMeta(input);
    expect(result.app_type).toBe("saas");
    expect(result.is_new_app).toBe(true);
    expect(result.bio).toBeNull(); // default preserved
  });

  it("partial input preserves unset defaults as null", () => {
    const input = JSON.stringify({ app_type: "api" });
    const result = parseProjectMeta(input);
    expect(result.app_type).toBe("api");
    expect(result.infra).toBeNull();
    expect(result.user_scale).toBeNull();
  });
});
