import * as Sentry from "@sentry/node";
import cors from "cors";
import express from "express";
import { config } from "./config.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { createRateLimiter, securityHeaders } from "./middleware/security.js";
import { createDiagnosticsRouter } from "./routes/diagnostics.js";
import { healthRouter } from "./routes/health.js";
import { itemsRouter } from "./routes/items.js";

export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", 1);
  app.use(securityHeaders);
  const corsOrigin = config.nodeEnv === "production" && config.frontendUrl
    ? (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, or same-origin)
        if (!origin) return callback(null, true);
        if (origin === config.frontendUrl) return callback(null, true);
        // Disallow origin cleanly without crashing or throwing 500
        callback(null, false);
      }
    : true;

  app.use(cors({ origin: corsOrigin, credentials: true }));
  app.use(express.json({ limit: "100kb" }));
  app.use(createRateLimiter({ windowMs: config.rateLimitWindowMs, max: config.rateLimitMax }));

  app.get("/api/health", (_req, res) => res.json({ status: "ok", release: config.sentryRelease }));
  app.use("/api/health-records", healthRouter);
  app.use("/api/items", itemsRouter);
  app.use("/api/errors", createDiagnosticsRouter({ enabled: config.enableTestErrors }));

  Sentry.setupExpressErrorHandler(app);
  app.use((req, res, next) => {
    if (req.path.startsWith("/api")) {
      return notFoundHandler(req, res);
    }
    next();
  });
  app.use(errorHandler);
  return app;
}
