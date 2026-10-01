import React, { useState } from "react";

export default function Analytics({ records = [], unitSystem = "metric" }) {
  const [timeRange, setTimeRange] = useState("30d"); // "7d" | "30d" | "90d" | "1y"
  const [selectedMetric, setSelectedMetric] = useState("heart_rate");
  const [activeSubTab, setActiveSubTab] = useState("trends"); // "trends" | "compare"

  // Comparison period
  const [compareMetric, setCompareMetric] = useState("steps");
  const [compareMode, setCompareMode] = useState("week"); // "week" | "month"

  const nowMs = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const ranges = {
    "7d": 7 * dayMs,
    "30d": 30 * dayMs,
    "90d": 90 * dayMs,
    "1y": 365 * dayMs
  };

  const cutoff = nowMs - ranges[timeRange];
  const metricRecords = records
    .filter((r) => r.metric === selectedMetric && new Date(r.recordedAt).getTime() >= cutoff)
    .sort((a, b) => new Date(a.recordedAt) - new Date(b.recordedAt));

  const METRIC_DEFS = {
    heart_rate: { label: "Heart Rate", icon: "❤️", unit: "bpm", color: "#f43f5e", chartType: "line" },
    blood_pressure: { label: "Blood Pressure", icon: "🩸", unit: "mmHg", color: "#8b5cf6", chartType: "two-series" },
    spo2: { label: "Blood Oxygen (SpO₂)", icon: "🫁", unit: "%", color: "#06b6d4", chartType: "line" },
    temperature: {
      label: "Body Temperature",
      icon: "🌡️",
      unit: unitSystem === "imperial" ? "°F" : "°C",
      color: "#f59e0b",
      chartType: "line"
    },
    steps: { label: "Steps & Walking", icon: "🚶", unit: "steps", color: "#10b981", chartType: "bar" },
    water: {
      label: "Hydration",
      icon: "💧",
      unit: unitSystem === "imperial" ? "fl oz" : "ml",
      color: "#38bdf8",
      chartType: "bar"
    },
    sleep: { label: "Sleep Duration", icon: "😴", unit: "hrs", color: "#a855f7", chartType: "bar" },
    activity: { label: "Active Minutes", icon: "⚡", unit: "mins", color: "#eab308", chartType: "line" },
    weight: {
      label: "Body Weight",
      icon: "⚖️",
      unit: unitSystem === "imperial" ? "lbs" : "kg",
      color: "#14b8a6",
      chartType: "line"
    }
  };

  const currentDef = METRIC_DEFS[selectedMetric] || METRIC_DEFS.heart_rate;

  function getDisplayValue(record, metricKey) {
    if (!record) return 0;
    if (metricKey === "blood_pressure") return record.value;
    if (metricKey === "sleep") return Number((record.value / 60).toFixed(1));
    if (metricKey === "temperature" && unitSystem === "imperial") {
      return Number(((record.value * 9) / 5 + 32).toFixed(1));
    }
    if (metricKey === "water" && unitSystem === "imperial") {
      return Number((record.value / 29.5735).toFixed(0));
    }
    if (metricKey === "weight" && unitSystem === "imperial") {
      return Number((record.value * 2.20462).toFixed(1));
    }
    return record.value;
  }

  // Calculate statistics
  let stats = { min: 0, max: 0, avg: 0, latest: "--", count: metricRecords.length, changePct: 0 };
  if (metricRecords.length > 0) {
    if (selectedMetric === "blood_pressure") {
      const sysVals = metricRecords.map((r) => r.value.systolic);
      const diaVals = metricRecords.map((r) => r.value.diastolic);
      const latestR = metricRecords[metricRecords.length - 1];
      const firstR = metricRecords[0];
      const changePct = firstR.value.systolic > 0 ? Math.round(((latestR.value.systolic - firstR.value.systolic) / firstR.value.systolic) * 100) : 0;
      stats = {
        minSys: Math.min(...sysVals),
        maxSys: Math.max(...sysVals),
        avgSys: Math.round(sysVals.reduce((a, b) => a + b, 0) / sysVals.length),
        avgDia: Math.round(diaVals.reduce((a, b) => a + b, 0) / diaVals.length),
        latest: `${latestR.value.systolic}/${latestR.value.diastolic}`,
        changePct,
        count: metricRecords.length
      };
    } else {
      const vals = metricRecords.map((r) => getDisplayValue(r, selectedMetric));
      const sum = vals.reduce((a, b) => a + b, 0);
      const latestVal = vals[vals.length - 1];
      const firstVal = vals[0];
      const changePct = firstVal > 0 ? Math.round(((latestVal - firstVal) / firstVal) * 100) : 0;
      stats = {
        min: Math.min(...vals),
        max: Math.max(...vals),
        avg: (sum / vals.length).toFixed(selectedMetric === "steps" ? 0 : 1),
        latest: selectedMetric === "steps" ? latestVal.toLocaleString() : latestVal.toFixed(1),
        changePct,
        count: metricRecords.length
      };
    }
  }

  // Comparison Calculations
  function computeComparison(metricKey, mode) {
    const periodDays = mode === "week" ? 7 : 30;
    const currentPeriodCutoff = nowMs - periodDays * dayMs;
    const previousPeriodCutoff = nowMs - 2 * periodDays * dayMs;

    const currentPeriodRecs = records.filter(
      (r) => r.metric === metricKey && new Date(r.recordedAt).getTime() >= currentPeriodCutoff
    );
    const prevPeriodRecs = records.filter(
      (r) =>
        r.metric === metricKey &&
        new Date(r.recordedAt).getTime() >= previousPeriodCutoff &&
        new Date(r.recordedAt).getTime() < currentPeriodCutoff
    );

    function sumOrAvg(recs) {
      if (recs.length === 0) return 0;
      if (metricKey === "blood_pressure") {
        return Math.round(recs.reduce((acc, r) => acc + r.value.systolic, 0) / recs.length);
      }
      const vals = recs.map((r) => getDisplayValue(r, metricKey));
      if (metricKey === "steps" || metricKey === "water" || metricKey === "activity") {
        return Math.round(vals.reduce((acc, v) => acc + v, 0));
      }
      return Number((vals.reduce((acc, v) => acc + v, 0) / vals.length).toFixed(1));
    }

    const currentVal = sumOrAvg(currentPeriodRecs);
    const prevVal = sumOrAvg(prevPeriodRecs);

    let diffPct = 0;
    if (prevVal > 0) {
      diffPct = Number((((currentVal - prevVal) / prevVal) * 100).toFixed(1));
    }

    return {
      currentVal,
      prevVal,
      diffPct,
      currentCount: currentPeriodRecs.length,
      prevCount: prevPeriodRecs.length
    };
  }

  const comparisonData = computeComparison(compareMetric, compareMode);
  const compDef = METRIC_DEFS[compareMetric] || METRIC_DEFS.steps;

  return (
    <div>
      {/* Top Header & Sub-tab switcher */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "26px", fontWeight: "700", marginBottom: "4px" }}>Biometric Analytics & Trends</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
            Visual longitudinal trends, statistical distribution, and period-over-period comparisons
          </p>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => setActiveSubTab("trends")}
            className={activeSubTab === "trends" ? "btn btn-primary" : "btn btn-secondary"}
            style={{ padding: "8px 16px", fontSize: "13px" }}
          >
            📈 Trend Visualizer
          </button>
          <button
            onClick={() => setActiveSubTab("compare")}
            className={activeSubTab === "compare" ? "btn btn-primary" : "btn btn-secondary"}
            style={{ padding: "8px 16px", fontSize: "13px" }}
          >
            ⚖️ Period Comparison
          </button>
        </div>
      </div>

      {activeSubTab === "compare" ? (
        /* Period-Over-Period Comparison Section */
        <div style={{ display: "grid", gap: "24px" }}>
          <div className="glass-card" style={{ padding: "26px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "14px" }}>
              <div>
                <h2 style={{ fontSize: "17px", fontWeight: "700" }}>Period Comparison Analysis</h2>
                <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  Neutral statistical comparison of your recent performance against the previous period
                </p>
              </div>

              {/* Mode Switcher */}
              <div style={{ display: "flex", background: "rgba(255,255,255,0.04)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "4px" }}>
                <button
                  onClick={() => setCompareMode("week")}
                  style={{
                    padding: "6px 14px",
                    fontSize: "12.5px",
                    fontWeight: "600",
                    borderRadius: "var(--radius-sm)",
                    color: compareMode === "week" ? "#ffffff" : "var(--text-muted)",
                    background: compareMode === "week" ? "rgba(255, 255, 255, 0.12)" : "transparent"
                  }}
                >
                  This Week vs Last Week
                </button>
                <button
                  onClick={() => setCompareMode("month")}
                  style={{
                    padding: "6px 14px",
                    fontSize: "12.5px",
                    fontWeight: "600",
                    borderRadius: "var(--radius-sm)",
                    color: compareMode === "month" ? "#ffffff" : "var(--text-muted)",
                    background: compareMode === "month" ? "rgba(255, 255, 255, 0.12)" : "transparent"
                  }}
                >
                  This Month vs Last Month
                </button>
              </div>
            </div>

            {/* Metric Selector for Comparison */}
            <div style={{ display: "flex", gap: "10px", overflowX: "auto", paddingBottom: "10px", marginBottom: "24px" }}>
              {Object.entries(METRIC_DEFS).map(([key, def]) => {
                const isSelected = compareMetric === key;
                return (
                  <button
                    key={key}
                    onClick={() => setCompareMetric(key)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "8px 16px",
                      borderRadius: "var(--radius-full)",
                      fontSize: "13px",
                      fontWeight: "600",
                      whiteSpace: "nowrap",
                      background: isSelected ? `${def.color}22` : "rgba(255, 255, 255, 0.04)",
                      border: `1px solid ${isSelected ? def.color : "var(--border-subtle)"}`,
                      color: isSelected ? "#ffffff" : "var(--text-secondary)"
                    }}
                  >
                    <span>{def.icon}</span>
                    <span>{def.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Comparison Cards Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "18px", marginBottom: "20px" }}>
              <div className="glass-card" style={{ padding: "20px", background: "rgba(255, 255, 255, 0.02)" }}>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>
                  Current {compareMode === "week" ? "Week" : "Month"}
                </p>
                <div style={{ fontSize: "28px", fontWeight: "800", fontFamily: "var(--font-mono)", color: compDef.color }}>
                  {comparisonData.currentVal.toLocaleString()}{" "}
                  <span style={{ fontSize: "14px", color: "var(--text-muted)", fontWeight: "500" }}>{compDef.unit}</span>
                </div>
                <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
                  {comparisonData.currentCount} recorded observation{comparisonData.currentCount !== 1 ? "s" : ""}
                </p>
              </div>

              <div className="glass-card" style={{ padding: "20px", background: "rgba(255, 255, 255, 0.02)" }}>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>
                  Previous {compareMode === "week" ? "Week" : "Month"}
                </p>
                <div style={{ fontSize: "28px", fontWeight: "800", fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>
                  {comparisonData.prevVal.toLocaleString()}{" "}
                  <span style={{ fontSize: "14px", color: "var(--text-muted)", fontWeight: "500" }}>{compDef.unit}</span>
                </div>
                <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
                  {comparisonData.prevCount} recorded observation{comparisonData.prevCount !== 1 ? "s" : ""}
                </p>
              </div>

              <div className="glass-card" style={{ padding: "20px", background: "rgba(255, 255, 255, 0.02)" }}>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>
                  Statistical Variance
                </p>
                <div style={{ fontSize: "28px", fontWeight: "800", fontFamily: "var(--font-mono)", color: comparisonData.diffPct >= 0 ? "#10b981" : "#f43f5e" }}>
                  {comparisonData.diffPct >= 0 ? `+${comparisonData.diffPct}%` : `${comparisonData.diffPct}%`}
                </div>
                <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
                  Relative to prior period baseline
                </p>
              </div>
            </div>

            <div style={{ fontSize: "12px", color: "var(--text-muted)", padding: "12px 16px", background: "rgba(255,255,255,0.02)", borderRadius: "var(--radius-md)" }}>
              ℹ️ <strong>Neutral Statistical Output:</strong> Percentages reflect observational changes in your logged data points and are not medical health outcomes.
            </div>
          </div>
        </div>
      ) : (
        /* Trends & Graphs Section */
        <div>
          {/* Controls Bar: Metric selector & Time range pills */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "14px" }}>
            {/* Time range buttons */}
            <div style={{ display: "flex", background: "rgba(255,255,255,0.04)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "4px" }}>
              {[
                { id: "7d", label: "7 Days" },
                { id: "30d", label: "30 Days" },
                { id: "90d", label: "90 Days" },
                { id: "1y", label: "1 Year" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setTimeRange(tab.id)}
                  style={{
                    padding: "6px 14px",
                    fontSize: "12.5px",
                    fontWeight: "600",
                    borderRadius: "var(--radius-sm)",
                    color: timeRange === tab.id ? "#ffffff" : "var(--text-muted)",
                    background: timeRange === tab.id ? "rgba(255, 255, 255, 0.12)" : "transparent"
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Metric Selector Pills */}
          <div style={{ display: "flex", gap: "10px", overflowX: "auto", paddingBottom: "10px", marginBottom: "20px" }}>
            {Object.entries(METRIC_DEFS).map(([key, def]) => {
              const isSelected = selectedMetric === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedMetric(key)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 16px",
                    borderRadius: "var(--radius-full)",
                    fontSize: "13px",
                    fontWeight: "600",
                    whiteSpace: "nowrap",
                    background: isSelected ? `${def.color}22` : "rgba(255, 255, 255, 0.04)",
                    border: `1px solid ${isSelected ? def.color : "var(--border-subtle)"}`,
                    color: isSelected ? "#ffffff" : "var(--text-secondary)"
                  }}
                >
                  <span>{def.icon}</span>
                  <span>{def.label}</span>
                </button>
              );
            })}
          </div>

          {/* Stats Summary Cards (Average, Min, Max, Latest, Change) */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "14px", marginBottom: "24px" }}>
            <div className="glass-card" style={{ padding: "18px" }}>
              <p style={{ fontSize: "11.5px", color: "var(--text-muted)", marginBottom: "4px" }}>Total Recorded Entries</p>
              <div style={{ fontSize: "24px", fontWeight: "700", fontFamily: "var(--font-mono)" }}>{stats.count}</div>
            </div>

            {selectedMetric === "blood_pressure" ? (
              <>
                <div className="glass-card" style={{ padding: "18px" }}>
                  <p style={{ fontSize: "11.5px", color: "var(--text-muted)", marginBottom: "4px" }}>Latest Reading</p>
                  <div style={{ fontSize: "24px", fontWeight: "700", fontFamily: "var(--font-mono)", color: currentDef.color }}>
                    {stats.count > 0 ? stats.latest : "--"}{" "}
                    <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>mmHg</span>
                  </div>
                </div>
                <div className="glass-card" style={{ padding: "18px" }}>
                  <p style={{ fontSize: "11.5px", color: "var(--text-muted)", marginBottom: "4px" }}>Period Average</p>
                  <div style={{ fontSize: "24px", fontWeight: "700", fontFamily: "var(--font-mono)" }}>
                    {stats.count > 0 ? `${stats.avgSys}/${stats.avgDia}` : "--"}
                  </div>
                </div>
                <div className="glass-card" style={{ padding: "18px" }}>
                  <p style={{ fontSize: "11.5px", color: "var(--text-muted)", marginBottom: "4px" }}>Systolic Range</p>
                  <div style={{ fontSize: "24px", fontWeight: "700", fontFamily: "var(--font-mono)" }}>
                    {stats.count > 0 ? `${stats.minSys} - ${stats.maxSys}` : "--"}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="glass-card" style={{ padding: "18px" }}>
                  <p style={{ fontSize: "11.5px", color: "var(--text-muted)", marginBottom: "4px" }}>Latest Reading</p>
                  <div style={{ fontSize: "24px", fontWeight: "700", fontFamily: "var(--font-mono)", color: currentDef.color }}>
                    {stats.count > 0 ? stats.latest : "--"}{" "}
                    <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>{currentDef.unit}</span>
                  </div>
                </div>
                <div className="glass-card" style={{ padding: "18px" }}>
                  <p style={{ fontSize: "11.5px", color: "var(--text-muted)", marginBottom: "4px" }}>Period Average</p>
                  <div style={{ fontSize: "24px", fontWeight: "700", fontFamily: "var(--font-mono)" }}>
                    {stats.count > 0 ? stats.avg : "--"}{" "}
                    <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>{currentDef.unit}</span>
                  </div>
                </div>
                <div className="glass-card" style={{ padding: "18px" }}>
                  <p style={{ fontSize: "11.5px", color: "var(--text-muted)", marginBottom: "4px" }}>Min / Max Range</p>
                  <div style={{ fontSize: "22px", fontWeight: "700", fontFamily: "var(--font-mono)" }}>
                    {stats.count > 0 ? `${stats.min} - ${stats.max}` : "--"}{" "}
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{currentDef.unit}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Main Interactive SVG Chart (Supports Line, Bar, and Dual-Series) */}
          <div className="glass-card" style={{ padding: "26px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "16px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>{currentDef.icon}</span>
                <span>{currentDef.label} Trend ({currentDef.unit})</span>
              </h2>
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                {metricRecords.length} data point{metricRecords.length !== 1 ? "s" : ""}
              </span>
            </div>

            {metricRecords.length === 0 ? (
              <div style={{ height: "260px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
                <span style={{ fontSize: "36px", marginBottom: "8px" }}>📈</span>
                <p style={{ fontSize: "14px", fontWeight: "500" }}>No recorded readings in this timeframe</p>
                <p style={{ fontSize: "12px" }}>Record readings or select a broader time window</p>
              </div>
            ) : (
              <div style={{ width: "100%", overflowX: "auto" }}>
                <InteractiveSVGChart
                  data={metricRecords}
                  metric={selectedMetric}
                  chartType={currentDef.chartType}
                  color={currentDef.color}
                  unit={currentDef.unit}
                  getDisplayValue={getDisplayValue}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function InteractiveSVGChart({ data, metric, chartType = "line", color, unit = "", getDisplayValue }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const width = 850;
  const height = 240;
  const padL = 60;
  const padR = 30;
  const padT = 25;
  const padB = 40;

  const innerW = width - padL - padR;
  const innerH = height - padT - padB;

  let minVal = 0;
  let maxVal = 100;

  const resolveVal = (d) => (getDisplayValue ? getDisplayValue(d, metric) : (metric === "sleep" ? d.value / 60 : d.value));

  if (metric === "blood_pressure") {
    const sysVals = data.map((d) => d.value.systolic);
    const diaVals = data.map((d) => d.value.diastolic);
    minVal = Math.floor(Math.min(...diaVals) * 0.9);
    maxVal = Math.ceil(Math.max(...sysVals) * 1.1);
  } else {
    const vals = data.map((d) => resolveVal(d));
    if (chartType === "bar") {
      minVal = 0;
      maxVal = Math.ceil(Math.max(...vals) * 1.15) || 100;
    } else {
      minVal = Math.floor(Math.min(...vals) * 0.9);
      maxVal = Math.ceil(Math.max(...vals) * 1.1);
      if (minVal === maxVal) {
        minVal -= 5;
        maxVal += 5;
      }
    }
  }

  const range = maxVal - minVal || 1;
  const count = data.length;
  const stepX = count > 1 ? innerW / (count - 1) : innerW;

  const yTicks = [minVal, Math.round(minVal + range * 0.5), maxVal];

  // Bar chart rendering for Steps, Water, Sleep
  if (chartType === "bar") {
    const barWidth = Math.max(8, Math.min(32, (innerW / count) * 0.65));
    return (
      <div style={{ position: "relative" }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: "auto", overflow: "visible" }}>
          {/* Horizontal Grid lines */}
          {yTicks.map((tickVal, i) => {
            const y = padT + innerH - ((tickVal - minVal) / range) * innerH;
            return (
              <g key={i}>
                <line x1={padL} y1={y} x2={width - padR} y2={y} stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
                <text x={padL - 10} y={y + 4} fill="var(--text-muted)" fontSize="11" textAnchor="end" fontFamily="var(--font-mono)">
                  {tickVal}
                </text>
              </g>
            );
          })}

          {/* Bars */}
          {data.map((d, i) => {
            const val = resolveVal(d);
            const barH = Math.max(3, ((val - minVal) / range) * innerH);
            const x = padL + i * (innerW / count) + (innerW / count - barWidth) / 2;
            const y = padT + innerH - barH;

            return (
              <g key={i}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barH}
                  rx="4"
                  fill={color}
                  fillOpacity="0.85"
                  style={{ cursor: "pointer", transition: "fill-opacity 0.15s" }}
                  onMouseEnter={() =>
                    setHoveredPoint({
                      x: x + barWidth / 2,
                      y,
                      val: metric === "sleep" ? `${val} hrs` : `${val.toLocaleString()} ${unit}`,
                      date: d.recordedAt,
                      note: d.notes,
                      color
                    })
                  }
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              </g>
            );
          })}

          {/* Date labels on X axis */}
          {data.map((d, i) => {
            if (count > 8 && i % Math.ceil(count / 7) !== 0 && i !== count - 1) return null;
            const x = padL + i * (innerW / count) + (innerW / count) / 2;
            const dObj = new Date(d.recordedAt);
            const label = `${dObj.getMonth() + 1}/${dObj.getDate()}`;
            return (
              <text key={i} x={x} y={height - 10} fill="var(--text-muted)" fontSize="11" textAnchor="middle" fontFamily="var(--font-sans)">
                {label}
              </text>
            );
          })}
        </svg>

        {hoveredPoint && (
          <div
            style={{
              position: "absolute",
              left: `${(hoveredPoint.x / width) * 100}%`,
              top: `${(hoveredPoint.y / height) * 100}%`,
              transform: "translate(-50%, -120%)",
              background: "rgba(10, 16, 28, 0.95)",
              backdropFilter: "blur(12px)",
              border: `1px solid ${hoveredPoint.color}`,
              borderRadius: "8px",
              padding: "6px 12px",
              fontSize: "12px",
              pointerEvents: "none",
              whiteSpace: "nowrap",
              boxShadow: "0 8px 20px rgba(0,0,0,0.5)",
              zIndex: 10
            }}
          >
            <div style={{ fontWeight: "700", color: hoveredPoint.color }}>
              {hoveredPoint.val}
            </div>
            <div style={{ color: "var(--text-muted)", fontSize: "10.5px" }}>
              {new Date(hoveredPoint.date).toLocaleDateString([], { month: "short", day: "numeric" })}
            </div>
            {hoveredPoint.note && (
              <div style={{ color: "var(--text-secondary)", fontSize: "10.5px", marginTop: "2px" }}>
                {hoveredPoint.note}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Line / Multi-series rendering for vitals
  let linePaths = [];
  if (metric === "blood_pressure") {
    const sysPts = data.map((d, i) => {
      const x = padL + i * stepX;
      const y = padT + innerH - ((d.value.systolic - minVal) / range) * innerH;
      return { x, y, val: `${d.value.systolic} (Sys)`, date: d.recordedAt, note: d.notes };
    });
    const diaPts = data.map((d, i) => {
      const x = padL + i * stepX;
      const y = padT + innerH - ((d.value.diastolic - minVal) / range) * innerH;
      return { x, y, val: `${d.value.diastolic} (Dia)`, date: d.recordedAt, note: d.notes };
    });

    linePaths = [
      { pts: sysPts, color: "#f43f5e", label: "Systolic" },
      { pts: diaPts, color: "#38bdf8", label: "Diastolic" }
    ];
  } else {
    const pts = data.map((d, i) => {
      const val = resolveVal(d);
      const x = padL + i * stepX;
      const y = padT + innerH - ((val - minVal) / range) * innerH;
      return { x, y, val: `${val} ${unit}`, date: d.recordedAt, note: d.notes };
    });
    linePaths = [{ pts, color, label: metric }];
  }

  return (
    <div style={{ position: "relative" }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: "auto", overflow: "visible" }}>
        {/* Horizontal Grid lines */}
        {yTicks.map((tickVal, i) => {
          const y = padT + innerH - ((tickVal - minVal) / range) * innerH;
          return (
            <g key={i}>
              <line x1={padL} y1={y} x2={width - padR} y2={y} stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
              <text x={padL - 10} y={y + 4} fill="var(--text-muted)" fontSize="11" textAnchor="end" fontFamily="var(--font-mono)">
                {tickVal}
              </text>
            </g>
          );
        })}

        {/* Curves & Points */}
        {linePaths.map((lp, idx) => {
          const dStr = `M ${lp.pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" L ")}`;
          return (
            <g key={idx}>
              <path d={dStr} fill="none" stroke={lp.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              {lp.pts.map((p, pIdx) => (
                <circle
                  key={pIdx}
                  cx={p.x}
                  cy={p.y}
                  r="5"
                  fill="#0e1524"
                  stroke={lp.color}
                  strokeWidth="2.5"
                  style={{ cursor: "pointer", transition: "r 0.15s" }}
                  onMouseEnter={() => setHoveredPoint({ ...p, color: lp.color })}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              ))}
            </g>
          );
        })}

        {/* Date labels on X axis */}
        {data.map((d, i) => {
          if (data.length > 8 && i % Math.ceil(data.length / 7) !== 0 && i !== data.length - 1) return null;
          const x = padL + i * stepX;
          const dObj = new Date(d.recordedAt);
          const label = `${dObj.getMonth() + 1}/${dObj.getDate()}`;
          return (
            <text key={i} x={x} y={height - 10} fill="var(--text-muted)" fontSize="11" textAnchor="middle" fontFamily="var(--font-sans)">
              {label}
            </text>
          );
        })}
      </svg>

      {/* Floating Tooltip */}
      {hoveredPoint && (
        <div
          style={{
            position: "absolute",
            left: `${(hoveredPoint.x / width) * 100}%`,
            top: `${(hoveredPoint.y / height) * 100}%`,
            transform: "translate(-50%, -120%)",
            background: "rgba(10, 16, 28, 0.95)",
            backdropFilter: "blur(12px)",
            border: `1px solid ${hoveredPoint.color}`,
            borderRadius: "8px",
            padding: "6px 12px",
            fontSize: "12px",
            pointerEvents: "none",
            whiteSpace: "nowrap",
            boxShadow: "0 8px 20px rgba(0,0,0,0.5)",
            zIndex: 10
          }}
        >
          <div style={{ fontWeight: "700", color: hoveredPoint.color }}>
            {hoveredPoint.val} {unit}
          </div>
          <div style={{ color: "var(--text-muted)", fontSize: "10.5px" }}>
            {new Date(hoveredPoint.date).toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
          </div>
          {hoveredPoint.note && (
            <div style={{ color: "var(--text-secondary)", fontSize: "10.5px", marginTop: "2px" }}>
              {hoveredPoint.note}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
