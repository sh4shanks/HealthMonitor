import React, { useState } from "react";

export default function WellnessScore({ records = [], goals = {} }) {
  const [showFormulaModal, setShowFormulaModal] = useState(false);
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayRecords = records.filter((r) => r.recordedAt.slice(0, 10) === todayStr);

  const stepsTarget = goals?.steps || 10000;
  const waterTarget = goals?.waterMl || 2500;
  const sleepTarget = goals?.sleepMinutes || 480;
  const activeTarget = goals?.activeMinutes || 45;

  const todaySteps = todayRecords
    .filter((r) => r.metric === "steps")
    .reduce((acc, r) => acc + (typeof r.value === "number" ? r.value : 0), 0);

  const todayWater = todayRecords
    .filter((r) => r.metric === "water")
    .reduce((acc, r) => acc + (typeof r.value === "number" ? r.value : 0), 0);

  const todaySleep = todayRecords
    .filter((r) => r.metric === "sleep")
    .reduce((acc, r) => acc + (typeof r.value === "number" ? r.value : 0), 0);

  const todayActive = todayRecords
    .filter((r) => r.metric === "activity")
    .reduce((acc, r) => acc + (typeof r.value === "number" ? r.value : 0), 0);

  // Compute sub-scores (0-25 each, sum to 100)
  const stepsScore = Math.min(25, Math.round((todaySteps / stepsTarget) * 25));
  const waterScore = Math.min(25, Math.round((todayWater / waterTarget) * 25));
  const sleepScore = Math.min(25, Math.round((todaySleep / sleepTarget) * 25));
  const activeScore = Math.min(25, Math.round((todayActive / activeTarget) * 25));

  // If no activity logged but steps are high, award proportional active score
  const adjustedActiveScore = activeScore > 0 ? activeScore : Math.min(25, Math.round((todaySteps / stepsTarget) * 20));

  const totalScore = Math.min(100, stepsScore + waterScore + sleepScore + adjustedActiveScore);

  let statusLabel = "Starting";
  let statusColor = "#94a3b8";

  if (totalScore >= 85) {
    statusLabel = "Optimal Progress";
    statusColor = "#10b981";
  } else if (totalScore >= 70) {
    statusLabel = "Good Progress";
    statusColor = "#06b6d4";
  } else if (totalScore >= 50) {
    statusLabel = "Moderate Progress";
    statusColor = "#3b82f6";
  } else if (totalScore > 0) {
    statusLabel = "Building Progress";
    statusColor = "#f59e0b";
  }

  // Circular gauge calculations
  const size = 154;
  const strokeWidth = 11;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (totalScore / 100) * circumference;

  return (
    <div className="glass-card" style={{ padding: "26px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
          <div>
            <h2 style={{ fontSize: "16px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px", letterSpacing: "-0.01em" }}>
              <span>🌟</span> Wellness Score
            </h2>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "3px" }}>
              Personal habit & activity index · Non-medical evaluation
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: "600", color: statusColor }}>
            <span
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                backgroundColor: statusColor,
                display: "inline-block",
                boxShadow: `0 0 8px ${statusColor}80`
              }}
            />
            <span>{statusLabel}</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around", gap: "24px", flexWrap: "wrap", margin: "16px 0 20px" }}>
          {/* SVG Circular Ring Gauge */}
          <div style={{ position: "relative", width: size, height: size }}>
            <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
              {/* Background Track */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="rgba(255, 255, 255, 0.06)"
                strokeWidth={strokeWidth}
              />
              {/* Progress Stroke */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={statusColor}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)" }}
              />
            </svg>
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <span
                style={{
                  fontSize: "38px",
                  fontWeight: "800",
                  fontFamily: "var(--font-mono)",
                  fontVariantNumeric: "tabular-nums",
                  color: "var(--text-primary)",
                  lineHeight: 1,
                  letterSpacing: "-0.03em"
                }}
              >
                {totalScore}
              </span>
              <span style={{ fontSize: "10px", fontWeight: "700", letterSpacing: "0.1em", color: "var(--text-muted)", textTransform: "uppercase", marginTop: "4px" }}>
                INDEX / 100
              </span>
            </div>
          </div>

          {/* Calculation breakdown */}
          <div style={{ flex: 1, minWidth: "190px", display: "grid", gap: "10px" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px", marginBottom: "3px" }}>
                <span style={{ color: "var(--text-secondary)" }}>🚶 Daily Steps Target</span>
                <span style={{ fontWeight: "600", fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums" }}>{stepsScore}/25 pts</span>
              </div>
              <div className="progress-track" style={{ height: "4px" }}>
                <div className="progress-fill" style={{ width: `${(stepsScore / 25) * 100}%`, background: "#10b981" }} />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px", marginBottom: "3px" }}>
                <span style={{ color: "var(--text-secondary)" }}>💧 Hydration Target</span>
                <span style={{ fontWeight: "600", fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums" }}>{waterScore}/25 pts</span>
              </div>
              <div className="progress-track" style={{ height: "4px" }}>
                <div className="progress-fill" style={{ width: `${(waterScore / 25) * 100}%`, background: "#38bdf8" }} />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px", marginBottom: "3px" }}>
                <span style={{ color: "var(--text-secondary)" }}>😴 Sleep Duration</span>
                <span style={{ fontWeight: "600", fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums" }}>{sleepScore}/25 pts</span>
              </div>
              <div className="progress-track" style={{ height: "4px" }}>
                <div className="progress-fill" style={{ width: `${(sleepScore / 25) * 100}%`, background: "#a855f7" }} />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px", marginBottom: "3px" }}>
                <span style={{ color: "var(--text-secondary)" }}>⚡ Active Habits</span>
                <span style={{ fontWeight: "600", fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums" }}>{adjustedActiveScore}/25 pts</span>
              </div>
              <div className="progress-track" style={{ height: "4px" }}>
                <div className="progress-fill" style={{ width: `${(adjustedActiveScore / 25) * 100}%`, background: "#eab308" }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          borderTop: "1px solid rgba(255, 255, 255, 0.06)",
          paddingTop: "12px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "11px",
          color: "var(--text-muted)"
        }}
      >
        <span>Based strictly on your tracked goals & activity. Not a medical score.</span>
        <button
          onClick={() => setShowFormulaModal(true)}
          style={{
            color: "var(--accent-cyan)",
            fontSize: "11px",
            textDecoration: "underline",
            padding: "2px 4px",
            fontWeight: "500"
          }}
        >
          Calculation Details
        </button>
      </div>

      {/* Formula Explanation Dialog */}
      {showFormulaModal && (
        <div className="modal-backdrop" onClick={() => setShowFormulaModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "460px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: "700" }}>Wellness Score Calculation</h3>
              <button onClick={() => setShowFormulaModal(false)} style={{ color: "var(--text-muted)", fontSize: "18px" }}>
                &times;
              </button>
            </div>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.5", marginBottom: "14px" }}>
              The Wellness Score is an aggregate lifestyle index (0–100) reflecting daily consistency toward user-configured wellness targets.
            </p>
            <ul style={{ paddingLeft: "18px", fontSize: "12.5px", color: "var(--text-secondary)", lineHeight: "1.6", marginBottom: "16px" }}>
              <li><strong>Steps (25 pts):</strong> Calculated as min(25, (todaySteps / stepTarget) × 25).</li>
              <li><strong>Hydration (25 pts):</strong> Calculated as min(25, (todayWater / waterTarget) × 25).</li>
              <li><strong>Sleep (25 pts):</strong> Calculated as min(25, (sleepMinutes / sleepTarget) × 25).</li>
              <li><strong>Active Habits (25 pts):</strong> Calculated from active workout minutes or extended step consistency.</li>
            </ul>
            <div style={{ padding: "10px 14px", background: "rgba(255, 255, 255, 0.03)", borderRadius: "var(--radius-sm)", fontSize: "11px", color: "var(--text-muted)", marginBottom: "16px" }}>
              <strong>Notice:</strong> This index does not incorporate clinical diagnostic criteria, lab biomarkers, or electrocardiogram data. Consult qualified medical practitioners for medical evaluation.
            </div>
            <button className="btn btn-secondary" style={{ width: "100%" }} onClick={() => setShowFormulaModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
