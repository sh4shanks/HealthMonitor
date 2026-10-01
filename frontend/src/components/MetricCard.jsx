import React from "react";
import Sparkline from "./Sparkline.jsx";

export default function MetricCard({
  title,
  icon,
  value,
  unit,
  status = "Normal",
  statusType = "normal", // "normal" | "attention" | "warning"
  trendText,
  historyData = [],
  color = "#06b6d4",
  lastUpdated,
  onClick
}) {
  const isAttention = statusType === "attention" || statusType === "warning";
  const statusColor = isAttention ? "#fbbf24" : "#94a3b8";

  return (
    <div
      className="glass-card glass-card-interactive"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick && onClick()}
      style={{
        padding: "20px 22px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        transition: "transform 0.18s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.18s ease, box-shadow 0.18s ease",
        cursor: onClick ? "pointer" : "default"
      }}
    >
      <div>
        {/* Top Header: Icon + Title + Unboxed Status */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: `${color}15`,
                border: `1px solid ${color}30`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "17px",
                flexShrink: 0
              }}
            >
              {icon}
            </div>
            <div>
              <h3 style={{ fontSize: "13.5px", fontWeight: "600", color: "var(--text-secondary)", letterSpacing: "-0.01em" }}>
                {title}
              </h3>
            </div>
          </div>

          {/* Clean Unboxed Status Indicator (Zero-Pill Discipline) */}
          <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "11.5px", fontWeight: "600", color: statusColor }}>
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                backgroundColor: isAttention ? "#fbbf24" : "var(--accent-emerald)",
                display: "inline-block",
                boxShadow: isAttention ? "0 0 8px rgba(251, 191, 36, 0.6)" : "0 0 8px rgba(16, 185, 129, 0.4)"
              }}
            />
            <span>{status}</span>
          </div>
        </div>

        {/* Primary Value with Tabular Numerals */}
        <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "12px" }}>
          <span
            style={{
              fontSize: "30px",
              fontWeight: "800",
              fontFamily: "var(--font-mono)",
              fontVariantNumeric: "tabular-nums",
              color: "var(--text-primary)",
              letterSpacing: "-0.03em",
              lineHeight: 1
            }}
          >
            {value !== undefined && value !== null ? value : "--"}
          </span>
          {unit && (
            <span style={{ fontSize: "12.5px", fontWeight: "500", color: "var(--text-muted)", letterSpacing: "0.01em" }}>
              {unit}
            </span>
          )}
        </div>

        {/* Mini Sparkline Chart */}
        <div style={{ margin: "6px 0 12px" }}>
          <Sparkline data={historyData} color={color} height={38} />
        </div>
      </div>

      {/* Footer Info: Trend + Last Updated with Typographic Separator */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "11.5px",
          color: "var(--text-muted)",
          borderTop: "1px solid rgba(255, 255, 255, 0.06)",
          paddingTop: "10px",
          marginTop: "4px"
        }}
      >
        <span
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: "165px",
            color: trendText && trendText.includes("↑") ? "var(--text-secondary)" : "var(--text-muted)"
          }}
        >
          {trendText || "No prior readings"}
        </span>
        <span
          style={{
            color: "var(--text-muted)",
            fontSize: "11px",
            flexShrink: 0,
            fontVariantNumeric: "tabular-nums"
          }}
        >
          {lastUpdated ? lastUpdated : "Inspect →"}
        </span>
      </div>
    </div>
  );
}
