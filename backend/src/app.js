import * as Sentry from "@sentry/node";
import cors from "cors";
import express from "express";
import { config } from "./config.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { createRateLimiter, securityHeaders } from "./middleware/security.js";
import { createDiagnosticsRouter } from "./routes/diagnostics.js";
import { itemsRouter } from "./routes/items.js";

export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", 1);
  app.use(securityHeaders);
  app.use(cors({ origin: config.frontendUrl }));
  app.use(express.json({ limit: "100kb" }));
  app.use(createRateLimiter({ windowMs: config.rateLimitWindowMs, max: config.rateLimitMax }));

  app.get("/api/health", (_req, res) => res.json({ status: "ok", release: config.sentryRelease }));
  app.use("/api/items", itemsRouter);
  app.use("/api/errors", createDiagnosticsRouter({ enabled: config.enableTestErrors }));

  Sentry.setupExpressErrorHandler(app);
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
