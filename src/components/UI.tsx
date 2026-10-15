import {
  useId,
  useRef,
  useState,
  useEffect,
  type ReactNode,
  type ButtonHTMLAttributes,
} from "react";
import { createPortal } from "react-dom";
import {
  ArrowUpRight,
  ChevronDown,
  X,
  Info,
  Check,
  ArrowRight,
} from "lucide-react";
import { A } from "../engine/assumptions";
import { money } from "../engine/format";
export function Button({
  children,
  variant = "",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: string }) {
  return (
    <button className={`button ${variant} ${className}`} {...props}>
      {children}
    </button>
  );
}
export function Card({
  children,
  className = "",
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`card ${className}`}>
      {children}
    </section>
  );
}
export function Chip({ children }: { children: ReactNode }) {
  return <span className="chip">{children}</span>;
}
export function Stat({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="stat">
      <span>{label}</span>
      <strong>{value}</strong>
      {detail && <small>{detail}</small>}
    </div>
  );
}
export function Disclosure({
  title,
  children,
  subtitle,
  defaultOpen = false,
}: {
  title: string;
  children: ReactNode;
  subtitle?: string;
  defaultOpen?: boolean;
}) {
  const id = useId();
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className={`disclosure ${open ? "open" : ""}`}>
      <button
        className="disclosure-trigger"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(!open)}
      >
        <span>
          {title}
          {subtitle && <small>{subtitle}</small>}
        </span>
        <ChevronDown size={20} />
      </button>
      <div id={id} hidden={!open} className="disclosure-content">
        {children}
      </div>
    </section>
  );
}
export function Field({
  label,
  value,
  onChange,
  id: givenId,
  max = A.maxRupees,
  min = 0,
  description,
  className = "",
  dark = false,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  id?: string;
  max?: number;
  min?: number;
  description?: string;
  className?: string;
  dark?: boolean;
}) {
  const auto = useId(),
    id = givenId ?? auto;
  const [error, setError] = useState("");
  return (
    <div className={`field ${dark ? "dark-field" : ""} ${className}`}>
      <label htmlFor={id}>{label}</label>
      <div className="money-input">
        <span aria-hidden="true">₹</span>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          value={value === 0 ? "" : value.toLocaleString("en-IN")}
          placeholder="0"
          aria-describedby={`${id}-hint`}
          aria-invalid={!!error}
          onBlur={() => setError("")}
          onChange={(e) => {
            const text = e.target.value.replaceAll(",", "");
            if (text !== "" && !/^\d+$/.test(text)) {
              setError("Enter a whole, positive rupee amount.");
              return;
            }
            const n = Number(text);
            if (n > max || n < min) {
              setError(`Use an amount from ${money(min)} to ${money(max)}.`);
              onChange(Math.max(min, Math.min(max, n)));
              return;
            }
            setError("");
            onChange(n);
          }}
        />
      </div>
      <span
        id={`${id}-hint`}
        className={error ? "field-error" : "field-hint"}
        aria-live="polite"
      >
        {error || description}
      </span>
    </div>
  );
}
export function Slider({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  valueText,
  disabled = false,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  step?: number;
  valueText?: string;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <div className="slider">
      <label htmlFor={id}>
        <span>{label}</span>
        <strong>{valueText ?? `${value}%`}</strong>
      </label>
      <input
        style={
          {
            "--fill": `${max > min ? ((value - min) / (max - min)) * 100 : 0}%`,
          } as React.CSSProperties
        }
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        aria-valuetext={valueText ?? `${value} percent`}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}
export function Dialog({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null),
    closeRef = useRef(onClose);
  closeRef.current = onClose;
  const id = useId();
  useEffect(() => {
    const trigger = document.activeElement as HTMLElement;
    const panel = ref.current;
    panel?.querySelector<HTMLElement>("button,input,a,select")?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeRef.current();
      if (e.key === "Tab") {
        const nodes = panel?.querySelectorAll<HTMLElement>(
          'button:not(:disabled),a[href],input:not(:disabled),select,[tabindex="0"]',
        );
        if (!nodes?.length) return;
        const first = nodes[0],
          last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", key);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", key);
      document.body.style.overflow = previous;
      trigger?.focus();
    };
  }, []);
  return createPortal(
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={ref}
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={id}
      >
        <div className="dialog-heading">
          <h2 id={id}>{title}</h2>
          <button
            className="icon-button"
            aria-label="Close dialog"
            onClick={onClose}
          >
            <X />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
export function Assumptions() {
  return (
    <div id="assumptions">
      <Disclosure title="Assumptions" subtitle="Illustrative, not predictions">
        <p>
          These constant rates help compare choices. Real returns vary, can be
          negative, and are not guaranteed. Fees and taxes are excluded; actual
          outcomes may be lower.
        </p>
        <dl className="assumption-list">
          {[
            ["Index fund", "12% p.a. / 8% conservative"],
            ["Fixed deposit", "6.5% p.a. / 6% conservative"],
            ["Emergency savings", "3% p.a., shown for context only"],
            ["Inflation", "5% p.a."],
            ["Starting emergency target", "3 × monthly essentials"],
          ].map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        <p>
          Monthly rates = annual rates ÷ 12. Contributions arrive at month-end.
          Emergency savings are tracked separately without interest and excluded
          from the goal. No starting investment balance. The horizon is capped
          at 60 years.
        </p>
      </Disclosure>
    </div>
  );
}
export function ProjectionNote() {
  return (
    <p className="projection-note">
      <Info size={15} />
      <span>
        Projection, not a promise.{" "}
        <a href="#assumptions">
          See assumptions <ArrowUpRight size={12} />
        </a>
      </span>
    </p>
  );
}
export function SectionHeading({
  eyebrow,
  title,
  detail,
}: {
  eyebrow?: string;
  title: string;
  detail?: string;
}) {
  return (
    <div className="section-heading">
      {eyebrow && <div className="eyebrow">{eyebrow}</div>}
      <h2>{title}</h2>
      {detail && <p>{detail}</p>}
    </div>
  );
}
export function NextArrow() {
  return <ArrowRight size={18} />;
}
export function Notice({
  children,
  success = false,
}: {
  children: ReactNode;
  success?: boolean;
}) {
  return (
    <div className={`notice ${success ? "success" : ""}`} role="status">
      {success ? <Check size={18} /> : <Info size={18} />}
      <span>{children}</span>
    </div>
  );
}
