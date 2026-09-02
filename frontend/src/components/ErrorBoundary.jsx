import React from "react";
import * as Sentry from "@sentry/react";

export default function ErrorBoundary({ children }) {
  return (
    <Sentry.ErrorBoundary
      fallback={({ resetError }) => (
        <main className="shell">
          <section className="card error-card">
            <h1>Something went wrong</h1>
            <p>The application reported the problem to our monitoring system.</p>
            <button onClick={resetError}>Try again</button>
          </section>
        </main>
      )}
      onError={(error) => Sentry.captureException(error)}
    >
      {children}
    </Sentry.ErrorBoundary>
  );
}
