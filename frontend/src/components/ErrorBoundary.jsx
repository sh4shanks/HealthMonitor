import React from "react";
import * as Sentry from "@sentry/react";

export default function ErrorBoundary({ children }) {
  return (
    <Sentry.ErrorBoundary
      fallback={({ resetError }) => (
        <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div className="glass-card" style={{ maxWidth: "480px", width: "100%", padding: "32px", textAlign: "center" }}>
            <div style={{ fontSize: "40px", marginBottom: "14px" }}>⚠️</div>
            <h1 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "8px" }}>Dashboard Interrupted</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "24px" }}>
              An unexpected display issue occurred. The tracking telemetry has captured the diagnostic report.
            </p>
            <button className="btn btn-primary" onClick={resetError}>
              Reload Health Monitor
            </button>
          </div>
        </main>
      )}
      onError={(error) => Sentry.captureException(error)}
    >
      {children}
    </Sentry.ErrorBoundary>
  );
}
