import React from "react";
import { createRoot } from "react-dom/client";
import * as Sentry from "@sentry/react";
import App from "./App.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import "./styles.css";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN || undefined,
  release: import.meta.env.VITE_SENTRY_RELEASE || "release-health-monitor@1.1.1",
  environment: import.meta.env.MODE,
  integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
  tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
  replaysSessionSampleRate: import.meta.env.PROD ? 0.05 : 0,
  replaysOnErrorSampleRate: import.meta.env.PROD ? 1.0 : 0
});

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
