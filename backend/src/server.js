import * as Sentry from "@sentry/node";
import { createApp } from "./app.js";
import { config } from "./config.js";

Sentry.init({
  dsn: config.sentryDsn,
  release: config.sentryRelease,
  environment: config.nodeEnv,
  tracesSampleRate: config.nodeEnv === "production" ? 0.1 : 1.0
});

const app = createApp();
const server = app.listen(config.port, () => {
  console.log(`Backend listening on http://localhost:${config.port}`);
});

function shutdown(signal) {
  console.log(`${signal} received; shutting down gracefully.`);
  server.close(async () => {
    await Sentry.close(2000);
    process.exit(0);
  });

  setTimeout(() => process.exit(1), 5000).unref();
}

process.once("SIGTERM", () => shutdown("SIGTERM"));
process.once("SIGINT", () => shutdown("SIGINT"));
