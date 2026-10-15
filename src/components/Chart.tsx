import { useId } from "react";
import type { Plan } from "../engine/assumptions";
import { project, realValue } from "../engine/projection";
import { shortMoney, money } from "../engine/format";
export function Chart({
  plan,
  year,
  real,
  horizon,
}: {
  plan: Plan;
  year: number;
  real: boolean;
  horizon: number;
}) {
  const id = useId();
  const normal = project(plan, false, 0, horizon * 12),
    conservative = project(plan, true, 0, horizon * 12);
  const transform = (v: number, m: number) => (real ? realValue(v, m) : v);
  const values = normal.filter((x) => x.month % 12 === 0);
  const max =
    Math.max(plan.goal, ...values.map((x) => transform(x.total, x.month))) *
    1.1;
  const width = 760,
    height = 270,
    left = 62,
    right = 18,
    top = 18,
    bottom = 35;
  const x = (m: number) => left + (m / (horizon * 12)) * (width - left - right),
    y = (v: number) => height - bottom - (v / max) * (height - top - bottom);
  const path = (kind: "total" | "contributions", cons = false) =>
    values
      .map(
        (p, i) =>
          `${i ? "L" : "M"} ${x(p.month)} ${y(transform((cons ? conservative[p.month] : p)[kind], p.month))}`,
      )
      .join(" ");
  const selected = normal[year * 12];
  return (
    <>
      <div className="chart-container">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-labelledby={`${id}-title ${id}-desc`}
        >
          <title id={`${id}-title`}>
            Your possible path to {shortMoney(plan.goal)}
          </title>
          <desc id={`${id}-desc`}>
            At year {year}, contributions are{" "}
            {money(transform(selected.contributions, selected.month))}; the
            illustrative value is{" "}
            {money(transform(selected.total, selected.month))} and conservative
            value is{" "}
            {money(transform(conservative[year * 12].total, year * 12))}.
            Emergency savings are excluded.
          </desc>
          <defs>
            <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6255e7" stopOpacity=".16" />
              <stop offset="100%" stopColor="#6255e7" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0, 0.25, 0.5, 0.75, 1].map((t) => (
            <g key={t}>
              <line
                x1={left}
                x2={width - right}
                y1={y(max * t)}
                y2={y(max * t)}
                stroke="#edede7"
              />
              <text x={left - 12} y={y(max * t) + 4} textAnchor="end">
                {shortMoney(max * t)}
              </text>
            </g>
          ))}
          <line
            x1={left}
            x2={width - right}
            y1={y(plan.goal)}
            y2={y(plan.goal)}
            stroke="#7c826e"
            strokeDasharray="5 6"
          />
          <text
            x={width - right}
            y={y(plan.goal) - 8}
            textAnchor="end"
            className="goal-label"
          >
            {real ? "Goal in today’s rupees" : "Your goal"} ·{" "}
            {shortMoney(plan.goal)}
          </text>
          <path
            d={`${path("total")} L ${x(horizon * 12)} ${height - bottom} L ${left} ${height - bottom} Z`}
            fill={`url(#${id}-fill)`}
          />
          <path
            d={path("total", true)}
            fill="none"
            stroke="#879e65"
            strokeWidth="2.5"
            strokeDasharray="5 4"
          />
          <path
            d={path("contributions")}
            fill="none"
            stroke="#a1a8af"
            strokeWidth="2"
          />
          <path
            d={path("total")}
            fill="none"
            stroke="#6255e7"
            strokeWidth="3"
          />
          <line
            x1={x(year * 12)}
            x2={x(year * 12)}
            y1={top}
            y2={height - bottom}
            stroke="#6255e7"
            strokeOpacity=".3"
            strokeDasharray="3 4"
          />
          <circle
            cx={x(year * 12)}
            cy={y(transform(selected.total, selected.month))}
            r="5"
            fill="#6255e7"
            stroke="white"
            strokeWidth="3"
          />
          {[0, 0.25, 0.5, 0.75, 1].map((t) => (
            <text
              key={t}
              x={x(Math.round(horizon * t) * 12)}
              y={height - 8}
              textAnchor="middle"
            >
              {Math.round(horizon * t)} years
            </text>
          ))}
        </svg>
      </div>
      <div className="chart-legend">
        <span>
          <i className="dot violet" />
          Illustrative
        </span>
        <span>
          <i className="dot sage" />
          Conservative
        </span>
        <span>
          <i className="dot gray" />
          Your contributions
        </span>
      </div>
      <p className="sr-only">
        {real
          ? "Values are adjusted for 5% annual inflation. The goal line represents the target buying power today."
          : "Values are nominal rupees."}{" "}
        Contributions and both scenarios start at zero. Emergency savings are
        excluded. The chart is an illustration, not a prediction.
      </p>
    </>
  );
}
