import express from "express";
import * as Sentry from "@sentry/node";

export function createDiagnosticsRouter({ enabled }) {
  const router = express.Router();
  if (!enabled) return router;

  router.post("/handled", (_req, res) => {
    const error = new Error("Intentional Backend Handled Error!");
    Sentry.captureException(error);
    res.json({ captured: true });
  });

  router.post("/async-rejection", (_req, res) => {
    setImmediate(() => {
      const error = new Error("Intentional Backend Async Error!");
      Sentry.captureException(error);
    });
    res.status(202).json({ message: "Async diagnostic error captured" });
  });

  return router;
}
