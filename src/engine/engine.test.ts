import { describe, it, expect } from "vitest";
import { example, A } from "./assumptions";
import { available, normalize, rupees, allocations } from "./budget";
import { project, monthsToGoal, realValue } from "./projection";
import { downturn } from "./downturn";
import { advance, startPractice } from "./practice";
import { decode, validatePlan } from "./storage";
describe("budget", () => {
  it("finds room and reclamps on overspend", () => {
    expect(available(example)).toBe(2500);
    expect(normalize({ ...example, contribution: 3000 }).contribution).toBe(
      2500,
    );
    expect(normalize({ ...example, income: 0 }).contribution).toBe(0);
  });
  it("normalizes empty, negative and large input", () => {
    expect(rupees("")).toBe(0);
    expect(rupees(-5)).toBe(0);
    expect(rupees(1e10)).toBe(A.maxRupees);
    expect(rupees(12.8)).toBe(13);
  });
});
describe("projection", () => {
  it("matches the month-end annuity formula", () => {
    const p = {
      ...example,
      contribution: 1000,
      emergencySplit: 0,
      growthSplit: 1,
    };
    const result = project(p, false, 0, 120)[120];
    expect(result.total).toBeCloseTo(1000 * ((1.01 ** 120 - 1) / 0.01), 6);
    expect(result.total).toBeCloseTo(230038.6894, 3);
    expect(result.contributions).toBe(120000);
  });
  it("has no timeline for zero contributions or emergency-only saving", () => {
    expect(monthsToGoal({ ...example, contribution: 0 })).toBeNull();
    expect(monthsToGoal({ ...example, emergencySplit: 1 })).toBeNull();
    expect(monthsToGoal({ ...example, contribution: 1, goal: 1e7 })).toBeNull();
  });
  it("excludes emergency funds and steps up after 12 months", () => {
    const x = project(example, false, 0.1, 13);
    expect(x[12].contributions).toBe(18000);
    expect(x[13].contributions).toBe(19650);
    expect(x[12].emergency).toBe(6000);
    expect(x[12].total).toBe(x[12].growth + x[12].predictable);
  });
  it("adjusts inflation", () =>
    expect(realValue(105000, 12)).toBeCloseTo(100000));
});
describe("downturn", () => {
  it("only shocks growth holdings", () => {
    const before = project(example, false, 0, 60)[60];
    const result = downturn(example, 5, "resume", "continue");
    expect(result.after).toBeCloseTo(before.total - before.growth * 0.3);
    expect(result.contributions).toBe(allocations(example).longTerm * 60);
  });
  it("pause and withdrawal delay reaching the goal", () => {
    const normal = downturn(example, 5, "resume", "continue");
    const pause = downturn(example, 5, "resume", "pause");
    const withdraw = downturn(example, 5, "resume", "withdraw");
    expect(pause.months!).toBeGreaterThan(normal.months!);
    expect(withdraw.months!).toBeGreaterThan(normal.months!);
    expect(withdraw.withdrawn).toBeCloseTo(normal.after * 0.25);
  });
});
describe("practice and persistence", () => {
  it("is repeatable, tracks contributions and resets", () => {
    const s = startPractice();
    expect(advance(s, example)).toEqual(advance(s, example));
    expect(advance(s, example).contributions).toBe(1500);
    expect(startPractice()).toEqual(s);
  });
  it("rejects corrupt, unsupported and out-of-range saved plans", () => {
    expect(() => decode("{bad")).toThrow();
    expect(() =>
      decode(JSON.stringify({ version: 2, plan: example })),
    ).toThrow();
    expect(validatePlan({ ...example, growthSplit: 2 })).toBe(false);
    expect(validatePlan({ ...example, contribution: 9000 })).toBe(false);
    expect(validatePlan({ ...example, goal: NaN })).toBe(false);
    expect(decode(JSON.stringify({ version: 1, plan: example }))).toEqual(
      example,
    );
  });
});
