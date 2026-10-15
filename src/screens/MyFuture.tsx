import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Shield,
  TrendingUp,
  ArrowUpRight,
  Leaf,
} from "lucide-react";
import { usePlan } from "../state/PlanProvider";
import { allocations, bufferTarget, emergencyAfter } from "../engine/budget";
import { money, shortMoney } from "../engine/format";
import {
  timeline,
  rangeLabel,
  project,
  realValue,
  sooner,
} from "../engine/projection";
import { options } from "../engine/options";
import {
  Card,
  Field,
  Slider,
  Disclosure,
  Stat,
  Chip,
  Assumptions,
  ProjectionNote,
  Notice,
} from "../components/UI";
import { Chart } from "../components/Chart";
export default function MyFuture() {
  const { draft: p, patch } = usePlan();
  const a = allocations(p),
    range = timeline(p);
  const [year, setYear] = useState(10),
    [real, setReal] = useState(false),
    [step, setStep] = useState(5),
    [first, setFirst] = useState(0),
    [second, setSecond] = useState(4);
  const horizon = Math.min(
    60,
    Math.max(20, Math.ceil((range[1] ?? range[0] ?? 240) / 12) + 2),
  );
  const selectedYear = Math.min(year, horizon);
  const point = project(p, false, 0, selectedYear * 12)[selectedYear * 12],
    cons = project(p, true, 0, selectedYear * 12)[selectedYear * 12];
  const display = (n: number) =>
    money(real ? realValue(n, selectedYear * 12) : n);
  const buffer = bufferTarget(p);
  const funded = buffer > 0 && p.existingEmergency >= buffer;
  const timeSaved = sooner(p, step / 100);
  return (
    <>
      <div className="hero">
        <div className="eyebrow">A PLAN YOU CAN UNDERSTAND.</div>
        <h1 tabIndex={-1}>
          Meet your
          <br />
          <em>possible future.</em>
        </h1>
        <p>
          A little clarity for a big idea. Explore what your money could do, and
          choose what feels right for you.
        </p>
      </div>
      <div className="future-top-grid">
        <Card className="goal-card">
          <span className="eyebrow">01 / GIVE YOUR SOMEDAY A NUMBER</span>
          <h2>What are you working toward?</h2>
          <Field
            label="Your goal"
            value={p.goal}
            min={1}
            onChange={(v) => patch({ goal: v })}
            className="goal-input"
          />
          <div className="presets light">
            {[500000, 1000000, 2500000].map((n) => (
              <button
                className={p.goal === n ? "selected" : ""}
                key={n}
                onClick={() => patch({ goal: n })}
              >
                {shortMoney(n)}
              </button>
            ))}
          </div>
          <p className="small muted">
            One million rupees is ₹10 lakh, not US$1 million.
          </p>
        </Card>
        <Card className="timeline-card">
          <div className="timeline-icon">
            <TrendingUp size={24} />
          </div>
          <span className="eyebrow">SMALL STEPS. A LONGER VIEW.</span>
          <h2>
            {a.longTerm > 0
              ? rangeLabel(range)
              : "Your future has room to begin."}
          </h2>
          <p>
            {a.longTerm > 0
              ? `At ${money(a.longTerm)} a month toward your goal. The range compares illustrative and conservative scenarios.`
              : "Choose a contribution and leave some for long-term investing to see a projection. Exploring is a good first step."}
          </p>
          {range[0] === null && a.longTerm > 0 && (
            <p>Try raising your contribution or lowering your goal.</p>
          )}
          <ProjectionNote />
        </Card>
      </div>
      <Card className="safety-card">
        <div className="section-icon-heading">
          <span className="icon-tile sage">
            <Shield size={22} />
          </span>
          <div>
            <span className="eyebrow">02 / FIRST, A LITTLE PEACE OF MIND</span>
            <h2>Save for life. Invest for later.</h2>
          </div>
        </div>
        <div className="split-layout">
          <div>
            <p className="muted">
              Some money for the unexpected. Some for the years ahead. You
              choose the balance.
            </p>
            <Slider
              label="For accessible emergency savings"
              value={Math.round(p.emergencySplit * 100)}
              onChange={(v) => patch({ emergencySplit: v / 100 })}
              valueText={`${Math.round(p.emergencySplit * 100)}% · ${money(a.emergency)} / month`}
            />
            <div className="allocation-pair">
              <div>
                <span className="dot sage" />
                Emergency savings
                <strong>
                  {money(a.emergency)}
                  <small>/ month</small>
                </strong>
              </div>
              <div>
                <span className="dot violet" />
                Long-term investing
                <strong>
                  {money(a.longTerm)}
                  <small>/ month</small>
                </strong>
              </div>
            </div>
            <p className="small muted">
              Emergency savings stay separate. They never count toward your
              investment goal.
            </p>
          </div>
          <div className="buffer-box">
            <Field
              label="Emergency savings you already have"
              value={p.existingEmergency}
              onChange={(v) => patch({ existingEmergency: v })}
            />
            <div className="buffer-label">
              <span>Your starting safety net</span>
              <strong>
                {money(p.existingEmergency)} / {money(buffer)}
              </strong>
            </div>
            <progress
              value={buffer ? Math.min(p.existingEmergency, buffer) : 0}
              max={buffer || 1}
              aria-label="Emergency savings toward starting buffer"
            />
            <p className="small">
              {buffer
                ? `A starting point: 3 months of essentials (${money(buffer)}). Your needs may vary.`
                : "Add your essential expenses to estimate a starting buffer."}
            </p>
            {funded ? (
              <Notice success>
                Your starting buffer is funded. Revisit your split when you’re
                ready; we won’t move money for you.
              </Notice>
            ) : (
              <p className="small muted">
                At this split, after one year you would have{" "}
                {money(emergencyAfter(p, 12))} set aside, excluding interest.
              </p>
            )}
          </div>
        </div>
        <Disclosure title="Before you invest: debt, upcoming expenses & money needed soon">
          <div className="guidance-grid">
            <div>
              <h3>High-interest debt</h3>
              <p>
                Repaying expensive debt may help more reliably than uncertain
                investment returns. Include required repayments in your month.
              </p>
            </div>
            <div>
              <h3>Upcoming expenses</h3>
              <p>
                College fees, a move, or a new laptop deserve their own
                accessible savings. A safety net is for surprises.
              </p>
            </div>
            <div>
              <h3>Money needed soon</h3>
              <p>
                Money needed within about 3 years usually shouldn’t sit in
                equities. A market fall could arrive when you need it.
              </p>
            </div>
          </div>
        </Disclosure>
      </Card>
      <Card className="chart-card">
        <div className="card-heading">
          <div>
            <span className="eyebrow">03 / LET TIME DO SOME OF THE WORK</span>
            <h2>A possible path to {shortMoney(p.goal)}.</h2>
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={real}
              onChange={(e) => setReal(e.target.checked)}
            />
            <span>Today’s money</span>
          </label>
        </div>
        <p className="muted">
          {real
            ? "Adjusted for 5% inflation: how much future money could buy in today’s rupees. The goal line shows today’s target buying power."
            : "What you put in is only part of the story. Time and uncertain returns shape the rest."}
        </p>
        {a.longTerm > 0 ? (
          <>
            <Chart plan={p} year={selectedYear} real={real} horizon={horizon} />
            <div className="chart-control">
              <Slider
                label="Take a closer look at year"
                value={selectedYear}
                min={1}
                max={horizon}
                valueText={`Year ${selectedYear}`}
                onChange={setYear}
              />
              <div className="selected-values">
                <Stat
                  label="You contributed"
                  value={display(point.contributions)}
                />
                <Stat label="Illustrative value" value={display(point.total)} />
                <Stat label="Conservative value" value={display(cons.total)} />
              </div>
            </div>
          </>
        ) : (
          <div className="empty-state">
            <Leaf />
            <h3>No rush to make a projection.</h3>
            <p>
              When there’s room in your budget, set a contribution and a
              long-term share. You can still explore the choices below.
            </p>
            <Link to="/month" className="text-button">
              Revisit my month <ArrowUpRight size={15} />
            </Link>
          </div>
        )}
        <div className="rate-chips">
          <Chip>Growth · 12% p.a.</Chip>
          <Chip>Predictable · 6.5% p.a.</Chip>
          <Chip>Conservative · 8% / 6% p.a.</Chip>
        </div>
        <ProjectionNote />
        <Disclosure title="Inflation · What’s this?">
          <p>
            Inflation means prices rise over time, so the same rupees buy less.
            Today’s money divides future values by 5% annual inflation to
            compare buying power. The goal line stays at your chosen amount in
            today’s rupees; matching that line requires more future rupees.
          </p>
        </Disclosure>
      </Card>
      <Card>
        <div className="section-icon-heading">
          <span className="icon-tile lavender">
            <TrendingUp size={22} />
          </span>
          <div>
            <span className="eyebrow">04 / FIND YOUR BALANCE</span>
            <h2>A mix that feels like you.</h2>
          </div>
        </div>
        <p className="muted">
          Growth comes with bigger ups and downs. Predictability comes with a
          slower possible path. Neither is risk-free.
        </p>
        <Slider
          label="Growth-oriented share of long-term money"
          value={Math.round(p.growthSplit * 100)}
          valueText={`${Math.round(p.growthSplit * 100)}% growth · ${100 - Math.round(p.growthSplit * 100)}% predictable`}
          onChange={(v) => patch({ growthSplit: v / 100 })}
        />
        <div className="mix-grid">
          <div className="mix-option lavender-bg">
            <div className="mix-top">
              <TrendingUp size={23} />
              <span>{Math.round(p.growthSplit * 100)}%</span>
            </div>
            <h3>Room to grow.</h3>
            <p>Broad-market index fund · illustration</p>
            <strong>
              {money(a.growth)} <small>/ month</small>
            </strong>
            <p className="small">
              Own small pieces of many companies. Values can fall sharply, so
              this money needs time.
            </p>
            <Disclosure title="Index fund · What’s this?">
              <p>
                A fund that follows a market index by owning many companies. It
                spreads company-specific risk, but cannot remove market risk. An
                expense ratio is the annual fund fee, deducted from its value.
              </p>
            </Disclosure>
          </div>
          <div className="mix-option sage-bg">
            <div className="mix-top">
              <Shield size={23} />
              <span>{100 - Math.round(p.growthSplit * 100)}%</span>
            </div>
            <h3>A steadier foundation.</h3>
            <p>Fixed deposit · illustration</p>
            <strong>
              {money(a.predictable)} <small>/ month</small>
            </strong>
            <p className="small">
              An agreed rate for a chosen term. More predictable doesn’t mean
              risk-free.
            </p>
            <Disclosure title="FD & lock-in · What’s this?">
              <p>
                A fixed deposit (FD) keeps money with a bank until a chosen
                maturity date. Lock-in means you cannot freely withdraw for a
                period; early exit can have penalties. Bank risk, tax and
                inflation still matter.
              </p>
            </Disclosure>
          </div>
        </div>
        <div className="mix-timeline">
          <span>Your current possible timeline</span>
          <strong>
            {a.longTerm > 0
              ? rangeLabel(range)
              : "Choose a long-term contribution"}
          </strong>
        </div>
        <ProjectionNote />
      </Card>
      <div className="learning-section">
        <div className="section-heading">
          <span className="eyebrow">A LITTLE KNOWLEDGE GOES A LONG WAY</span>
          <h2>Understand the choices.</h2>
          <p>
            You don’t have to learn everything today. Start with what you’re
            curious about.
          </p>
        </div>
        <div className="learning-disclosures">
          <Disclosure
            title="The options, in plain language"
            subtitle="Savings, deposits, bonds, gold and index funds"
          >
            {options.map((o) => (
              <Disclosure title={o.name} key={o.name}>
                <p>{o.description}</p>
                <dl className="option-details">
                  {[
                    ["Can it lose value?", o.loss],
                    ["Access to money", o.access],
                    ["Fees & costs", o.fees],
                    ["Lock-in / maturity", o.lock],
                    ["May be useful for", o.use],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <dt>{k}</dt>
                      <dd>{v}</dd>
                    </div>
                  ))}
                </dl>
              </Disclosure>
            ))}
          </Disclosure>
          <Disclosure
            title="Compare two options"
            subtitle="Different jobs for different kinds of money"
          >
            <div className="compare-selects">
              <label>
                First option
                <select
                  value={first}
                  onChange={(e) => {
                    const n = +e.target.value;
                    setFirst(n);
                    if (n === second) setSecond(first);
                  }}
                >
                  {options.map((o, i) => (
                    <option value={i} key={o.name}>
                      {o.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Second option
                <select
                  value={second}
                  onChange={(e) => {
                    const n = +e.target.value;
                    setSecond(n);
                    if (n === first) setFirst(second);
                  }}
                >
                  {options.map((o, i) => (
                    <option value={i} key={o.name}>
                      {o.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div
              className="table-scroll"
              tabIndex={0}
              role="region"
              aria-label="Investment options comparison"
            >
              <table>
                <thead>
                  <tr>
                    <th>What matters</th>
                    <th>{options[first].name}</th>
                    <th>{options[second].name}</th>
                  </tr>
                </thead>
                <tbody>
                  {(
                    [
                      "description",
                      "loss",
                      "access",
                      "fees",
                      "lock",
                      "use",
                    ] as const
                  ).map((k, i) => (
                    <tr key={k}>
                      <th>
                        {
                          [
                            "What it does",
                            "Can it lose value?",
                            "Access",
                            "Costs",
                            "Lock-in / maturity",
                            "Useful for",
                          ][i]
                        }
                      </th>
                      <td>{options[first][k]}</td>
                      <td>{options[second][k]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Disclosure>
          <Disclosure
            title="A SIP is a habit, not a product"
            subtitle="A small explanation for a very common term"
          >
            <p>
              A systematic investment plan (SIP) is a way of investing an amount
              regularly into a fund. It is not a separate investment, and it
              does not guarantee returns. The fund you choose determines the
              risks.
            </p>
          </Disclosure>
          <Disclosure
            title="What if my income grows?"
            subtitle="Try increasing your contribution a little each year"
          >
            <Slider
              label="Annual contribution step-up"
              value={step}
              max={20}
              onChange={setStep}
            />
            <div className="step-result">
              <Stat
                label="With unchanged contributions"
                value={rangeLabel(range)}
              />
              <Stat
                label={`With a ${step}% annual increase`}
                value={rangeLabel(timeline(p, step / 100))}
              />
            </div>
            <p>
              {timeSaved !== null
                ? `That is about ${timeSaved} months sooner in the illustrative scenario.`
                : "A comparison becomes available when a goal can be reached."}
            </p>
            <Notice>
              Exploration only. This does not change your saved budget.
              Increases start after each 12 months and assume you can afford
              them.
            </Notice>
            <ProjectionNote />
          </Disclosure>
        </div>
      </div>
      <Assumptions />
      <div className="next-section">
        <div>
          <h2>A plan you can come back to.</h2>
          <p>Your choices, together in one clear picture.</p>
        </div>
        <Link to="/plan" className="button primary">
          See my plan <ArrowRight size={18} />
        </Link>
      </div>
    </>
  );
}
