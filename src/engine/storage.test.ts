import { afterEach, describe, expect, it, vi } from "vitest";
import { example } from "./assumptions";
import {
  loadPlan,
  savePlan,
  removePlan,
  loadCheckins,
  saveCheckins,
  PLAN_KEY,
  CHECK_KEY,
  validatePlan,
} from "./storage";
afterEach(() => vi.unstubAllGlobals());
function memory() {
  const map = new Map<string, string>();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => map.set(key, value),
    removeItem: (key: string) => map.delete(key),
  });
  return map;
}
describe("storage safety", () => {
  it("reports corrupt data consistently across Strict Mode initializer calls", () => {
    const map = memory();
    map.set(PLAN_KEY, "{invalid");
    const first = loadPlan(),
      second = loadPlan();
    expect(first).toEqual(second);
    expect(first.discard).toBe(true);
    expect(first.notice).toContain("could not be read");
    expect(first.plan).toBeNull();
    expect(removePlan()).toBe(true);
    expect(loadPlan().notice).toBe("");
  });
  it("saves only on request and keeps check-ins independent of plan removal", () => {
    const map = memory();
    expect(loadPlan().plan).toBeNull();
    expect(map.size).toBe(0);
    expect(savePlan(example)).toBe(true);
    expect(loadPlan().plan).toEqual(example);
    expect(saveCheckins(["2026-10-15T12:00:00Z"])).toBe(true);
    expect(removePlan()).toBe(true);
    expect(map.has(CHECK_KEY)).toBe(true);
    expect(loadCheckins()).toEqual(["2026-10-15T12:00:00Z"]);
  });
  it("handles unavailable storage for all operations without throwing", () => {
    const fail = () => {
      throw new Error("blocked");
    };
    vi.stubGlobal("localStorage", {
      getItem: fail,
      setItem: fail,
      removeItem: fail,
    });
    expect(loadPlan().notice).toContain("unavailable");
    expect(savePlan(example)).toBe(false);
    expect(removePlan()).toBe(false);
    expect(loadCheckins()).toEqual([]);
    expect(saveCheckins([])).toBe(false);
  });
  it("rejects fractional rupees and invalid check-in history", () => {
    const map = memory();
    expect(validatePlan({ ...example, income: 8000.1 })).toBe(false);
    map.set(CHECK_KEY, JSON.stringify(["not a date"]));
    expect(loadCheckins()).toEqual([]);
  });
});
