import * as Sentry from "@sentry/node";

export function notFoundHandler(_req, res) {
  res.status(404).json({ error: "Route not found" });
}

export function errorHandler(error, _req, res, _next) {
  Sentry.captureException(error);
  console.error(error);

  if (res.headersSent) return;

  res.status(500).json({
    error: "Internal server error"
  });
}
