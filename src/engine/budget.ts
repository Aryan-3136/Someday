import { A, type Plan } from "./assumptions";
export const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));
export const rupees = (value: string | number) =>
  clamp(Math.round(Number(value) || 0), 0, A.maxRupees);
export const outgoing = (p: Plan) => p.essentials + p.personal + p.other;
export const available = (p: Plan) => p.income - outgoing(p);
export const contributionLimit = (p: Plan) => Math.max(0, available(p));
export const normalize = (p: Plan): Plan => ({
  ...p,
  contribution: clamp(p.contribution, 0, contributionLimit(p)),
});
export const breathingRoom = (p: Plan) => available(p) - p.contribution;
export const allocations = (p: Plan) => {
  const emergency = p.contribution * p.emergencySplit;
  const longTerm = p.contribution - emergency;
  return {
    emergency,
    longTerm,
    growth: longTerm * p.growthSplit,
    predictable: longTerm * (1 - p.growthSplit),
  };
};
export const bufferTarget = (p: Plan) => A.bufferMonths * p.essentials;

export const emergencyAfter = (p: Plan, months: number) =>
  p.existingEmergency + allocations(p).emergency * months;
