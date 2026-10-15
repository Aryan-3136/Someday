import { Link } from "react-router-dom";
import {
  Wallet,
  House,
  Heart,
  Receipt,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowUp,
  Sun,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  TriangleAlert,
} from "lucide-react";
import { usePlan } from "../state/PlanProvider";
import { example } from "../engine/assumptions";
import {
  available,
  outgoing,
  contributionLimit,
  breathingRoom,
} from "../engine/budget";
import { money } from "../engine/format";
import { Card, Field, Slider, Button, Notice } from "../components/UI";
export default function MyMonth() {
  const { draft: p, patch, saved, replace, restore } = usePlan();
  const room = available(p),
    limit = contributionLimit(p);
  const fields = [
    {
      key: "income" as const,
      label: "Money coming in",
      detail: "Pocket money, work, anything else.",
      Icon: Wallet,
      tint: "peach",
    },
    {
      key: "essentials" as const,
      label: "Essentials",
      detail: "Food, rent, travel, bills.",
      Icon: House,
      tint: "sage",
    },
    {
      key: "personal" as const,
      label: "Personal spending",
      detail: "Outings, subscriptions, little joys.",
      Icon: Heart,
      tint: "lavender",
    },
    {
      key: "other" as const,
      label: "Other expenses & repayments",
      detail: "The other things life asks of you.",
      Icon: Receipt,
      tint: "sand",
    },
  ];
  return (
    <>
      {saved && (
        <div className="welcome">
          <span>Welcome back. Your future is still here.</span>
          <Link to="/plan" onClick={restore}>
            Open my saved plan <ArrowUpRight size={15} />
          </Link>
        </div>
      )}
      <div className="hero month-hero">
        <div className="eyebrow">
          <span className="tiny-sun" /> A LITTLE ROOM. A LOT OF POSSIBILITY.
        </div>
        <h1 tabIndex={-1}>
          Big plans.
          <br />
          <em>Small beginnings.</em>
        </h1>
        <p>
          You don’t need to be good with money to begin. Let’s find a little
          room for your future, one month at a time.
        </p>
        <div className="hero-note">
          <span className="mini-avatars">
            <i>A</i>
            <i>Y</i>
            <i>U</i>
          </span>
          <span>For your first step. And the ones after.</span>
        </div>
        <div className="hero-orbit" aria-hidden="true">
          <div className="orbit-circle" />
          <div className="orbit-circle inner" />
          <Sun className="orbit-sun" />
          <div className="orbit-label">
            <ArrowUpRight size={18} /> YOUR FUTURE STARTS SMALL
          </div>
          <span className="orbit-star">✳</span>
        </div>
      </div>
      <div className="summary-strip">
        <div>
          <span>
            <ArrowDownLeft size={16} /> Money coming in
          </span>
          <strong>
            {money(p.income)}
            <small>/ month</small>
          </strong>
        </div>
        <div>
          <span>
            <ArrowUpRight size={16} /> Money going out
          </span>
          <strong>
            {money(outgoing(p))}
            <small>/ month</small>
          </strong>
        </div>
        <div className="summary-room">
          <span>
            <Sparkles size={16} /> Room for your future
          </span>
          <strong>
            {money(Math.max(0, room))}
            <small>/ month</small>
          </strong>
        </div>
      </div>
      {room < 0 && (
        <Notice>
          <TriangleAlert size={18} /> Going out is {money(-room)} more than
          coming in. Review essentials, personal spending, and repayments first.
          Your contribution is held at ₹0.
        </Notice>
      )}
      <div className="month-grid">
        <Card className="budget-card">
          <div className="card-heading">
            <div>
              <span className="eyebrow">01 / THE HERE & NOW</span>
              <h2>Let’s talk about your month.</h2>
            </div>
            <span className="soft-label">Monthly budget</span>
          </div>
          <p className="muted">
            A rough picture is a perfectly good place to start.
          </p>
          <div className="budget-fields">
            {fields.map(({ key, label, detail, Icon, tint }) => (
              <div className="budget-row" key={key}>
                <div className={`icon-tile ${tint}`}>
                  <Icon size={21} />
                </div>
                <div className="budget-label">
                  <label htmlFor={`budget-${key}`}>{label}</label>
                  <p>{detail}</p>
                </div>
                <Field
                  id={`budget-${key}`}
                  label={label}
                  value={p[key]}
                  onChange={(v) => patch({ [key]: v })}
                  className="budget-input"
                />
              </div>
            ))}
          </div>
          <div className="budget-bottom">
            <p>
              <InfoMark />{" "}
              {JSON.stringify(p) === JSON.stringify(example)
                ? "Example values. Make them yours."
                : "Your numbers stay on this device when saved."}
            </p>
            <button
              className="text-button"
              onClick={() =>
                replace({
                  ...example,
                  income: 0,
                  essentials: 0,
                  personal: 0,
                  other: 0,
                  contribution: 0,
                })
              }
            >
              Start with a blank budget <ArrowUpRight size={14} />
            </button>
            <button
              className="text-button"
              onClick={() => replace({ ...example })}
            >
              Use example values
            </button>
          </div>
        </Card>
        <Card className="contribution-card">
          <div className="panel-top">
            <span className="eyebrow">02 / THE SOMEDAY FUND</span>
            <span className="panel-star">✳</span>
          </div>
          <h2>
            A little now.
            <br />
            <em>A lot more possible.</em>
          </h2>
          <p>No perfect number. Just one that fits your life.</p>
          <Field
            label="Your monthly contribution"
            value={p.contribution}
            max={limit}
            onChange={(v) => patch({ contribution: v })}
            dark
            className="contribution-input"
          />
          <Slider
            label="Find your comfortable amount"
            value={p.contribution}
            max={limit}
            step={Math.max(1, Math.min(50, limit))}
            valueText={money(p.contribution)}
            disabled={limit === 0}
            onChange={(v) => patch({ contribution: v })}
          />
          <div className="slider-endpoints">
            <span>₹0</span>
            <span>{money(limit)} available</span>
          </div>
          <div className="presets">
            {[500, 1000, 2000].map((n) => (
              <button
                key={n}
                className={p.contribution === n ? "selected" : ""}
                disabled={n > limit}
                title={
                  n > limit ? "Above your available amount" : `Set ${money(n)}`
                }
                onClick={() => patch({ contribution: n })}
              >
                {money(n)}
                {n > limit && (
                  <span className="sr-only"> — above available amount</span>
                )}
              </button>
            ))}
          </div>
          {limit < 2000 && (
            <p className="preset-reason">
              Amounts above your available {money(limit)} are unavailable.
            </p>
          )}
          <div className="breathing">
            <div>
              <span>Available amount</span>
              <strong>{money(room)}</strong>
            </div>
            <div>
              <span>Breathing room left</span>
              <strong>{money(breathingRoom(p))}</strong>
            </div>
          </div>
          {limit === 0 && (
            <div className="dark-notice">
              <p>
                {p.income === 0
                  ? "Start with what you know. There’s no rush."
                  : "Learning doesn’t require investing right away."}
              </p>
              <Button
                variant="outline-light"
                onClick={() => replace({ ...example })}
              >
                Explore with the example budget
              </Button>
            </div>
          )}
          <Link className="button lime" to="/future">
            Build my future <ArrowRight size={19} />
          </Link>
          <span className="panel-footnote">
            <ShieldCheck size={14} /> No accounts to link. No money moves.
          </span>
        </Card>
      </div>
      <div className="month-bottom">
        <span className="circle-icon">
          <ArrowUp size={19} />
        </span>
        <div>
          <strong>You don’t need a lot to start.</strong>
          <p>Small, steady steps count. And so does leaving room to live.</p>
        </div>
        <span className="handwritten">One month at a time.</span>
      </div>
    </>
  );
}
function InfoMark() {
  return (
    <span aria-hidden="true" className="info-mark">
      i
    </span>
  );
}
