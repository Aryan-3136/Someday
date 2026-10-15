import { useEffect, useState } from "react";
import {
  NavLink,
  Routes,
  Route,
  Navigate,
  Link,
  useLocation,
} from "react-router-dom";
import {
  Wallet,
  TrendingUp,
  NotebookPen,
  HelpCircle,
  ArrowUpRight,
  Sun,
  Check,
  PenLine,
  RotateCcw,
  Trash2,
  Info,
  X,
} from "lucide-react";
import { usePlan } from "./state/PlanProvider";
import { Button, Dialog, Disclosure, Notice } from "./components/UI";
import MyMonth from "./screens/MyMonth";
import MyFuture from "./screens/MyFuture";
import MyPlan from "./screens/MyPlan";
const nav = [
  { path: "/month", label: "My month", Icon: Wallet, number: "01" },
  { path: "/future", label: "My future", Icon: TrendingUp, number: "02" },
  { path: "/plan", label: "My plan", Icon: NotebookPen, number: "03" },
];
function Logo() {
  return (
    <Link to="/month" aria-label="Someday home" className="logo">
      <span className="logo-mark">
        <Sun size={23} />
      </span>
      Someday<span className="logo-period">.</span>
    </Link>
  );
}
export default function App() {
  const { status, notice, setNotice, toast, setToast, saved, restore, reset } =
    usePlan();
  const [dialog, setDialog] = useState<"help" | "reset" | null>(null),
    [clearSaved, setClearSaved] = useState(false);
  const location = useLocation();
  const [announcement, setAnnouncement] = useState("");
  useEffect(() => {
    const name =
      nav.find((n) => n.path === location.pathname)?.label ?? "Page not found";
    document.title = `${name} — Someday`;
    setAnnouncement(name);
    requestAnimationFrame(() =>
      document.querySelector<HTMLElement>("h1")?.focus({ preventScroll: true }),
    );
    window.scrollTo(0, 0);
  }, [location.pathname]);
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(""), 4500);
      return () => clearTimeout(t);
    }
  }, [toast, setToast]);
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <aside className="sidebar">
        <Logo />
        <div className="sidebar-caption">MAKE ROOM FOR SOMEDAY.</div>
        <nav aria-label="Primary">
          {nav.map(({ path, label, Icon, number }) => (
            <NavLink key={path} to={path}>
              <Icon size={20} />
              <span>{label}</span>
              <small>{number}</small>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-message">
            <span>✳</span>
            <p>
              A little intention.
              <br />A lot of possibility.
            </p>
          </div>
          <button className="help-button" onClick={() => setDialog("help")}>
            <HelpCircle size={19} />A little help
            <ArrowUpRight size={15} />
          </button>
          <span className="sidebar-footnote">
            YOUR PACE. YOUR POSSIBILITIES.
          </span>
        </div>
      </aside>
      <div className="app-body">
        <header className="topbar">
          <div className="desktop-breadcrumb">
            Your everyday <span>/</span> Your someday
          </div>
          <div className="mobile-logo">
            <Logo />
          </div>
          <div className="topbar-actions">
            <span
              className={`status-badge ${status === "Saved" ? "is-saved" : ""}`}
            >
              {status === "Saved" ? <Check size={13} /> : <PenLine size={13} />}{" "}
              {status}
            </span>
            {saved && (
              <button className="text-button restore" onClick={restore}>
                <RotateCcw size={14} />
                Restore saved copy
              </button>
            )}
            <button
              className="icon-button reset-button"
              aria-label="Reset budget"
              onClick={() => setDialog("reset")}
            >
              <RotateCcw size={17} />
            </button>
            <button
              className="icon-button mobile-help"
              aria-label="Help"
              onClick={() => setDialog("help")}
            >
              <HelpCircle size={19} />
            </button>
          </div>
        </header>
        <main id="main">
          <div className="sr-only" aria-live="polite">
            {announcement}
          </div>
          {notice && (
            <div className="global-notice">
              <Notice>{notice}</Notice>
              <button
                className="icon-button"
                aria-label="Dismiss notice"
                onClick={() => setNotice("")}
              >
                <X size={16} />
              </button>
            </div>
          )}
          <Routes>
            <Route path="/" element={<Navigate to="/month" replace />} />
            <Route path="/month" element={<MyMonth />} />
            <Route path="/future" element={<MyFuture />} />
            <Route path="/plan" element={<MyPlan />} />
            <Route
              path="*"
              element={
                <div className="hero not-found">
                  <span className="eyebrow">A SMALL DETOUR · 404</span>
                  <h1 tabIndex={-1}>
                    Let’s find
                    <br />
                    <em>your way back.</em>
                  </h1>
                  <p>This page isn’t here, but your next step is.</p>
                  <Link className="button primary" to="/month">
                    My month <ArrowUpRight size={16} />
                  </Link>
                  <Link className="text-button" to="/future">
                    My future
                  </Link>
                  <Link className="text-button" to="/plan">
                    My plan
                  </Link>
                </div>
              }
            />
          </Routes>
          <footer>
            <span className="footer-brand">
              Someday<span>.</span>
            </span>
            <p>
              Educational planning tool, not financial advice.
              <br />
              Doesn’t make or recommend specific investments.
            </p>
            <button className="text-button" onClick={() => setDialog("help")}>
              Made for your first step <ArrowUpRight size={14} />
            </button>
          </footer>
        </main>
      </div>
      <nav className="mobile-tabs" aria-label="Mobile primary">
        {nav.map(({ path, label, Icon }) => (
          <NavLink to={path} key={path}>
            <Icon size={21} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      {toast && (
        <div className="toast" role="status">
          <Check size={19} />
          {toast}
          <button
            className="icon-button"
            onClick={() => setToast("")}
            aria-label="Dismiss confirmation"
          >
            <X size={16} />
          </button>
        </div>
      )}
      {dialog === "help" && (
        <Dialog
          title="A little help for your someday."
          onClose={() => setDialog(null)}
        >
          <p>
            Someday helps you understand your money, explore your choices, and
            make an educational plan. It never moves money, connects accounts,
            or recommends a specific investment.
          </p>
          <Notice>
            <Info size={16} />
            Educational planning tool, not financial advice. Doesn’t make or
            recommend specific investments.
          </Notice>
          <Disclosure title="How to read a projection" defaultOpen>
            <p>
              A projection is a calculation using constant illustrative rates,
              not a prediction. The range compares two scenarios; it is not a
              confidence interval. Real returns can be negative. Fees, taxes and
              changing circumstances affect outcomes.
            </p>
          </Disclosure>
          <Disclosure title="A tiny glossary">
            <dl className="option-details">
              {[
                [
                  "SIP",
                  "A systematic investment plan: investing regularly, rather than a separate product.",
                ],
                [
                  "Index fund",
                  "A fund holding many companies to follow a market index. Its value can fall.",
                ],
                [
                  "FD",
                  "A fixed deposit: money held with a bank for a chosen term and agreed rate.",
                ],
                [
                  "Lock-in",
                  "A period when withdrawing is restricted or carries a penalty.",
                ],
                [
                  "Expense ratio",
                  "The yearly fund fee, deducted from its value.",
                ],
                [
                  "Inflation",
                  "Rising prices: the same money may buy less over time.",
                ],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </Disclosure>
          <Disclosure title="Privacy & saving">
            <p>
              No accounts, analytics or external services. Only clicking “Save
              my plan” stores the plan in this browser. Check-ins are stored
              separately. Clearing browser data can remove both. Download a copy
              to keep it elsewhere.
            </p>
          </Disclosure>
        </Dialog>
      )}
      {dialog === "reset" && (
        <Dialog title="A fresh start?" onClose={() => setDialog(null)}>
          <p>
            This resets your draft to a blank budget. Your saved copy can stay,
            ready whenever you want it.
          </p>
          {saved && (
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={clearSaved}
                onChange={(e) => setClearSaved(e.target.checked)}
              />
              Also delete my saved plan on this device
            </label>
          )}
          <p className="small muted">Check-in history is kept separately.</p>
          <div className="dialog-actions">
            <Button onClick={() => setDialog(null)}>Cancel</Button>
            <Button
              variant="primary"
              onClick={() => {
                reset(clearSaved);
                setDialog(null);
                setClearSaved(false);
              }}
            >
              <Trash2 size={16} />
              Reset budget
            </Button>
          </div>
        </Dialog>
      )}
    </>
  );
}
