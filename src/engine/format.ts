const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
export const money = (n: number) => currency.format(Number.isFinite(n) ? n : 0);
export const shortMoney = (n: number) =>
  Math.abs(n) >= 1e7
    ? `₹${+(n / 1e7).toFixed(1)} crore`
    : Math.abs(n) >= 1e5
      ? `₹${+(n / 1e5).toFixed(1)} lakh`
      : money(n);
export const duration = (m: number) =>
  `${Math.floor(m / 12)} years${m % 12 ? ` ${m % 12} months` : ""}`;
export const dateLabel = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
