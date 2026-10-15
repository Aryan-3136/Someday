import { A, type Plan } from "./assumptions";
import { available } from "./budget";
export const PLAN_KEY = "someday:v1";
export const CHECK_KEY = "someday:checkins:v1";
export function validatePlan(p: unknown): p is Plan {
  if (!p || typeof p !== "object") return false;
  const o = p as Record<string, unknown>;
  const keys = [
    "income",
    "essentials",
    "personal",
    "other",
    "contribution",
    "goal",
    "existingEmergency",
  ];
  if (
    !keys.every(
      (k) =>
        typeof o[k] === "number" &&
        Number.isInteger(o[k]) &&
        (o[k] as number) >= 0 &&
        (o[k] as number) <= A.maxRupees,
    )
  )
    return false;
  if (
    !["emergencySplit", "growthSplit"].every(
      (k) =>
        typeof o[k] === "number" &&
        Number.isFinite(o[k]) &&
        (o[k] as number) >= 0 &&
        (o[k] as number) <= 1,
    )
  )
    return false;
  return (
    (o.goal as number) > 0 &&
    (o.contribution as number) <= Math.max(0, available(o as unknown as Plan))
  );
}
export function decode(raw: string): Plan {
  const value: unknown = JSON.parse(raw);
  if (
    !value ||
    typeof value !== "object" ||
    !("version" in value) ||
    value.version !== 1 ||
    !("plan" in value) ||
    !validatePlan(value.plan)
  )
    throw new Error("Invalid saved plan");
  return value.plan;
}
export function loadPlan(): {
  plan: Plan | null;
  notice: string;
  discard?: boolean;
} {
  try {
    const raw = localStorage.getItem(PLAN_KEY);
    if (!raw) return { plan: null, notice: "" };
    try {
      return { plan: decode(raw), notice: "" };
    } catch {
      return {
        plan: null,
        notice:
          "The saved data could not be read. We discarded it so you can start fresh.",
        discard: true,
      };
    }
  } catch {
    return {
      plan: null,
      notice:
        "Browser storage is unavailable. You can still explore, download, and print your plan.",
    };
  }
}
export function savePlan(plan: Plan) {
  try {
    localStorage.setItem(PLAN_KEY, JSON.stringify({ version: 1, plan }));
    return true;
  } catch {
    return false;
  }
}
export function removePlan() {
  try {
    localStorage.removeItem(PLAN_KEY);
    return true;
  } catch {
    return false;
  }
}
export function loadCheckins(): string[] {
  try {
    const raw = localStorage.getItem(CHECK_KEY);
    if (!raw) return [];
    const x: unknown = JSON.parse(raw);
    return Array.isArray(x) &&
      x.every((v) => typeof v === "string" && Number.isFinite(Date.parse(v)))
      ? x.slice(0, 12)
      : [];
  } catch {
    return [];
  }
}
export function saveCheckins(dates: string[]) {
  try {
    localStorage.setItem(CHECK_KEY, JSON.stringify(dates.slice(0, 12)));
    return true;
  } catch {
    return false;
  }
}
