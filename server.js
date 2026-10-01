import path from "node:path";
import { fileURLToPath } from "node:url";
import * as Sentry from "@sentry/node";
import express from "express";
import { createApp } from "./backend/src/app.js";
import { config } from "./backend/src/config.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

Sentry.init({
  dsn: config.sentryDsn,
  release: config.sentryRelease,
  environment: config.nodeEnv,
  tracesSampleRate: config.nodeEnv === "production" ? 0.1 : 1.0
});

const app = createApp();

const isProd = process.env.NODE_ENV === "production";
let viteDevServer = null;

if (!isProd) {
  try {
    const { createServer } = await import("vite");
    viteDevServer = await createServer({
      server: { middlewareMode: true },
      appType: "spa",
      root: path.resolve(__dirname, "frontend")
    });
    app.use(viteDevServer.middlewares);
  } catch (err) {
    console.warn("[Server] Vite middleware mode failed, falling back to static files:", err);
  }
}

// Serve static build if in production or as fallback
const distPath = path.resolve(__dirname, "dist");
app.use(express.static(distPath));
app.use((_req, res) => {
  res.sendFile(path.resolve(distPath, "index.html"), (err) => {
    if (err) {
      res.status(404).send("Frontend not found. Please run 'npm run build' or check dev server.");
    }
  });
});

const port = Number(process.env.PORT || 3000);
const server = app.listen(port, "0.0.0.0", () => {
  console.log(`Server listening on http://0.0.0.0:${port}`);
});

function shutdown(signal) {
  console.log(`${signal} received; shutting down gracefully.`);
  server.close(async () => {
    if (viteDevServer) {
      await viteDevServer.close();
    }
    await Sentry.close(2000);
    process.exit(0);
  });

  setTimeout(() => process.exit(1), 5000).unref();
}

process.once("SIGTERM", () => shutdown("SIGTERM"));
process.once("SIGINT", () => shutdown("SIGINT"));
