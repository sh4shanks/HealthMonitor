import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, "../../data");
const DATA_FILE = path.join(DATA_DIR, "health_data.json");

const now = () => new Date().toISOString();

// Initial Default State
const DEFAULT_GOALS = {
  steps: 10000,
  waterMl: 2500,
  sleepMinutes: 480, // 8 hours
  activeMinutes: 45
};

const DEFAULT_PROFILE = {
  name: "Shashank",
  age: 29,
  gender: "Not specified",
  heightCm: 175,
  weightKg: 70,
  unitSystem: "metric", // "metric" or "imperial"
  trackingAlertsEnabled: true,
  onboardingCompleted: true
};

let healthRecords = [];
let userGoals = { ...DEFAULT_GOALS };
let userProfile = { ...DEFAULT_PROFILE };

// Helper to save store state to disk
function saveToDisk() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const payload = {
      healthRecords,
      userGoals,
      userProfile,
      savedAt: now()
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(payload, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to persist health data to disk:", err);
  }
}

// Helper to load store state from disk
function loadFromDisk() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, "utf8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed.healthRecords)) {
        healthRecords = parsed.healthRecords;
      }
      if (parsed.userGoals && typeof parsed.userGoals === "object") {
        userGoals = { ...DEFAULT_GOALS, ...parsed.userGoals };
      }
      if (parsed.userProfile && typeof parsed.userProfile === "object") {
        userProfile = { ...DEFAULT_PROFILE, ...parsed.userProfile };
      }
    }
  } catch (err) {
    console.warn("Could not read persistent health data file, using defaults:", err.message);
  }
}

// Initialize on module load
loadFromDisk();

// Configured tracking ranges for alert indicators (tracking/informational only, not diagnostic)
export const TRACKING_RANGES = {
  heart_rate: { min: 50, max: 100, unit: "bpm", label: "Resting Heart Rate" },
  spo2: { min: 94, max: 100, unit: "%", label: "Blood Oxygen (SpO₂)" },
  temperature: { min: 36.0, max: 37.8, unit: "°C", label: "Body Temperature" },
  blood_pressure: {
    systolic: { min: 90, max: 130 },
    diastolic: { min: 60, max: 85 },
    unit: "mmHg",
    label: "Blood Pressure"
  }
};

export function listHealthRecords() {
  return [...healthRecords].sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt));
}

export function getHealthRecord(id) {
  return healthRecords.find((r) => r.id === id) ?? null;
}

export function createHealthRecord(data) {
  const timestamp = now();
  const record = {
    id: data.id || crypto.randomUUID(),
    metric: data.metric,
    value: data.value,
    unit: data.unit || "",
    recordedAt: data.recordedAt || timestamp,
    notes: (data.notes || "").trim(),
    isDemo: Boolean(data.isDemo),
    createdAt: timestamp,
    updatedAt: timestamp
  };

  healthRecords = [record, ...healthRecords];
  saveToDisk();
  return record;
}

export function updateHealthRecord(id, changes) {
  const index = healthRecords.findIndex((r) => r.id === id);
  if (index === -1) return null;

  const updated = {
    ...healthRecords[index],
    ...changes,
    updatedAt: now()
  };
  healthRecords = healthRecords.with(index, updated);
  saveToDisk();
  return updated;
}

export function deleteHealthRecord(id) {
  const existing = getHealthRecord(id);
  if (!existing) return null;
  healthRecords = healthRecords.filter((r) => r.id !== id);
  saveToDisk();
  return existing;
}

export function clearAllHealthRecords(includeDemoOnly = false) {
  if (includeDemoOnly) {
    healthRecords = healthRecords.filter((r) => !r.isDemo);
  } else {
    healthRecords = [];
  }
  saveToDisk();
  return { success: true };
}

export function importHealthRecords(newRecords, overwrite = false) {
  if (overwrite) {
    healthRecords = [...newRecords];
  } else {
    // Merge without duplicate IDs
    const existingIds = new Set(healthRecords.map((r) => r.id));
    const toAdd = newRecords.filter((r) => !existingIds.has(r.id));
    healthRecords = [...toAdd, ...healthRecords];
  }
  saveToDisk();
  return { importedCount: newRecords.length, totalCount: healthRecords.length };
}

export function getUserGoals() {
  return { ...userGoals };
}

export function updateUserGoals(newGoals) {
  userGoals = {
    ...userGoals,
    ...newGoals
  };
  saveToDisk();
  return { ...userGoals };
}

export function getUserProfile() {
  return { ...userProfile };
}

export function updateUserProfile(newProfile) {
  userProfile = {
    ...userProfile,
    ...newProfile
  };
  saveToDisk();
  return { ...userProfile };
}

// Generate Realistic Demo Data (clearly tagged with isDemo: true)
export function seedDemoData() {
  // Clear any previous demo data first
  healthRecords = healthRecords.filter((r) => !r.isDemo);

  const nowMs = Date.now();
  const hourMs = 60 * 60 * 1000;
  const dayMs = 24 * hourMs;

  const demoItems = [];

  // Heart Rate entries over the past 14 days
  const hrSamples = [
    { offsetH: 1, val: 72 },
    { offsetH: 4, val: 76 },
    { offsetH: 9, val: 68 },
    { offsetH: 24, val: 71 },
    { offsetH: 28, val: 75 },
    { offsetH: 48, val: 69 },
    { offsetH: 72, val: 74 },
    { offsetH: 96, val: 76 },
    { offsetH: 120, val: 70 },
    { offsetH: 144, val: 73 },
    { offsetH: 168, val: 71 },
    { offsetH: 192, val: 74 },
    { offsetH: 216, val: 69 }
  ];
  hrSamples.forEach((s) => {
    demoItems.push({
      id: crypto.randomUUID(),
      metric: "heart_rate",
      value: s.val,
      unit: "bpm",
      recordedAt: new Date(nowMs - s.offsetH * hourMs).toISOString(),
      notes: "Routine resting pulse",
      isDemo: true,
      createdAt: now(),
      updatedAt: now()
    });
  });

  // Blood Pressure entries
  const bpSamples = [
    { offsetD: 0, s: 118, d: 78 },
    { offsetD: 1, s: 121, d: 80 },
    { offsetD: 2, s: 116, d: 76 },
    { offsetD: 3, s: 119, d: 77 },
    { offsetD: 4, s: 124, d: 82 },
    { offsetD: 5, s: 117, d: 75 },
    { offsetD: 6, s: 119, d: 77 },
    { offsetD: 8, s: 120, d: 78 },
    { offsetD: 10, s: 118, d: 76 }
  ];
  bpSamples.forEach((s) => {
    demoItems.push({
      id: crypto.randomUUID(),
      metric: "blood_pressure",
      value: { systolic: s.s, diastolic: s.d },
      unit: "mmHg",
      recordedAt: new Date(nowMs - s.offsetD * dayMs - 2 * hourMs).toISOString(),
      notes: "Morning seated reading",
      isDemo: true,
      createdAt: now(),
      updatedAt: now()
    });
  });

  // SpO2 entries
  const spo2Samples = [
    { offsetH: 2, val: 98 },
    { offsetH: 14, val: 99 },
    { offsetH: 26, val: 98 },
    { offsetH: 50, val: 97 },
    { offsetH: 80, val: 99 },
    { offsetH: 110, val: 98 },
    { offsetH: 140, val: 99 }
  ];
  spo2Samples.forEach((s) => {
    demoItems.push({
      id: crypto.randomUUID(),
      metric: "spo2",
      value: s.val,
      unit: "%",
      recordedAt: new Date(nowMs - s.offsetH * hourMs).toISOString(),
      notes: "Pulse oximeter check",
      isDemo: true,
      createdAt: now(),
      updatedAt: now()
    });
  });

  // Temperature entries
  const tempSamples = [
    { offsetD: 0, val: 36.6 },
    { offsetD: 1, val: 36.7 },
    { offsetD: 2, val: 36.6 },
    { offsetD: 3, val: 36.5 },
    { offsetD: 5, val: 36.8 },
    { offsetD: 7, val: 36.6 }
  ];
  tempSamples.forEach((s) => {
    demoItems.push({
      id: crypto.randomUUID(),
      metric: "temperature",
      value: s.val,
      unit: "°C",
      recordedAt: new Date(nowMs - s.offsetD * dayMs - 4 * hourMs).toISOString(),
      notes: "Oral thermometer check",
      isDemo: true,
      createdAt: now(),
      updatedAt: now()
    });
  });

  // Steps entries across past 14 days
  const stepsSamples = [
    { offsetD: 0, val: 8420 },
    { offsetD: 1, val: 10250 },
    { offsetD: 2, val: 7890 },
    { offsetD: 3, val: 11400 },
    { offsetD: 4, val: 6540 },
    { offsetD: 5, val: 9800 },
    { offsetD: 6, val: 8900 },
    { offsetD: 7, val: 10450 },
    { offsetD: 8, val: 9200 },
    { offsetD: 9, val: 11100 },
    { offsetD: 10, val: 8700 },
    { offsetD: 11, val: 7600 },
    { offsetD: 12, val: 10300 },
    { offsetD: 13, val: 9400 }
  ];
  stepsSamples.forEach((s) => {
    demoItems.push({
      id: crypto.randomUUID(),
      metric: "steps",
      value: s.val,
      unit: "steps",
      recordedAt: new Date(nowMs - s.offsetD * dayMs - 1 * hourMs).toISOString(),
      notes: "Daily activity summary",
      isDemo: true,
      createdAt: now(),
      updatedAt: now()
    });
  });

  // Hydration entries
  const waterSamples = [
    { offsetD: 0, val: 2100 },
    { offsetD: 1, val: 2600 },
    { offsetD: 2, val: 2400 },
    { offsetD: 3, val: 2700 },
    { offsetD: 4, val: 2200 },
    { offsetD: 5, val: 2550 },
    { offsetD: 6, val: 2650 },
    { offsetD: 7, val: 2300 },
    { offsetD: 8, val: 2500 }
  ];
  waterSamples.forEach((s) => {
    demoItems.push({
      id: crypto.randomUUID(),
      metric: "water",
      value: s.val,
      unit: "ml",
      recordedAt: new Date(nowMs - s.offsetD * dayMs - 3 * hourMs).toISOString(),
      notes: "Daily water consumption",
      isDemo: true,
      createdAt: now(),
      updatedAt: now()
    });
  });

  // Sleep entries
  const sleepSamples = [
    { offsetD: 0, val: 465 }, // 7h 45m
    { offsetD: 1, val: 490 }, // 8h 10m
    { offsetD: 2, val: 440 }, // 7h 20m
    { offsetD: 3, val: 510 }, // 8h 30m
    { offsetD: 4, val: 430 }, // 7h 10m
    { offsetD: 5, val: 480 }, // 8h 00m
    { offsetD: 6, val: 470 }, // 7h 50m
    { offsetD: 7, val: 500 }  // 8h 20m
  ];
  sleepSamples.forEach((s) => {
    demoItems.push({
      id: crypto.randomUUID(),
      metric: "sleep",
      value: s.val,
      unit: "minutes",
      recordedAt: new Date(nowMs - s.offsetD * dayMs - 8 * hourMs).toISOString(),
      notes: "Overnight rest monitor",
      isDemo: true,
      createdAt: now(),
      updatedAt: now()
    });
  });

  // Active Minutes entries
  const activitySamples = [
    { offsetD: 0, val: 48 },
    { offsetD: 1, val: 55 },
    { offsetD: 2, val: 35 },
    { offsetD: 3, val: 62 },
    { offsetD: 4, val: 30 },
    { offsetD: 5, val: 50 },
    { offsetD: 6, val: 45 }
  ];
  activitySamples.forEach((s) => {
    demoItems.push({
      id: crypto.randomUUID(),
      metric: "activity",
      value: s.val,
      unit: "minutes",
      recordedAt: new Date(nowMs - s.offsetD * dayMs - 5 * hourMs).toISOString(),
      notes: "Brisk walk & workout",
      isDemo: true,
      createdAt: now(),
      updatedAt: now()
    });
  });

  // Weight entries
  const weightSamples = [
    { offsetD: 0, val: 70.2 },
    { offsetD: 7, val: 70.5 },
    { offsetD: 14, val: 70.8 },
    { offsetD: 21, val: 71.0 }
  ];
  weightSamples.forEach((s) => {
    demoItems.push({
      id: crypto.randomUUID(),
      metric: "weight",
      value: s.val,
      unit: "kg",
      recordedAt: new Date(nowMs - s.offsetD * dayMs).toISOString(),
      notes: "Morning body weight",
      isDemo: true,
      createdAt: now(),
      updatedAt: now()
    });
  });

  // Today's intraday timeline events for "My Day" demonstration
  demoItems.push(
    {
      id: crypto.randomUUID(),
      metric: "heart_rate",
      value: 71,
      unit: "bpm",
      recordedAt: new Date(nowMs - 7 * hourMs).toISOString(),
      notes: "Waking resting heart rate",
      isDemo: true,
      createdAt: now(),
      updatedAt: now()
    },
    {
      id: crypto.randomUUID(),
      metric: "water",
      value: 350,
      unit: "ml",
      recordedAt: new Date(nowMs - 5 * hourMs).toISOString(),
      notes: "Morning glass of water",
      isDemo: true,
      createdAt: now(),
      updatedAt: now()
    },
    {
      id: crypto.randomUUID(),
      metric: "steps",
      value: 2350,
      unit: "steps",
      recordedAt: new Date(nowMs - 3 * hourMs).toISOString(),
      notes: "Morning park stroll",
      isDemo: true,
      createdAt: now(),
      updatedAt: now()
    },
    {
      id: crypto.randomUUID(),
      metric: "activity",
      value: 30,
      unit: "minutes",
      recordedAt: new Date(nowMs - 2 * hourMs).toISOString(),
      notes: "Mid-day cardio routine",
      isDemo: true,
      createdAt: now(),
      updatedAt: now()
    }
  );

  healthRecords = [...demoItems, ...healthRecords];
  saveToDisk();
  return { seededCount: demoItems.length };
}
