export const A = {
  growth: 0.12,
  conservativeGrowth: 0.08,
  predictable: 0.065,
  conservativePredictable: 0.06,
  emergency: 0.03,
  inflation: 0.05,
  bufferMonths: 3,
  maxMonths: 720,
  maxRupees: 10_000_000,
  shock: 0.3,
  pauseMonths: 6,
  weakYears: 3,
  flatYears: 2,
  weakReturn: 0.06,
  flatReturn: 0.1,
  practiceMean: 0.01,
  practiceVolatility: 0.045,
  practiceSeed: 3136,
} as const;
export interface Plan {
  income: number;
  essentials: number;
  personal: number;
  other: number;
  contribution: number;
  goal: number;
  emergencySplit: number;
  growthSplit: number;
  existingEmergency: number;
}
export const example: Plan = {
  income: 8000,
  essentials: 4000,
  personal: 1500,
  other: 0,
  contribution: 2000,
  goal: 1_000_000,
  emergencySplit: 0.25,
  growthSplit: 0.7,
  existingEmergency: 0,
};
