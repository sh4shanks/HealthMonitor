import React, { useState } from "react";
import { METRIC_CONFIGS } from "./AddHealthDataModal.jsx";

export default function QuickAddFab({ onSelectMetric }) {
  const [open, setOpen] = useState(false);

  const quickItems = [
    { metric: "heart_rate", label: "Heart Rate", icon: "❤️" },
    { metric: "blood_pressure", label: "Blood Pressure", icon: "🩸" },
    { metric: "spo2", label: "SpO₂", icon: "🫁" },
    { metric: "temperature", label: "Temperature", icon: "🌡️" },
    { metric: "steps", label: "Steps", icon: "🚶" },
    { metric: "water", label: "Water", icon: "💧" },
    { metric: "sleep", label: "Sleep", icon: "😴" },
    { metric: "activity", label: "Activity", icon: "⚡" },
    { metric: "weight", label: "Weight", icon: "⚖️" }
  ];

  function handlePick(m) {
    setOpen(false);
    onSelectMetric(m);
  }

  return (
    <>
      {/* Backdrop when menu is expanded */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(3, 7, 18, 0.6)",
            backdropFilter: "blur(4px)",
            zIndex: 90
          }}
        />
      )}

      {/* Floating Action Menu Panel */}
      <div
        style={{
          position: "fixed",
          bottom: "28px",
          right: "28px",
          zIndex: 95,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end"
        }}
      >
        {open && (
          <div
            className="glass-card"
            style={{
              padding: "16px",
              marginBottom: "14px",
              width: "280px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
              animation: "scaleUp 0.18s cubic-bezier(0.16, 1, 0.3, 1)",
              border: "1px solid rgba(6, 182, 212, 0.3)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "8px" }}>
              <span style={{ fontSize: "12px", fontWeight: "700", letterSpacing: "0.05em", color: "var(--accent-cyan)", textTransform: "uppercase" }}>
                Quick Log Entry
              </span>
              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Select biometric</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {quickItems.map((item) => (
                <button
                  key={item.metric}
                  onClick={() => handlePick(item.metric)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 10px",
                    borderRadius: "10px",
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid var(--border-subtle)",
                    fontSize: "12.5px",
                    fontWeight: "600",
                    color: "var(--text-primary)",
                    textAlign: "left"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(6, 182, 212, 0.12)";
                    e.currentTarget.style.borderColor = "rgba(6, 182, 212, 0.35)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
                    e.currentTarget.style.borderColor = "var(--border-subtle)";
                  }}
                >
                  <span style={{ fontSize: "16px" }}>{item.icon}</span>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* The Primary FAB Button */}
        <button
          onClick={() => setOpen(!open)}
          aria-label="Quick Add Health Entry"
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #06b6d4, #2563eb)",
            color: "#ffffff",
            boxShadow: "0 8px 24px rgba(6, 182, 212, 0.4), 0 0 1px 1px rgba(255, 255, 255, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "26px",
            fontWeight: "400",
            transition: "all 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
            transform: open ? "rotate(45deg) scale(1.05)" : "scale(1)"
          }}
        >
          +
        </button>
      </div>
    </>
  );
}
