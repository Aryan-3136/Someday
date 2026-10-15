import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import { example, type Plan } from "../engine/assumptions";
import { normalize } from "../engine/budget";
import { loadPlan, savePlan, removePlan } from "../engine/storage";
interface State {
  draft: Plan;
  saved: Plan | null;
}
type Action =
  | { type: "patch"; patch: Partial<Plan> }
  | { type: "replace"; plan: Plan }
  | { type: "save" }
  | { type: "clearSaved" };
function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "patch":
      return { ...s, draft: normalize({ ...s.draft, ...a.patch }) };
    case "replace":
      return { ...s, draft: normalize(a.plan) };
    case "save":
      return { ...s, saved: { ...s.draft } };
    case "clearSaved":
      return { ...s, saved: null };
  }
}
function useModel() {
  const [initial] = useState(loadPlan);
  useEffect(() => {
    if (initial.discard) removePlan();
  }, [initial]);
  const [state, dispatch] = useReducer(reducer, {
    draft: initial.plan ?? { ...example },
    saved: initial.plan,
  });
  const [notice, setNotice] = useState(initial.notice);
  const [toast, setToast] = useState("");
  const status = !state.saved
    ? "Draft"
    : JSON.stringify(state.saved) === JSON.stringify(state.draft)
      ? "Saved"
      : "Unsaved changes";
  const patch = (patch: Partial<Plan>) => {
    const next = normalize({ ...state.draft, ...patch });
    if (
      next.contribution < state.draft.contribution &&
      !("contribution" in patch)
    )
      setNotice(
        `Your monthly contribution was reduced to ₹${next.contribution.toLocaleString("en-IN")} to fit this budget.`,
      );
    dispatch({ type: "patch", patch });
  };
  const save = () => {
    if (savePlan(state.draft)) {
      dispatch({ type: "save" });
      setToast("Your plan is saved on this device.");
      setNotice("");
    } else
      setNotice(
        "We couldn't save in this browser. Download or print your plan to keep a copy.",
      );
  };
  const restore = () => {
    if (state.saved) {
      dispatch({ type: "replace", plan: state.saved });
      setToast("Saved copy restored.");
    }
  };
  const reset = (clear: boolean) => {
    dispatch({
      type: "replace",
      plan: {
        ...example,
        income: 0,
        essentials: 0,
        personal: 0,
        other: 0,
        contribution: 0,
      },
    });
    if (clear) {
      if (removePlan()) dispatch({ type: "clearSaved" });
      else setNotice("We couldn't clear the saved copy in this browser.");
    }
    setToast("Your draft is now a blank budget.");
  };
  return {
    ...state,
    status,
    notice,
    setNotice,
    toast,
    setToast,
    patch,
    save,
    restore,
    reset,
    replace: (plan: Plan) => dispatch({ type: "replace", plan }),
  };
}
const Context = createContext<ReturnType<typeof useModel> | null>(null);
export function PlanProvider({ children }: { children: ReactNode }) {
  const model = useModel();
  return <Context.Provider value={model}>{children}</Context.Provider>;
}
export function usePlan() {
  const model = useContext(Context);
  if (!model) throw new Error("PlanProvider required");
  return model;
}
