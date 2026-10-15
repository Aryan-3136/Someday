import { A, type Plan } from "./assumptions";
import { allocations } from "./budget";
import { project, monthsToGoal } from "./projection";
export type Path = "weak" | "flat" | "resume";
export type Behaviour = "continue" | "pause" | "withdraw";
export const paths: { id: Path; name: string; description: string }[] = [
  {
    id: "weak",
    name: "Prolonged weak market",
    description: "0% for 3 years, then 6% p.a.",
  },
  {
    id: "flat",
    name: "Flat market",
    description: "0% for 2 years, then 10% p.a.",
  },
  {
    id: "resume",
    name: "Growth resumes",
    description: "12% p.a. from the next month",
  },
];
export function downturn(
  p: Plan,
  year: number,
  path: Path,
  behaviour: Behaviour,
  withdrawPercent = 0.25,
  conservative = false,
) {
  const month = year * 12;
  const before = project(p, conservative, 0, month)[month];
  const loss = before.growth * A.shock;
  let growth = before.growth - loss,
    predictable = before.predictable;
  const after = growth + predictable;
  const withdrawn = behaviour === "withdraw" ? after * withdrawPercent : 0;
  const realizedLoss = behaviour === "withdraw" ? loss * withdrawPercent : 0;
  if (behaviour === "withdraw") {
    growth *= 1 - withdrawPercent;
    predictable *= 1 - withdrawPercent;
  }
  const a = allocations(p);
  let reached: number | null = null;
  // The range measures reaching and retaining the goal after the selected shock.
  if (growth + predictable >= p.goal) reached = month;
  for (let m = month + 1; m <= A.maxMonths && reached === null; m++) {
    const since = m - month;
    const rate =
      path === "weak"
        ? since <= A.weakYears * 12
          ? 0
          : A.weakReturn
        : path === "flat"
          ? since <= A.flatYears * 12
            ? 0
            : A.flatReturn
          : conservative
            ? A.conservativeGrowth
            : A.growth;
    const add = behaviour === "pause" && since <= A.pauseMonths ? 0 : 1;
    growth = growth * (1 + rate / 12) + a.growth * add;
    predictable =
      predictable *
        (1 + (conservative ? A.conservativePredictable : A.predictable) / 12) +
      a.predictable * add;
    if (growth + predictable >= p.goal) reached = m;
  }
  if (a.longTerm === 0) reached = null;
  const base = monthsToGoal(p, conservative);
  return {
    before: before.total,
    after,
    loss,
    contributions: before.contributions,
    withdrawn,
    realizedLoss,
    months: reached,
    difference: reached !== null && base !== null ? reached - base : null,
  };
}
