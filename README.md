# Someday — The Honest Million

A complete, frontend-only financial planning experience for a first-time saver. Understand your month, explore a possible future, and keep a plan you understand. No accounts, investment execution, analytics, environment variables, or runtime external requests.

## Run locally

Use Node.js 22 or newer (validated on Node 24) and npm.

```sh
npm install && npm run dev
```

For a reproducible install, use `npm ci`. The dev server runs on port 5173. If your machine restricts the default npm cache, use `npm ci --cache /tmp/someday-npm-cache`.

```sh
npm run test       # Vitest finance-engine tests, once
npm run build      # strict TypeScript check and Vite production build
npm run preview    # serve dist on port 4173
```

## The experience

- `/month`: editable example or blank budget, expense validation, automatic contribution clamping, and breathing room.
- `/future`: goal, emergency split, safety buffer, SVG projection chart with a year explorer and inflation view, investment mix, options comparison, and income-growth exploration.
- `/plan`: plain-language summary, explicit local save/restore/reset, text download, print/PDF, downturn comparisons, deterministic portfolio practice, and separate monthly check-ins.
- `/` redirects to `/month`. Unknown paths show an in-design 404. Route changes update the document title, move focus to the heading, and announce the screen.

The draft is held in a context/reducer. Changing a field never saves the plan. “Save my plan” explicitly writes the versioned `someday:v1` record. Check-ins use `someday:checkins:v1`. Saved data is type/range-validated. Corrupt/unknown plan data is discarded with a notice; inaccessible storage produces feedback while download and print remain available. Simulation and income-growth exploration do not alter the saved budget.

## Financial assumptions

**Illustrative, not predictions. Projection, not a promise.** Rates are constant comparison inputs, not expected market outcomes. Actual returns may be negative. Fees and taxes are not modelled and could reduce outcomes. More predictable does not mean risk-free.

| Input                          |           Illustrative |       Conservative |
| ------------------------------ | ---------------------: | -----------------: |
| Broad-market equity index fund |               12% p.a. |            8% p.a. |
| Fixed deposit                  |              6.5% p.a. |            6% p.a. |
| Emergency savings account      |  3% p.a., context only | Excluded from goal |
| Inflation                      |                5% p.a. |            5% p.a. |
| Starting emergency buffer      | 3 × monthly essentials |         Needs vary |

All engine constants and rates are in `src/engine/assumptions.ts`.

- `available = income − essentials − personal − other`; contribution clamps to `[0, max(0, available)]` after every budget update. Money inputs accept integer rupees up to ₹1 crore.
- Projections use `balance × (1 + annualRate/12) + monthlyContribution`, with month-end contributions and no initial investment holdings. Emergency contributions are excluded from investment progress and the cumulative contribution line. Emergency funds are tracked as starting savings plus deposits, without interest.
- Timeline ranges compare illustrative and conservative scenarios; they are not probability/confidence intervals. Beyond 720 months, the app explicitly reports the 60-year limit. No-contribution states do not generate a goal projection.
- Inflation view divides values by `1.05^(months/12)`. The chart's goal line remains the chosen target in today's buying power while the displayed portfolio and contribution values are adjusted. The main timeline remains nominal and is labelled separately.
- Income exploration increases contributions after each complete 12 months, by 0–20% annually. It does not change the saved plan or assume that raises are assured.
- Downturns remove 30% from growth holdings only. Emergency and predictable holdings do not suffer the shock. Continue, pause for six months, and proportional withdrawal behaviours are compared. Withdrawn money leaves the portfolio and does not compound. The revised timeline measures attaining the goal after the selected shock; choosing a fall after the original goal can extend the comparison.
- Post-fall growth paths: 0% for 3 years then 6%; 0% for 2 years then 10%; or 12% from the following month (8% in its conservative scenario). Predictable holdings continue at 6.5% / 6%. There is no guaranteed recovery.
- Practice uses mulberry32 with seed 3136 and Box–Muller normal movements: illustrative monthly mean 1%, volatility 4.5%. Contributions arrive **before** that month's movement in practice, as requested, unlike month-end planning projections. This is an educational sequence, not a calibrated market model. Reset restores the seed and all practice balances.

A known-case test verifies that ₹1,000 contributed at each month-end for 120 months at 12% p.a. compounded monthly becomes **₹2,30,038.6894**, using the exact annuity formula rather than the brief's approximate ₹2.32 lakh.

## Design and accessibility

Warm paper `#F6F6F2`, charcoal `#202526`, violet `#6255E7`, lime `#DBF58B`, and peach/sage/lavender category tints. Inter and Instrument Serif Italic are bundled locally via `@fontsource`. CSS variables and `tailwind.config.js` define the base tokens. Shared components handle fields, native sliders, disclosures, cards, notices, buttons, dialogs, statistics, and the responsive SVG chart.

Desktop uses a compact sidebar. Mobile uses a sticky header and bottom navigation. My month's mobile order is **hero → summary → contribution → budget editor**: the example immediately demonstrates what room for the future means; the editor follows with clearly labelled example/blank controls. Each input gets a full-width editing row on narrow screens. Comparison tables scroll inside their own regions. Reading copy is 15px or larger; compact metadata uses smaller type.

There is one h1 per screen, landmarks, a skip link, active navigation states, labelled controls, inline error associations, polite status announcements, focus rings, keyboard-operable native sliders, focus-trapped dialogs with Escape and focus restoration, reduced-motion support, chart text alternatives, and a print stylesheet. Help includes a glossary and the educational disclaimer. No hover-only help or native confirm dialogs.

## Browser verification

Install Chromium for Playwright if necessary:

```sh
npx playwright install chromium
npm run dev
# In another terminal:
node scripts/verify-browser.cjs
```

To use a system browser and select a screenshot directory:

```sh
CHROMIUM_PATH=/usr/bin/chromium SOMEDAY_ARTIFACTS=/tmp/someday-browser node scripts/verify-browser.cjs
```

The script runs a real Chromium journey and asserts budget edge cases, allocations and inflation, options and step-ups, save/dirty/restore, hard refresh on `/plan`, downturn controls, practice isolation/reset, check-ins, a real text download, print invocation, keyboard-only dialog focus trapping/Escape/return, reset cancellation/confirmation, Back/Forward, 404, corrupt JSON, blocked storage, no external requests, and no runtime console errors/warnings. It captures all three screens at 320, 768 and 1440px and checks page overflow at each width. The selected check-in date is displayed in India time.

## Folder map

```text
src/
  engine/
    assumptions.ts    # types, defaults and all finance constants
    budget.ts         # validation, clamping and allocation
    projection.ts     # compounding, ranges, step-up, inflation
    downturn.ts       # shock, future paths and behaviours
    practice.ts       # seeded educational simulation
    format.ts         # Indian rupees, durations and dates
    options.ts        # educational comparison content
    storage.ts        # versioned, validated and guarded storage
    engine.test.ts    # finance and validation tests
  state/PlanProvider.tsx # draft, saved copy and status reducer
  components/
    UI.tsx            # shared interaction/design components
    Chart.tsx         # accessible, responsive hand-built SVG
  screens/            # MyMonth, MyFuture, MyPlan
  App.tsx             # layout, routing, help and reset dialog
  main.tsx            # providers, router and self-hosted fonts
  index.css           # tokens, layout, responsive and print styles
scripts/verify-browser.cjs
vercel.json
```

## Deploy to Vercel

### Import the GitHub repository

1. Push this application to your GitHub repository.
2. In Vercel, choose **Add New → Project** and import `Aryan-3136/Someday`.
3. Select **Vite**, with build command `npm run build` and output directory `dist`. If imported from a parent workspace, choose `Someday` as the root directory.
4. Deploy. No environment variables are required.

### From the command line

From the repository root, with your own Vercel login:

```sh
npx vercel --prod
```

`vercel.json` rewrites routes to `/index.html`, so direct URLs and refreshes on `/month`, `/future` and `/plan` work. The app is prepared for deployment; publishing to a Vercel account is a separate action.

Educational planning tool, not financial advice. Doesn't make or recommend specific investments.
