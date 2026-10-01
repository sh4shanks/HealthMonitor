import React from "react";
import { formatTemperature, formatWater, formatSleep } from "../utils/units.js";

export default function MyDayTimeline({ records = [], onAddClick, unitSystem = "metric" }) {
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayEvents = records
    .filter((r) => r.recordedAt.slice(0, 10) === todayStr)
    .sort((a, b) => new Date(a.recordedAt) - new Date(b.recordedAt));

  function formatTime(iso) {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
  }

  function formatDisplay(r) {
    if (r.metric === "blood_pressure") {
      return `${r.value.systolic}/${r.value.diastolic} mmHg`;
    }
    if (r.metric === "sleep") {
      const s = formatSleep(r.value);
      return s.display;
    }
    if (r.metric === "water") {
      const w = formatWater(r.value, unitSystem);
      return `${w.value} ${w.unit}`;
    }
    if (r.metric === "temperature") {
      const t = formatTemperature(r.value, unitSystem);
      return `${t.value} ${t.unit}`;
    }
    if (r.metric === "steps") {
      return `${r.value.toLocaleString()} steps`;
    }
    return `${r.value} ${r.unit}`;
  }

  function getIcon(metric) {
    switch (metric) {
      case "heart_rate": return { icon: "❤️", color: "#f43f5e", label: "Heart Rate Check" };
      case "blood_pressure": return { icon: "🩸", color: "#8b5cf6", label: "Blood Pressure" };
      case "spo2": return { icon: "🫁", color: "#06b6d4", label: "Oxygen Saturation" };
      case "temperature": return { icon: "🌡️", color: "#f59e0b", label: "Temperature" };
      case "steps": return { icon: "🚶", color: "#10b981", label: "Activity / Steps" };
      case "water": return { icon: "💧", color: "#38bdf8", label: "Hydration Log" };
      case "sleep": return { icon: "😴", color: "#a855f7", label: "Sleep Recorded" };
      case "activity": return { icon: "⚡", color: "#eab308", label: "Active Exercise" };
      case "weight": return { icon: "⚖️", color: "#14b8a6", label: "Weight Check" };
      default: return { icon: "📊", color: "#94a3b8", label: metric };
    }
  }

  function getTimePeriod(iso) {
    const hrs = new Date(iso).getHours();
    if (hrs < 12) return "Morning";
    if (hrs < 17) return "Afternoon";
    if (hrs < 21) return "Evening";
    return "Night";
  }

  return (
    <div className="glass-card" style={{ padding: "26px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div>
            <h2 style={{ fontSize: "16px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px", letterSpacing: "-0.01em" }}>
              <span>🕒</span> My Day
            </h2>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
              Chronological progression of today's biometric events & habits
            </p>
          </div>
          <span style={{ fontSize: "12px", color: "var(--accent-cyan)", fontWeight: "600", fontVariantNumeric: "tabular-nums" }}>
            {todayEvents.length} event{todayEvents.length !== 1 ? "s" : ""} today
          </span>
        </div>

        {todayEvents.length === 0 ? (
          <div style={{ textAlign: "center", padding: "36px 12px", color: "var(--text-muted)" }}>
            <div style={{ fontSize: "32px", marginBottom: "8px" }}>🌅</div>
            <p style={{ fontSize: "13.5px", color: "var(--text-primary)", fontWeight: "600", marginBottom: "4px" }}>
              No health logs recorded yet today
            </p>
            <p style={{ fontSize: "12px", maxWidth: "340px", margin: "0 auto 16px" }}>
              Log morning resting heart rate, your first glass of water, or step counts to begin today's timeline.
            </p>
            <button className="btn btn-secondary" style={{ fontSize: "12.5px", padding: "6px 14px" }} onClick={onAddClick}>
              + Log First Event
            </button>
          </div>
        ) : (
          <div style={{ position: "relative", paddingLeft: "24px", maxHeight: "360px", overflowY: "auto" }}>
            {/* Vertical connecting line */}
            <div
              style={{
                position: "absolute",
                top: "14px",
                bottom: "14px",
                left: "8px",
                width: "2px",
                background: "rgba(255, 255, 255, 0.08)"
              }}
            />

            <div style={{ display: "grid", gap: "14px" }}>
              {todayEvents.map((event) => {
                const meta = getIcon(event.metric);
                const period = getTimePeriod(event.recordedAt);

                return (
                  <div key={event.id} style={{ display: "flex", alignItems: "flex-start", gap: "14px", position: "relative" }}>
                    {/* Timeline dot */}
                    <div
                      style={{
                        position: "absolute",
                        left: "-20px",
                        top: "5px",
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        background: meta.color,
                        boxShadow: `0 0 8px ${meta.color}`,
                        border: "2px solid #0e1524"
                      }}
                    />

                    {/* Timestamp & Day phase */}
                    <div style={{ width: "52px", flexShrink: 0, marginTop: "2px" }}>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "12px",
                          color: "var(--text-secondary)",
                          display: "block",
                          fontVariantNumeric: "tabular-nums"
                        }}
                      >
                        {formatTime(event.recordedAt)}
                      </span>
                      <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                        {period}
                      </span>
                    </div>

                    {/* Event Detail Card */}
                    <div
                      style={{
                        flex: 1,
                        background: "rgba(255, 255, 255, 0.02)",
                        border: "1px solid rgba(255, 255, 255, 0.05)",
                        borderRadius: "var(--radius-md)",
                        padding: "10px 14px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}
                    >
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span>{meta.icon}</span>
                          <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)" }}>
                            {meta.label}
                          </span>
                        </div>
                        {event.notes && (
                          <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                            {event.notes}
                          </p>
                        )}
                      </div>

                      <div style={{ fontFamily: "var(--font-mono)", fontWeight: "700", fontSize: "13.5px", color: meta.color, fontVariantNumeric: "tabular-nums" }}>
                        {formatDisplay(event)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.06)", paddingTop: "12px", marginTop: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>
          {todayEvents.length > 0 ? "Timeline updates automatically with each log." : "Waiting for today's first log."}
        </span>
        <button
          className="btn btn-secondary"
          style={{ padding: "4px 10px", fontSize: "11.5px" }}
          onClick={onAddClick}
        >
          + Add Entry
        </button>
      </div>
    </div>
  );
}
