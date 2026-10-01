import express from "express";
import {
  clearAllHealthRecords,
  createHealthRecord,
  deleteHealthRecord,
  getHealthRecord,
  getUserGoals,
  getUserProfile,
  importHealthRecords,
  listHealthRecords,
  seedDemoData,
  TRACKING_RANGES,
  updateHealthRecord,
  updateUserGoals,
  updateUserProfile
} from "../store/healthStore.js";

export const healthRouter = express.Router();

// Validation helper
function validateMetricData(body) {
  const { metric, value, recordedAt } = body;
  const validMetrics = [
    "heart_rate",
    "blood_pressure",
    "spo2",
    "temperature",
    "weight",
    "steps",
    "water",
    "sleep",
    "activity"
  ];

  if (!metric || !validMetrics.includes(metric)) {
    return `Invalid or missing metric type. Allowed: ${validMetrics.join(", ")}`;
  }

  if (recordedAt && isNaN(Date.parse(recordedAt))) {
    return "Invalid date format for recordedAt.";
  }

  if (metric === "blood_pressure") {
    if (!value || typeof value !== "object") {
      return "Blood pressure requires { systolic, diastolic } numeric object.";
    }
    const sys = Number(value.systolic);
    const dia = Number(value.diastolic);
    if (!Number.isFinite(sys) || sys < 50 || sys > 260) {
      return "Systolic pressure must be between 50 and 260 mmHg.";
    }
    if (!Number.isFinite(dia) || dia < 30 || dia > 160) {
      return "Diastolic pressure must be between 30 and 160 mmHg.";
    }
    if (dia >= sys) {
      return "Systolic pressure must be greater than diastolic pressure.";
    }
  } else {
    const num = Number(value);
    if (!Number.isFinite(num)) {
      return `Metric value must be a valid number for ${metric}.`;
    }

    switch (metric) {
      case "heart_rate":
        if (num < 30 || num > 250) return "Heart rate must be between 30 and 250 BPM.";
        break;
      case "spo2":
        if (num < 50 || num > 100) return "SpO₂ must be between 50% and 100%.";
        break;
      case "temperature":
        // Support Celsius (30-45) or Fahrenheit (86-113)
        if ((num < 30 || num > 45) && (num < 86 || num > 113)) {
          return "Temperature must be within plausible biological limits (30-45°C or 86-113°F).";
        }
        break;
      case "weight":
        if (num < 10 || num > 500) return "Weight must be between 10 and 500.";
        break;
      case "steps":
        if (num < 0 || num > 150000) return "Steps must be between 0 and 150,000.";
        break;
      case "water":
        if (num < 0 || num > 15000) return "Water consumed must be between 0 and 15,000 ml.";
        break;
      case "sleep":
        if (num < 0 || num > 1440) return "Sleep duration must be between 0 and 1440 minutes (24 hours).";
        break;
      case "activity":
        if (num < 0 || num > 1440) return "Active minutes must be between 0 and 1440 minutes.";
        break;
    }
  }

  return null;
}

// 1. Health Records CRUD
healthRouter.get("/records", (_req, res) => {
  res.json(listHealthRecords());
});

healthRouter.get("/records/:id", (req, res) => {
  const record = getHealthRecord(req.params.id);
  if (!record) return res.status(404).json({ error: "Health record not found" });
  res.json(record);
});

healthRouter.post("/records", (req, res) => {
  const error = validateMetricData(req.body);
  if (error) return res.status(400).json({ error });

  const created = createHealthRecord({
    metric: req.body.metric,
    value: req.body.metric === "blood_pressure" ? {
      systolic: Number(req.body.value.systolic),
      diastolic: Number(req.body.value.diastolic)
    } : Number(req.body.value),
    unit: req.body.unit,
    recordedAt: req.body.recordedAt,
    notes: req.body.notes,
    isDemo: req.body.isDemo
  });

  res.status(201).json(created);
});

healthRouter.put("/records/:id", (req, res) => {
  const existing = getHealthRecord(req.params.id);
  if (!existing) return res.status(404).json({ error: "Health record not found" });

  const error = validateMetricData({
    metric: req.body.metric || existing.metric,
    value: req.body.value !== undefined ? req.body.value : existing.value,
    recordedAt: req.body.recordedAt || existing.recordedAt
  });
  if (error) return res.status(400).json({ error });

  const changes = {};
  if (req.body.metric) changes.metric = req.body.metric;
  if (req.body.value !== undefined) {
    changes.value = req.body.metric === "blood_pressure" || (!req.body.metric && existing.metric === "blood_pressure")
      ? { systolic: Number(req.body.value.systolic), diastolic: Number(req.body.value.diastolic) }
      : Number(req.body.value);
  }
  if (req.body.unit !== undefined) changes.unit = req.body.unit;
  if (req.body.recordedAt !== undefined) changes.recordedAt = req.body.recordedAt;
  if (req.body.notes !== undefined) changes.notes = req.body.notes;

  const updated = updateHealthRecord(req.params.id, changes);
  res.json(updated);
});

healthRouter.delete("/records/:id", (req, res) => {
  const deleted = deleteHealthRecord(req.params.id);
  if (!deleted) return res.status(404).json({ error: "Health record not found" });
  res.status(204).end();
});

// Clear health records
healthRouter.post("/records/clear", (req, res) => {
  const demoOnly = Boolean(req.body?.demoOnly);
  const result = clearAllHealthRecords(demoOnly);
  res.json(result);
});

// Seed demo data
healthRouter.post("/records/seed-demo", (_req, res) => {
  const result = seedDemoData();
  res.json(result);
});

// Import health records (JSON)
healthRouter.post("/records/import", (req, res) => {
  const { records, overwrite } = req.body;
  if (!Array.isArray(records)) {
    return res.status(400).json({ error: "Expected an array of records to import." });
  }

  // Validate each record
  const validatedRecords = [];
  for (const r of records) {
    if (!r.metric || !r.recordedAt) continue;
    const err = validateMetricData(r);
    if (!err) {
      validatedRecords.push(r);
    }
  }

  const result = importHealthRecords(validatedRecords, Boolean(overwrite));
  res.json(result);
});

// 2. User Goals
healthRouter.get("/goals", (_req, res) => {
  res.json(getUserGoals());
});

healthRouter.put("/goals", (req, res) => {
  const updated = updateUserGoals(req.body);
  res.json(updated);
});

// 3. User Profile
healthRouter.get("/profile", (_req, res) => {
  res.json(getUserProfile());
});

healthRouter.put("/profile", (req, res) => {
  const updated = updateUserProfile(req.body);
  res.json(updated);
});

// 4. Tracking Ranges / Reference Config
healthRouter.get("/ranges", (_req, res) => {
  res.json(TRACKING_RANGES);
});
