import { A, type Plan } from "./assumptions";
import { allocations } from "./budget";
export interface Point {
  month: number;
  growth: number;
  predictable: number;
  total: number;
  contributions: number;
  emergency: number;
}
export function project(
  p: Plan,
  conservative = false,
  stepUp = 0,
  months: number = A.maxMonths,
): Point[] {
  const a = allocations(p);
  let growth = 0,
    predictable = 0,
    contributions = 0,
    emergency = p.existingEmergency;
  const points: Point[] = [
    { month: 0, growth, predictable, total: 0, contributions, emergency },
  ];
  for (let m = 1; m <= months; m++) {
    const step = (1 + stepUp) ** Math.floor((m - 1) / 12);
    growth =
      growth * (1 + (conservative ? A.conservativeGrowth : A.growth) / 12) +
      a.growth * step;
    predictable =
      predictable *
        (1 + (conservative ? A.conservativePredictable : A.predictable) / 12) +
      a.predictable * step;
    contributions += a.longTerm * step;
    emergency += a.emergency * step;
    points.push({
      month: m,
      growth,
      predictable,
      total: growth + predictable,
      contributions,
      emergency,
    });
  }
  return points;
}
export function monthsToGoal(
  p: Plan,
  conservative = false,
  stepUp = 0,
): number | null {
  if (allocations(p).longTerm <= 0) return null;
  return (
    project(p, conservative, stepUp).find((x) => x.total >= p.goal)?.month ??
    null
  );
}
export const timeline = (
  p: Plan,
  stepUp = 0,
): [number | null, number | null] => [
  monthsToGoal(p, false, stepUp),
  monthsToGoal(p, true, stepUp),
];
export const realValue = (nominal: number, months: number) =>
  nominal / (1 + A.inflation) ** (months / 12);
export function rangeLabel(range: [number | null, number | null]) {
  const [a, b] = range;
  if (a === null) return "Not within 60 years at this amount";
  if (b === null) return `Roughly ${Math.ceil(a / 12)} to over 60 years`;
  const lo = Math.ceil(a / 12),
    hi = Math.ceil(b / 12);
  return lo === hi ? `Roughly ${lo} years` : `Roughly ${lo}–${hi} years`;
}
export const sooner = (p: Plan, stepUp: number) => {
  const base = monthsToGoal(p),
    stepped = monthsToGoal(p, false, stepUp);
  return base !== null && stepped !== null ? Math.max(0, base - stepped) : null;
};
