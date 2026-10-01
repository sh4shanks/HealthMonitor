# Health Monitor — Personal Health & Wellness Tracking Dashboard

A modern, responsive personal health tracking dashboard built with React, Vite, Express, and Node.js. It allows users to record, visualize, analyze, and review vital health and wellness metrics in an intuitive dark glassmorphism interface.

> ⚠️ **Informational Tracking Notice:**  
> This application is strictly designed for personal habit and wellness tracking. It does **not** diagnose medical conditions, prescribe medication, recommend dosages, or replace professional medical guidance. Configured tracking ranges are non-diagnostic reference baselines.

---

## Features

- **Dashboard Overview:** Real-time metrics for Heart Rate, Blood Pressure, Blood Oxygen (SpO₂), Body Temperature, Activity/Steps, Hydration, Sleep Duration, and Body Weight with trend sparklines.
- **Biometric Logging:** Validated entry form for all major vitals with sanity range checks.
- **Health History:** Comprehensive tabular log with live filtering, full-text search across notes, sorting, and deletion.
- **Biometric Analytics:** Interactive SVG charts and distribution statistics across multiple timeframes (Today, 7 Days, 30 Days, 3 Months).
- **Wellness Goals:** Interactive progress tracking towards daily steps, hydration volume, and sleep duration milestones.
- **User Profile:** Manage physical baseline metrics (Height, Weight, Age, Units) and calculate reference BMI.
- **Demonstration Mode:** Optional sample dataset clearly tagged as `DEMO DATA` with one-click seeding and clearing.
- **Safe Baseline Notifications:** Neutral alerts for metrics recorded outside your configured target ranges.

---

## Quickstart & Local Execution

The project is unified at the workspace root:

```bash
# 1. Install dependencies
npm install

# 2. Start in development mode (Express API + Vite on http://localhost:3000)
npm run dev

# 3. Or compile and run in production mode
npm run build
npm start

# 4. Run automated test suite
npm test
```

### Note on In-Memory Prototype Storage
This version uses an in-memory data store (`backend/src/store/healthStore.js`). Stored records persist for the duration of the server session and reset when the server restarts.

---

## Tech Stack & Architecture

- **Frontend:** React 19, Vite 6, Custom SVG Sparklines & Charts, CSS Dark Glassmorphism.
- **Backend:** Node.js, Express 5, CORS allow-listing, rate limiting, and security headers.
- **Observability (Optional):** Sentry for React browser tracing and Node exception monitoring.
