import dotenv from "dotenv";

dotenv.config();

const nodeEnv = process.env.NODE_ENV || "development";
const port = Number(process.env.PORT || 3000);

export const config = Object.freeze({
  nodeEnv,
  port,
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
  sentryDsn: process.env.SENTRY_DSN || undefined,
  sentryRelease: process.env.SENTRY_RELEASE || "release-health-monitor@1.1.1",
  enableTestErrors: nodeEnv !== "production" ? process.env.ENABLE_TEST_ERRORS !== "false_prod" : process.env.ENABLE_TEST_ERRORS === "true",
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 900000),
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX || 300)
});
