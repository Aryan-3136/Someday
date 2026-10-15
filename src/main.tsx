import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-500.css";
import "@fontsource/inter/latin-600.css";
import "@fontsource/inter/latin-700.css";
import "@fontsource/instrument-serif/latin-400-italic.css";
import { PlanProvider } from "./state/PlanProvider";
import App from "./App";
import "./index.css";
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <PlanProvider>
        <App />
      </PlanProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
