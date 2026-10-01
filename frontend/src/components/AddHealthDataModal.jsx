import React, { useState } from "react";

export const METRIC_CONFIGS = {
  heart_rate: {
    label: "Heart Rate",
    icon: "❤️",
    defaultUnit: "bpm",
    units: ["bpm"],
    placeholder: "e.g., 72",
    step: "1",
    min: 30,
    max: 250,
    color: "#f43f5e",
    hint: "Resting rate typically 50-100 bpm.",
    presets: [60, 68, 72, 80, 95]
  },
  blood_pressure: {
    label: "Blood Pressure",
    icon: "🩸",
    defaultUnit: "mmHg",
    units: ["mmHg"],
    isCompound: true,
    color: "#8b5cf6",
    hint: "Resting baseline around 120/80 mmHg.",
    presets: [
      { systolic: 118, diastolic: 76, label: "118/76" },
      { systolic: 120, diastolic: 80, label: "120/80" },
      { systolic: 126, diastolic: 82, label: "126/82" }
    ]
  },
  spo2: {
    label: "Blood Oxygen (SpO₂)",
    icon: "🫁",
    defaultUnit: "%",
    units: ["%"],
    placeholder: "e.g., 98",
    step: "1",
    min: 50,
    max: 100,
    color: "#06b6d4",
    hint: "Typical sea-level readings range from 95% to 100%.",
    presets: [96, 97, 98, 99, 100]
  },
  temperature: {
    label: "Temperature",
    icon: "🌡️",
    defaultUnit: "°C",
    units: ["°C", "°F"],
    placeholder: "e.g., 36.6",
    step: "0.1",
    min: 30,
    max: 45,
    color: "#f59e0b",
    hint: "Standard body temperature is ~36.5°C to 37.5°C.",
    presets: [36.4, 36.6, 36.8, 37.0]
  },
  steps: {
    label: "Steps & Walking",
    icon: "🚶",
    defaultUnit: "steps",
    units: ["steps"],
    placeholder: "e.g., 8500",
    step: "1",
    min: 0,
    max: 150000,
    color: "#10b981",
    hint: "Step count recorded today.",
    presets: [1500, 3000, 5000, 8000, 10000]
  },
  water: {
    label: "Hydration",
    icon: "💧",
    defaultUnit: "ml",
    units: ["ml", "L"],
    placeholder: "e.g., 500",
    step: "10",
    min: 0,
    max: 15000,
    color: "#38bdf8",
    hint: "Water volume consumed.",
    presets: [250, 500, 750, 1000]
  },
  sleep: {
    label: "Sleep Duration",
    icon: "😴",
    defaultUnit: "hours",
    units: ["hours", "minutes"],
    placeholder: "e.g., 7.5",
    step: "0.25",
    min: 0,
    max: 24,
    color: "#a855f7",
    hint: "Total sleep hours or minutes.",
    presets: [6.5, 7.0, 7.5, 8.0, 8.5]
  },
  activity: {
    label: "Active Minutes",
    icon: "⚡",
    defaultUnit: "minutes",
    units: ["minutes"],
    placeholder: "e.g., 45",
    step: "5",
    min: 0,
    max: 720,
    color: "#eab308",
    hint: "Brisk exercise or workout duration.",
    presets: [15, 30, 45, 60]
  },
  weight: {
    label: "Body Weight",
    icon: "⚖️",
    defaultUnit: "kg",
    units: ["kg", "lbs"],
    placeholder: "e.g., 70.5",
    step: "0.1",
    min: 10,
    max: 500,
    color: "#14b8a6",
    hint: "Morning body weight check.",
    presets: [65, 70, 75, 80]
  }
};

export default function AddHealthDataModal({
  isOpen,
  onClose,
  onSave,
  editingRecord = null,
  defaultMetric = null
}) {
  if (!isOpen) return null;

  const initialMetric = editingRecord?.metric || defaultMetric || "heart_rate";
  const [metric, setMetric] = useState(initialMetric);
  const cfg = METRIC_CONFIGS[metric] || METRIC_CONFIGS.heart_rate;

  // Values
  const [singleValue, setSingleValue] = useState(
    editingRecord
      ? (metric === "sleep" && editingRecord.unit === "minutes"
          ? (editingRecord.value / 60).toString()
          : typeof editingRecord.value === "number"
          ? editingRecord.value
          : "")
      : ""
  );
  const [systolic, setSystolic] = useState(
    editingRecord && editingRecord.metric === "blood_pressure" ? editingRecord.value.systolic : ""
  );
  const [diastolic, setDiastolic] = useState(
    editingRecord && editingRecord.metric === "blood_pressure" ? editingRecord.value.diastolic : ""
  );

  const [unit, setUnit] = useState(
    editingRecord
      ? (metric === "sleep" ? "hours" : editingRecord.unit || cfg.defaultUnit)
      : cfg.defaultUnit
  );
  const [recordedAt, setRecordedAt] = useState(
    editingRecord
      ? new Date(editingRecord.recordedAt).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16)
  );
  const [notes, setNotes] = useState(editingRecord?.notes || "");
  const [errorMsg, setErrorMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleMetricChange(newMetric) {
    setMetric(newMetric);
    setUnit(METRIC_CONFIGS[newMetric].defaultUnit);
    setErrorMsg("");
    setSingleValue("");
    setSystolic("");
    setDiastolic("");
  }

  function handleApplyPreset(preset) {
    if (metric === "blood_pressure") {
      setSystolic(preset.systolic);
      setDiastolic(preset.diastolic);
    } else {
      setSingleValue(preset);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg("");

    let payloadValue;
    if (metric === "blood_pressure") {
      const s = Number(systolic);
      const d = Number(diastolic);
      if (!s || !d) {
        setErrorMsg("Please enter both systolic and diastolic numbers.");
        return;
      }
      if (s < 50 || s > 260) {
        setErrorMsg("Systolic value must be between 50 and 260 mmHg.");
        return;
      }
      if (d < 30 || d > 160) {
        setErrorMsg("Diastolic value must be between 30 and 160 mmHg.");
        return;
      }
      if (d >= s) {
        setErrorMsg("Systolic must be greater than diastolic pressure.");
        return;
      }
      payloadValue = { systolic: s, diastolic: d };
    } else {
      let num = Number(singleValue);
      if (isNaN(num) || singleValue === "") {
        setErrorMsg("Please enter a valid numeric value.");
        return;
      }
      // Convert sleep hours to minutes if user entered hours
      if (metric === "sleep" && unit === "hours") {
        num = Math.round(num * 60);
      }
      // Convert water Liters to ml
      if (metric === "water" && unit === "L") {
        num = Math.round(num * 1000);
      }
      payloadValue = num;
    }

    setSubmitting(true);
    try {
      await onSave({
        id: editingRecord?.id,
        metric,
        value: payloadValue,
        unit: metric === "sleep" ? "minutes" : metric === "water" ? "ml" : unit,
        recordedAt: new Date(recordedAt).toISOString(),
        notes: notes.trim()
      });
      onClose();
    } catch (err) {
      setErrorMsg(err.message || "Failed to save health reading.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "520px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "26px" }}>{cfg.icon}</span>
            <div>
              <h2 style={{ fontSize: "18px", fontWeight: "700", letterSpacing: "-0.01em" }}>
                {editingRecord ? "Edit Health Record" : "Add Health Reading"}
              </h2>
              <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                Personal tracking entry · Non-diagnostic logging
              </p>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Close modal">
            &times;
          </button>
        </div>

        {errorMsg && (
          <div style={{
            background: "rgba(244, 63, 94, 0.15)",
            border: "1px solid rgba(244, 63, 94, 0.3)",
            color: "#fb7185",
            padding: "10px 14px",
            borderRadius: "10px",
            fontSize: "13px",
            marginBottom: "16px"
          }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!editingRecord && (
            <div className="form-group">
              <label className="form-label">Metric Category</label>
              <select className="form-select" value={metric} onChange={(e) => handleMetricChange(e.target.value)}>
                {Object.entries(METRIC_CONFIGS).map(([key, item]) => (
                  <option key={key} value={key}>
                    {item.icon} {item.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Quick Preset Buttons */}
          {cfg.presets && (
            <div style={{ marginBottom: "16px" }}>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "6px", fontWeight: "600" }}>
                QUICK PRESETS
              </span>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {cfg.presets.map((preset, idx) => {
                  const label = typeof preset === "object" ? preset.label : `${preset} ${metric === "water" ? "ml" : metric === "sleep" ? "hrs" : ""}`;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      style={{
                        padding: "5px 10px",
                        background: "rgba(255, 255, 255, 0.04)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "var(--radius-sm)",
                        fontSize: "12px",
                        color: "var(--text-secondary)",
                        fontWeight: "500",
                        transition: "all 0.15s ease"
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {cfg.isCompound ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div className="form-group">
                <label className="form-label">Systolic (mmHg)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="e.g. 120"
                  value={systolic}
                  onChange={(e) => setSystolic(e.target.value)}
                  min="50"
                  max="260"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Diastolic (mmHg)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="e.g. 80"
                  value={diastolic}
                  onChange={(e) => setDiastolic(e.target.value)}
                  min="30"
                  max="160"
                  required
                />
              </div>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: cfg.units.length > 1 ? "2fr 1fr" : "1fr", gap: "12px" }}>
              <div className="form-group">
                <label className="form-label">Measurement Value</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder={cfg.placeholder}
                  step={cfg.step}
                  value={singleValue}
                  onChange={(e) => setSingleValue(e.target.value)}
                  required
                />
              </div>
              {cfg.units.length > 1 && (
                <div className="form-group">
                  <label className="form-label">Unit</label>
                  <select className="form-select" value={unit} onChange={(e) => setUnit(e.target.value)}>
                    {cfg.units.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Date & Time</label>
            <input
              type="datetime-local"
              className="form-input"
              value={recordedAt}
              onChange={(e) => setRecordedAt(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <span>Optional Notes</span>
              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Context, routine or mood</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g., Post-jogging, waking up, before dinner"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={200}
            />
          </div>

          <p style={{ fontSize: "11.5px", color: "var(--text-muted)", marginBottom: "20px" }}>
            {cfg.hint} Recorded for personal wellness tracking and visualization.
          </p>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Saving..." : editingRecord ? "Update Record" : "Save Reading"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
