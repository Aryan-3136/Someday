import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Download,
  Printer,
  Check,
  ArrowUpRight,
  Shield,
  TrendingDown,
  FlaskConical,
  RefreshCw,
  ArrowRight,
  HeartHandshake,
} from "lucide-react";
import { usePlan } from "../state/PlanProvider";
import { allocations, bufferTarget } from "../engine/budget";
import { money, dateLabel, duration } from "../engine/format";
import { timeline, rangeLabel } from "../engine/projection";
import { downturn, paths, type Path, type Behaviour } from "../engine/downturn";
import { advance, startPractice, practiceSummary } from "../engine/practice";
import { loadCheckins, saveCheckins } from "../engine/storage";
import {
  Button,
  Card,
  Slider,
  Disclosure,
  Stat,
  Assumptions,
  ProjectionNote,
  Notice,
} from "../components/UI";
export default function MyPlan() {
  const {
    draft: p,
    save,
    status,
    setNotice,
    setToast,
    saved,
    restore,
  } = usePlan();
  const a = allocations(p),
    range = timeline(p);
  const [year, setYear] = useState(5),
    [path, setPath] = useState<Path>("resume"),
    [withdraw, setWithdraw] = useState(25),
    [practice, setPractice] = useState(startPractice),
    [checks, setChecks] = useState(loadCheckins);
  const shocked = downturn(p, year, path, "continue");
  const narrative = `Each month you set aside ${money(p.contribution)}: ${money(a.emergency)} for emergencies, ${money(a.growth)} for growth, and ${money(a.predictable)} for more predictable saving. At these assumptions, ${money(p.goal)} could take ${rangeLabel(range).toLowerCase()}. It is a projection, not a promise.`;
  function download() {
    const text = `SOMEDAY — YOUR PLAN\n\n${narrative}\n\nMONTHLY BUDGET\nIncome: ${money(p.income)}\nEssentials: ${money(p.essentials)}\nPersonal: ${money(p.personal)}\nOther and repayments: ${money(p.other)}\nContribution: ${money(p.contribution)}\nEmergency savings already held: ${money(p.existingEmergency)}\nStarting safety-net target: ${money(bufferTarget(p))}\n\nASSUMPTIONS — illustrative, not predictions\nGrowth: 12% p.a. (8% conservative). Fixed deposit: 6.5% p.a. (6% conservative). Inflation: 5% p.a. Emergency account: 3% p.a. for context; emergency balances tracked without interest and excluded from goal progress. Monthly compounding, month-end contributions. Rates held constant, no taxes or fees. Up to 60 years. Returns can be negative.\n\nEducational planning tool, not financial advice. Doesn't make or recommend specific investments. No investments are executed.\n`;
    const url = URL.createObjectURL(
      new Blob([text], { type: "text/plain;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "someday-my-plan.txt";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setToast("Your summary has been downloaded.");
  }
  function checkIn() {
    const dates = [new Date().toISOString(), ...checks].slice(0, 12);
    if (saveCheckins(dates)) {
      setChecks(dates);
      setToast("A little check-in, noted. See you next month.");
    } else
      setNotice(
        "We couldn't save your check-in in this browser. Your plan can still be downloaded or printed.",
      );
  }
  return (
    <>
      <div className="hero">
        <div className="eyebrow">NOT A PERFECT PLAN. YOUR PLAN.</div>
        <h1 tabIndex={-1}>
          Your money.
          <br />
          <em>With a little purpose.</em>
        </h1>
        <p>
          A clear next step. Room for real life. Something you can come back to,
          and change as you grow.
        </p>
      </div>
      <Card className="plan-summary">
        <div className="plan-summary-top">
          <div>
            <span className="eyebrow">YOUR SOMEDAY, ON ONE PAGE</span>
            <h2>
              A little every month.
              <br />
              <em>A future worth making room for.</em>
            </h2>
          </div>
          <span className="plan-seal" aria-hidden="true">
            ✳
          </span>
        </div>
        <div className="plan-key-stats">
          <Stat
            label="Your monthly contribution"
            value={money(p.contribution)}
          />
          <Stat label="The goal you’re growing toward" value={money(p.goal)} />
          <Stat
            label="Your possible timeline"
            value={a.longTerm > 0 ? rangeLabel(range) : "One step at a time"}
          />
        </div>
        <div className="plan-allocation">
          <div>
            <span className="dot lime-dot" />
            Emergency savings
            <strong>
              {money(a.emergency)}
              <small>/ month</small>
            </strong>
          </div>
          <div>
            <span className="dot purple-dot" />
            Growth-oriented
            <strong>
              {money(a.growth)}
              <small>/ month</small>
            </strong>
          </div>
          <div>
            <span className="dot gray" />
            More predictable
            <strong>
              {money(a.predictable)}
              <small>/ month</small>
            </strong>
          </div>
        </div>
        <p className="plan-narrative">
          {a.longTerm > 0
            ? narrative
            : "You don’t have to invest to make a start. Keep learning, give your budget some breathing room, and revisit your contribution when it fits your life."}
        </p>
        <ProjectionNote />
        <div className="plan-actions">
          <Button variant="lime" onClick={save}>
            <Check size={17} />
            {status === "Saved" ? "Save my plan again" : "Save my plan"}
          </Button>
          <Button variant="outline-light" onClick={download}>
            <Download size={17} />
            Download summary
          </Button>
          <Button variant="outline-light" onClick={() => window.print()}>
            <Printer size={17} />
            Print / PDF
          </Button>
        </div>
        <div className="plan-edit-links">
          <Link to="/month">
            Edit my month <ArrowUpRight size={15} />
          </Link>
          <Link to="/future">
            Edit my mix <ArrowUpRight size={15} />
          </Link>
          {saved && (
            <button className="text-button" onClick={restore}>
              Restore saved copy
            </button>
          )}
          <span>Saved only when you choose. Stored on this device.</span>
        </div>
      </Card>
      <div className="plan-extras">
        <Disclosure
          title="Good plans make room for bad years."
          subtitle="Explore a market fall before it happens"
          defaultOpen
        >
          <div className="section-icon-heading">
            <span className="icon-tile peach">
              <TrendingDown size={22} />
            </span>
            <div>
              <h3>What if the growth part falls 30%?</h3>
              <p className="muted">
                Predictable holdings are unaffected. Your emergency savings stay
                separate and untouched.
              </p>
            </div>
          </div>
          <Slider
            label="Year of the market fall"
            value={year}
            min={1}
            max={20}
            valueText={`Year ${year}`}
            onChange={setYear}
          />
          <div className="downturn-values">
            <Stat
              label="Contributions so far"
              value={money(shocked.contributions)}
            />
            <Stat label="Just before the fall" value={money(shocked.before)} />
            <Stat
              label="Just after the fall"
              value={money(shocked.after)}
              detail={`${money(shocked.loss)} illustrative fall`}
            />
          </div>
          <label className="select-field">
            What happens after the fall?
            <select
              value={path}
              onChange={(e) => setPath(e.target.value as Path)}
            >
              {paths.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.name}
                </option>
              ))}
            </select>
          </label>
          <p className="path-note">
            {paths.find((x) => x.id === path)?.description} for growth holdings.
            Predictable holdings: 6.5% p.a. (6% conservative).
          </p>
          <Disclosure title="See all three possible market paths">
            <ul className="path-list">
              {paths.map((x) => (
                <li key={x.id}>
                  <strong>{x.name}</strong>
                  <span>{x.description}</span>
                </li>
              ))}
            </ul>
            <p>
              The conservative range uses 8% for the “Growth resumes” path. Weak
              and flat paths use the stated growth rates in both scenarios.
            </p>
          </Disclosure>
          <Slider
            label="If you choose to withdraw after the fall"
            value={withdraw}
            min={5}
            max={100}
            valueText={`${withdraw}% of the post-fall value`}
            onChange={setWithdraw}
          />
          <div
            className="table-scroll"
            role="region"
            aria-label="Downturn behaviour comparison"
            tabIndex={0}
          >
            <table className="downturn-table">
              <thead>
                <tr>
                  <th>Your response</th>
                  <th>Revised timeline</th>
                  <th>vs. no fall</th>
                </tr>
              </thead>
              <tbody>
                {(["continue", "pause", "withdraw"] as Behaviour[]).map((b) => {
                  const r = downturn(p, year, path, b, withdraw / 100),
                    c = downturn(p, year, path, b, withdraw / 100, true);
                  return (
                    <tr key={b}>
                      <th>
                        {b === "continue"
                          ? "Continue contributions"
                          : b === "pause"
                            ? "Pause for 6 months"
                            : `Withdraw ${withdraw}%`}
                        <small>
                          {b === "withdraw"
                            ? `${money(r.withdrawn)} taken out; ${money(r.realizedLoss)} of the shock loss locked in. Withdrawn money no longer compounds.`
                            : b === "pause"
                              ? "A legitimate choice if money is tight."
                              : "Only if it still fits your life."}
                        </small>
                      </th>
                      <td>{rangeLabel([r.months, c.months])}</td>
                      <td>
                        {r.difference === null
                          ? "Beyond horizon"
                          : r.difference > 0
                            ? `${duration(r.difference)} longer`
                            : r.difference === 0
                              ? "No difference"
                              : `${duration(-r.difference)} sooner`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Notice>
            Past recoveries don’t guarantee future ones. These are possible
            paths, not forecasts. If you can’t afford to keep contributing,
            pausing is a legitimate choice.
          </Notice>
          <p className="small muted">
            Timelines run from the start of the plan and measure reaching the
            goal after the selected fall. A fall chosen after the original goal
            can extend the comparison.
          </p>
          <ProjectionNote />
        </Disclosure>
        <Disclosure
          title="Try it before you live it."
          subtitle="Optional portfolio practice · no real investments"
        >
          <div className="practice-banner">
            <FlaskConical size={19} />
            Practice only. These are not real investments.
          </div>
          <p className="muted">
            Advance a month to see how contributions and market movements play
            different parts. Practice uses your current draft allocations and
            never changes your saved plan.
          </p>
          <div className="practice-month">
            <span>Month {practice.month}</span>
            <h3>{money(practiceSummary(practice).total)}</h3>
            <span>Illustrative portfolio value</span>
          </div>
          <div className="practice-stats">
            <Stat
              label="Your contributions"
              value={money(practice.contributions)}
            />
            <Stat
              label="Gains / losses"
              value={money(practiceSummary(practice).gains)}
            />
          </div>
          <div className="button-row">
            <Button
              variant="primary"
              disabled={a.longTerm === 0}
              onClick={() => setPractice((s) => advance(s, p))}
            >
              Advance one month <ArrowRight size={17} />
            </Button>
            <Button onClick={() => setPractice(startPractice())}>
              <RefreshCw size={16} />
              Reset practice
            </Button>
          </div>
          {a.longTerm === 0 && (
            <p>Add a long-term contribution to try practice.</p>
          )}
          <Disclosure title="Holdings details">
            <div className="allocation-pair">
              <Stat label="Growth holdings" value={money(practice.growth)} />
              <Stat
                label="Predictable holdings"
                value={money(practice.predictable)}
              />
            </div>
            <p className="small">
              A repeatable seeded simulation adds contributions first, then
              applies a monthly growth movement with an illustrative mean of 1%
              and volatility of 4.5%. Predictable holdings accrue at 6.5% p.a.
              This sequence differs from the month-end planning projection and
              is not a model of real market probabilities.
            </p>
          </Disclosure>
          <ProjectionNote />
        </Disclosure>
      </div>
      <Card className="checkin-card">
        <span className="icon-tile sage">
          <HeartHandshake size={23} />
        </span>
        <div>
          <span className="eyebrow">A MONTHLY MOMENT</span>
          <h2>Does this still fit your life?</h2>
          <p>Life changes. A good plan can change with it.</p>
          {checks.length > 0 && (
            <p className="small">Last check-in: {dateLabel(checks[0])}</p>
          )}
          <div className="button-row">
            <Button onClick={checkIn}>
              <Check size={17} />
              Still feels right.
            </Button>
            <Link className="text-button" to="/month">
              Update my month <ArrowUpRight size={16} />
            </Link>
          </div>
          {checks.length > 0 && (
            <Disclosure title="Check-in history">
              <ul>
                {checks.map((d, i) => (
                  <li key={`${d}-${i}`}>{dateLabel(d)} · Still feels right.</li>
                ))}
              </ul>
            </Disclosure>
          )}
        </div>
      </Card>
      <Assumptions />
      <div className="safety-reminder">
        <Shield size={19} />
        <span>
          Your plan is a guide, with room for life. No investment accounts are
          connected.
        </span>
      </div>
    </>
  );
}
