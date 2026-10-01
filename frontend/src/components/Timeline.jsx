import React, { useState } from "react";
import { formatTemperature, formatWater, formatSleep } from "../utils/units.js";

export default function Timeline({ records = [], onEdit, onDelete, onAddNew, unitSystem = "metric" }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMetric, setFilterMetric] = useState("all");
  const [sortBy, setSortBy] = useState("newest"); // "newest" | "oldest" | "highest"

  const filtered = records.filter((r) => {
    if (filterMetric !== "all" && r.metric !== filterMetric) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const notesMatch = (r.notes || "").toLowerCase().includes(q);
      const metricMatch = r.metric.toLowerCase().includes(q);
      const dateMatch = new Date(r.recordedAt).toLocaleDateString().includes(q);
      const valStr = typeof r.value === "object" ? `${r.value.systolic}/${r.value.diastolic}` : String(r.value);
      return notesMatch || metricMatch || dateMatch || valStr.includes(q);
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "newest") return new Date(b.recordedAt) - new Date(a.recordedAt);
    if (sortBy === "oldest") return new Date(a.recordedAt) - new Date(b.recordedAt);
    if (sortBy === "highest") {
      const valA = typeof a.value === "object" ? a.value.systolic : a.value;
      const valB = typeof b.value === "object" ? b.value.systolic : b.value;
      return valB - valA;
    }
    return 0;
  });

  function formatValue(r) {
    if (r.metric === "blood_pressure") {
      return `${r.value.systolic}/${r.value.diastolic} mmHg`;
    }
    if (r.metric === "sleep") {
      return formatSleep(r.value).display;
    }
    if (r.metric === "water") {
      const w = formatWater(r.value, unitSystem);
      return `${w.value} ${w.unit}`;
    }
    if (r.metric === "temperature") {
      const t = formatTemperature(r.value, unitSystem);
      return `${t.value} ${t.unit}`;
    }
    if (r.metric === "activity") {
      return `${r.value} mins`;
    }
    if (r.metric === "steps") {
      return `${r.value.toLocaleString()} steps`;
    }
    return `${r.value} ${r.unit}`;
  }

  function getMetricMeta(metric) {
    switch (metric) {
      case "heart_rate": return { icon: "❤️", label: "Heart Rate", color: "#f43f5e" };
      case "blood_pressure": return { icon: "🩸", label: "Blood Pressure", color: "#8b5cf6" };
      case "spo2": return { icon: "🫁", label: "Blood Oxygen", color: "#06b6d4" };
      case "temperature": return { icon: "🌡️", label: "Temperature", color: "#f59e0b" };
      case "steps": return { icon: "🚶", label: "Steps", color: "#10b981" };
      case "water": return { icon: "💧", label: "Hydration", color: "#38bdf8" };
      case "sleep": return { icon: "😴", label: "Sleep", color: "#a855f7" };
      case "activity": return { icon: "⚡", label: "Active Minutes", color: "#eab308" };
      case "weight": return { icon: "⚖️", label: "Weight", color: "#14b8a6" };
      default: return { icon: "📊", label: metric, color: "#94a3b8" };
    }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "26px", fontWeight: "800", letterSpacing: "-0.02em", marginBottom: "4px" }}>
            Health Timeline & Event Log
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
            Comprehensive chronological register of all personal biometric records, check-ins, and observations
          </p>
        </div>
        <button className="btn btn-primary" onClick={onAddNew}>
          + Add New Reading
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card" style={{ padding: "18px 22px", marginBottom: "24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px" }}>
          <div>
            <label className="form-label">Search Notes, Value, Date or Metric</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. morning resting, workout, 98..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <label className="form-label">Filter Metric</label>
            <select className="form-select" value={filterMetric} onChange={(e) => setFilterMetric(e.target.value)}>
              <option value="all">All Biometric Metrics</option>
              <option value="heart_rate">❤️ Heart Rate</option>
              <option value="blood_pressure">🩸 Blood Pressure</option>
              <option value="spo2">🫁 Blood Oxygen (SpO₂)</option>
              <option value="temperature">🌡️ Body Temperature</option>
              <option value="steps">🚶 Steps & Activity</option>
              <option value="water">💧 Hydration</option>
              <option value="sleep">😴 Sleep Duration</option>
              <option value="activity">⚡ Active Minutes</option>
              <option value="weight">⚖️ Body Weight</option>
            </select>
          </div>
          <div>
            <label className="form-label">Chronological Sorting</label>
            <select className="form-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Value First</option>
            </select>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "14px", paddingTop: "12px", borderTop: "1px solid rgba(255,255,255,0.06)", fontSize: "12px", color: "var(--text-muted)" }}>
          <span>
            Showing {sorted.length} of {records.length} record{records.length !== 1 ? "s" : ""}
          </span>
          {(searchTerm || filterMetric !== "all") && (
            <button
              onClick={() => {
                setSearchTerm("");
                setFilterMetric("all");
              }}
              style={{ color: "var(--accent-cyan)", fontSize: "12px", fontWeight: "600" }}
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Timeline Entries List */}
      {sorted.length === 0 ? (
        <div className="glass-card" style={{ padding: "48px 20px", textAlign: "center", color: "var(--text-muted)" }}>
          <span style={{ fontSize: "36px", display: "block", marginBottom: "8px" }}>🔍</span>
          <h3 style={{ fontSize: "16px", fontWeight: "600", color: "var(--text-primary)", marginBottom: "4px" }}>
            No records match your criteria
          </h3>
          <p style={{ fontSize: "13px", maxWidth: "340px", margin: "0 auto 16px" }}>
            Try clearing your search query, selecting another metric category, or logging a new measurement.
          </p>
          <button className="btn btn-secondary" onClick={() => { setSearchTerm(""); setFilterMetric("all"); }}>
            Clear Search Filter
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "10px" }}>
          {sorted.map((record) => {
            const meta = getMetricMeta(record.metric);
            const dateObj = new Date(record.recordedAt);
            const dateStr = dateObj.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
            const timeStr = dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

            return (
              <div
                key={record.id}
                className="glass-card"
                style={{
                  padding: "16px 20px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "14px"
                }}
              >
                {/* Metric Icon & Info */}
                <div style={{ display: "flex", alignItems: "center", gap: "14px", minWidth: "220px" }}>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "10px",
                      background: `${meta.color}15`,
                      border: `1px solid ${meta.color}30`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "19px",
                      flexShrink: 0
                    }}
                  >
                    {meta.icon}
                  </div>

                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-primary)" }}>
                        {meta.label}
                      </span>
                      {record.isDemo && (
                        <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                          (Demo)
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums" }}>
                        {dateStr} · {timeStr}
                      </span>
                      {record.notes && (
                        <span style={{ marginLeft: "8px", color: "var(--text-secondary)" }}>
                          — {record.notes}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Metric Value & Action Buttons */}
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "17px",
                      fontWeight: "700",
                      fontVariantNumeric: "tabular-nums",
                      color: meta.color,
                      textAlign: "right",
                      minWidth: "110px"
                    }}
                  >
                    {formatValue(record)}
                  </div>

                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      className="btn-icon"
                      onClick={() => onEdit(record)}
                      title="Edit this record"
                      aria-label="Edit this record"
                      style={{ width: "32px", height: "32px" }}
                    >
                      ✏️
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() => onDelete(record.id)}
                      title="Delete this record"
                      aria-label="Delete this record"
                      style={{ width: "32px", height: "32px", color: "#fb7185" }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
