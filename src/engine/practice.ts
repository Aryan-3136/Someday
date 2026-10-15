import { A, type Plan } from "./assumptions";
import { allocations } from "./budget";
export function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export interface Practice {
  month: number;
  growth: number;
  predictable: number;
  contributions: number;
  seed: number;
}
export const startPractice = (): Practice => ({
  month: 0,
  growth: 0,
  predictable: 0,
  contributions: 0,
  seed: A.practiceSeed,
});
export function advance(s: Practice, p: Plan): Practice {
  const random = mulberry32(s.seed);
  const u = Math.max(random(), 1e-10),
    v = random();
  const normal = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  const movement = A.practiceMean + A.practiceVolatility * normal;
  const a = allocations(p);
  return {
    month: s.month + 1,
    growth: Math.max(0, (s.growth + a.growth) * (1 + movement)),
    predictable: (s.predictable + a.predictable) * (1 + A.predictable / 12),
    contributions: s.contributions + a.longTerm,
    seed: Math.floor(random() * 4294967296),
  };
}

export const practiceSummary = (s: Practice) => ({
  total: s.growth + s.predictable,
  gains: s.growth + s.predictable - s.contributions,
});
