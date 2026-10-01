import React, { useState } from "react";
import MetricCard from "./MetricCard.jsx";
import MyDayTimeline from "./MyDayTimeline.jsx";
import SmartInsights from "./SmartInsights.jsx";
import WellnessScore from "./WellnessScore.jsx";
import { formatTemperature, formatWater, formatSleep } from "../utils/units.js";

export default function Dashboard({
  records = [],
  goals,
  profile,
  ranges = {},
  onOpenAddModal,
  onNavigateTab
}) {
  const [showAlertsDrawer, setShowAlertsDrawer] = useState(false);
  const nowMs = Date.now();
  const todayStr = new Date().toISOString().slice(0, 10);
  const unitSystem = profile?.unitSystem || "metric";

  function getLatest(metric) {
    return records.find((r) => r.metric === metric) || null;
  }

  function getHistory(metric, limit = 8) {
    return records
      .filter((r) => r.metric === metric)
      .slice(0, limit)
      .reverse()
      .map((r) => {
        if (metric === "blood_pressure") {
          return r.value.systolic;
        }
        if (metric === "sleep") {
          return Number((r.value / 60).toFixed(1));
        }
        if (metric === "temperature" && unitSystem === "imperial") {
          return Number(((r.value * 9) / 5 + 32).toFixed(1));
        }
        if (metric === "water" && unitSystem === "imperial") {
          return Number((r.value / 29.5735).toFixed(0));
        }
        return r.value;
      });
  }

  function formatRelativeTime(iso) {
    if (!iso) return "";
    const diff = Math.floor((nowMs - new Date(iso).getTime()) / 60000);
    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff}m ago`;
    const hrs = Math.floor(diff / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return new Date(iso).toLocaleDateString([], { month: "short", day: "numeric" });
  }

  // Calculate comparisons vs yesterday or recent average
  function getMetricTrendComparison(metric, latestRecord) {
    if (!latestRecord) return "No data recorded";
    const priorRecs = records.filter(
      (r) => r.metric === metric && r.id !== latestRecord.id
    );
    if (priorRecs.length === 0) return "First recorded entry";

    const prevRec = priorRecs[0];
    const prevVal = typeof prevRec.value === "object" ? prevRec.value.systolic : prevRec.value;
    const currentVal = typeof latestRecord.value === "object" ? latestRecord.value.systolic : latestRecord.value;

    if (prevVal > 0) {
      const diffPct = Math.round(((currentVal - prevVal) / prevVal) * 100);
      if (diffPct === 0) return "Stable vs prior reading";
      return diffPct > 0 ? `↑ ${diffPct}% from previous` : `↓ ${Math.abs(diffPct)}% from previous`;
    }
    return "Stable vs prior";
  }

  const latestHR = getLatest("heart_rate");
  const latestBP = getLatest("blood_pressure");
  const latestSpO2 = getLatest("spo2");
  const latestTemp = getLatest("temperature");
  const latestSteps = getLatest("steps");
  const latestWater = getLatest("water");
  const latestSleep = getLatest("sleep");
  const latestActivity = getLatest("activity");

  // Determine Alert Indicators based on configured neutral baseline ranges
  const alerts = [];
  if (profile?.trackingAlertsEnabled !== false) {
    if (latestHR && (latestHR.value < 55 || latestHR.value > 105)) {
      alerts.push({
        id: "hr",
        metric: "Heart Rate",
        msg: `Your recorded heart rate (${latestHR.value} bpm) is outside standard resting baseline (55-105 bpm).`,
        time: latestHR.recordedAt
      });
    }
    if (latestSpO2 && latestSpO2.value < 94) {
      alerts.push({
        id: "spo2",
        metric: "Blood Oxygen",
        msg: `Your recorded oxygen saturation (${latestSpO2.value}%) is below configured threshold (94%).`,
        time: latestSpO2.recordedAt
      });
    }
    if (latestBP && (latestBP.value.systolic > 135 || latestBP.value.diastolic > 88)) {
      alerts.push({
        id: "bp",
        metric: "Blood Pressure",
        msg: `Your recorded blood pressure (${latestBP.value.systolic}/${latestBP.value.diastolic} mmHg) is above standard resting target.`,
        time: latestBP.recordedAt
      });
    }
  }

  // Time-of-day greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const userName = profile?.name || "Shashank";

  const currentDateStr = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  });

  // Calculate today's summary progress
  const stepTarget = goals?.steps || 10000;
  const currentSteps = latestSteps?.value || 0;
  const stepPct = Math.min(100, Math.round((currentSteps / stepTarget) * 100));

  const waterTarget = goals?.waterMl || 2500;
  const currentWater = latestWater?.value || 0;
  const waterPct = Math.min(100, Math.round((currentWater / waterTarget) * 100));

  const sleepMinutes = latestSleep?.value || 0;
  const sleepTarget = goals?.sleepMinutes || 480;
  const sleepPct = Math.min(100, Math.round((sleepMinutes / sleepTarget) * 100));
  const sleepDisplay = formatSleep(sleepMinutes);

  const activeTarget = goals?.activeMinutes || 45;
  const currentActive = latestActivity?.value || 0;
  const activePct = Math.min(100, Math.round((currentActive / activeTarget) * 100));

  // Count goals met today
  let goalsCompletedCount = 0;
  if (currentSteps >= stepTarget) goalsCompletedCount++;
  if (currentWater >= waterTarget) goalsCompletedCount++;
  if (sleepMinutes >= sleepTarget) goalsCompletedCount++;
  if (currentActive >= activeTarget) goalsCompletedCount++;

  // Today's total measurements count
  const todayRecords = records.filter((r) => r.recordedAt.slice(0, 10) === todayStr);
  const todayRecordsCount = todayRecords.length;

  // Missing data list for today
  const missingDataItems = [];
  if (!todayRecords.some((r) => r.metric === "sleep")) {
    missingDataItems.push("Sleep duration hasn't been logged today");
  }
  if (!todayRecords.some((r) => r.metric === "water")) {
    missingDataItems.push("No hydration entries recorded for today yet");
  }
  if (!todayRecords.some((r) => r.metric === "heart_rate")) {
    missingDataItems.push("Resting heart rate check hasn't been logged today");
  }
  if (!todayRecords.some((r) => r.metric === "steps")) {
    missingDataItems.push("Daily steps haven't been synchronized or logged today");
  }

  // Factual trend observations comparing today against recent logs
  const observations = [];
  const cutoff7d = nowMs - 7 * 24 * 60 * 60 * 1000;
  const recentSteps = records
    .filter((r) => r.metric === "steps" && new Date(r.recordedAt).getTime() >= cutoff7d && r.recordedAt.slice(0, 10) !== todayStr)
    .map((r) => r.value);
  if (recentSteps.length >= 2 && currentSteps > 0) {
    const avgRecentSteps = Math.round(recentSteps.reduce((a, b) => a + b, 0) / recentSteps.length);
    if (currentSteps > avgRecentSteps) {
      observations.push(`Your step count today is ${Math.round(((currentSteps - avgRecentSteps) / avgRecentSteps) * 100)}% higher than your recent 7-day average.`);
    } else {
      observations.push(`Today's steps are currently pacing below your 7-day average of ${avgRecentSteps.toLocaleString()} steps.`);
    }
  } else if (currentSteps > 0 && currentSteps < stepTarget) {
    observations.push(`You are ${(stepTarget - currentSteps).toLocaleString()} steps away from reaching today's target.`);
  }

  if (currentWater > 0 && currentWater < waterTarget) {
    const remainingMl = waterTarget - currentWater;
    observations.push(`Hydration is ${(remainingMl / 1000).toFixed(1)} L away from your daily goal.`);
  } else if (currentWater >= waterTarget) {
    observations.push("You have reached your daily hydration target for today.");
  }

  // Formatted Temperature
  const tempFormatted = latestTemp ? formatTemperature(latestTemp.value, unitSystem) : null;
  const waterFormatted = latestWater ? formatWater(latestWater.value, unitSystem) : null;
  const waterTargetFormatted = formatWater(waterTarget, unitSystem);

  return (
    <div>
      {/* 1. TOP: Today's Command Center Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
          flexWrap: "wrap",
          gap: "16px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {/* User Profile Avatar */}
          <div
            onClick={() => onNavigateTab("profile")}
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #06b6d4, #2563eb)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "19px",
              fontWeight: "700",
              color: "#ffffff",
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(6, 182, 212, 0.25)",
              flexShrink: 0
            }}
            title="Open Profile"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onNavigateTab("profile")}
          >
            {userName.charAt(0).toUpperCase()}
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <h1
                style={{
                  fontSize: "clamp(22px, 3.5vw, 28px)",
                  fontWeight: "800",
                  letterSpacing: "-0.03em",
                  color: "var(--text-primary)",
                  lineHeight: 1.2
                }}
              >
                {greeting}, {userName}
              </h1>

              {/* Notification / Alert Indicator (Zero-Pill Discipline) */}
              {alerts.length > 0 && (
                <button
                  onClick={() => setShowAlertsDrawer(!showAlertsDrawer)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#fbbf24",
                    background: "rgba(245, 158, 11, 0.12)",
                    border: "1px solid rgba(245, 158, 11, 0.3)",
                    padding: "4px 10px",
                    borderRadius: "var(--radius-sm)"
                  }}
                  title="Click to view baseline notifications"
                >
                  <span>⚠️</span>
                  <span>{alerts.length} Baseline Notification{alerts.length !== 1 ? "s" : ""}</span>
                </button>
              )}
            </div>

            <p style={{ color: "var(--text-secondary)", fontSize: "13.5px", marginTop: "3px" }}>
              {currentDateStr} · Here's your wellness overview for today.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            className="btn btn-secondary"
            onClick={() => onNavigateTab("settings")}
            aria-label="Open Settings"
            style={{ padding: "9px 14px", fontSize: "13px" }}
          >
            ⚙️ Settings
          </button>
          <button
            className="btn btn-primary"
            onClick={() => onOpenAddModal(null)}
            style={{ padding: "9px 18px", fontSize: "13.5px" }}
          >
            <span style={{ fontSize: "16px", fontWeight: "700" }}>+</span> Add Health Data
          </button>
        </div>
      </div>

      {/* Safety & Non-Medical Notice */}
      <div className="disclaimer-banner">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
        <span>
          <strong>Personal Tracking Dashboard:</strong> All metrics are for personal wellness logging. Not intended to diagnose, treat, or replace professional healthcare consultations.
        </span>
      </div>

      {/* Baseline Notifications Box */}
      {(showAlertsDrawer || alerts.length > 0) && alerts.length > 0 && (
        <div style={{ marginBottom: "22px" }}>
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="glass-card"
              style={{
                padding: "14px 18px",
                marginBottom: "10px",
                borderColor: "rgba(245, 158, 11, 0.3)",
                background: "rgba(245, 158, 11, 0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                flexWrap: "wrap"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "20px" }}>⚠️</span>
                <div>
                  <h4 style={{ fontSize: "13.5px", fontWeight: "600", color: "#fbbf24" }}>
                    {alert.metric} Baseline Notification
                  </h4>
                  <p style={{ fontSize: "12.5px", color: "var(--text-secondary)" }}>
                    {alert.msg}
                  </p>
                </div>
              </div>
              <button
                className="btn btn-secondary"
                style={{ padding: "6px 12px", fontSize: "12px" }}
                onClick={() => onNavigateTab("timeline")}
              >
                Review Measurement →
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Empty State Banner if no records exist at all */}
      {records.length === 0 ? (
        <div className="glass-card" style={{ padding: "52px 24px", textAlign: "center", marginBottom: "32px" }}>
          <div style={{ fontSize: "48px", marginBottom: "14px" }}>🩺</div>
          <h2 style={{ fontSize: "22px", fontWeight: "700", marginBottom: "8px" }}>No health data recorded yet</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "14.5px", maxWidth: "460px", margin: "0 auto 24px" }}>
            Start building your wellness timeline by recording your first vital metric, or load demonstration data from Settings.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "14px", flexWrap: "wrap" }}>
            <button className="btn btn-primary" onClick={() => onOpenAddModal(null)}>
              + Add First Record
            </button>
            <button className="btn btn-secondary" onClick={() => onNavigateTab("settings")}>
              Load Demo Readings
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* 2. SECOND: Primary Health Metrics Grid (Row 1: Vitals) */}
          <div className="metrics-grid">
            {/* Heart Rate */}
            <MetricCard
              title="Heart Rate"
              icon="❤️"
              value={latestHR?.value}
              unit="BPM"
              status={latestHR ? (latestHR.value > 100 || latestHR.value < 55 ? "Notice" : "Resting") : "No Data"}
              statusType={latestHR && (latestHR.value > 100 || latestHR.value < 55) ? "attention" : "normal"}
              trendText={getMetricTrendComparison("heart_rate", latestHR)}
              lastUpdated={formatRelativeTime(latestHR?.recordedAt)}
              historyData={getHistory("heart_rate")}
              color="#f43f5e"
              onClick={() => onNavigateTab("analytics")}
            />

            {/* Blood Pressure */}
            <MetricCard
              title="Blood Pressure"
              icon="🩸"
              value={latestBP ? `${latestBP.value.systolic}/${latestBP.value.diastolic}` : "--"}
              unit="mmHg"
              status={latestBP ? (latestBP.value.systolic > 135 ? "Elevated" : "Optimal") : "No Data"}
              statusType={latestBP && latestBP.value.systolic > 135 ? "attention" : "normal"}
              trendText={getMetricTrendComparison("blood_pressure", latestBP)}
              lastUpdated={formatRelativeTime(latestBP?.recordedAt)}
              historyData={getHistory("blood_pressure")}
              color="#8b5cf6"
              onClick={() => onNavigateTab("analytics")}
            />

            {/* Blood Oxygen */}
            <MetricCard
              title="Blood Oxygen"
              icon="🫁"
              value={latestSpO2?.value}
              unit="SpO₂ %"
              status={latestSpO2 ? (latestSpO2.value < 95 ? "Attention" : "Standard") : "No Data"}
              statusType={latestSpO2 && latestSpO2.value < 95 ? "attention" : "normal"}
              trendText={getMetricTrendComparison("spo2", latestSpO2)}
              lastUpdated={formatRelativeTime(latestSpO2?.recordedAt)}
              historyData={getHistory("spo2")}
              color="#06b6d4"
              onClick={() => onNavigateTab("analytics")}
            />

            {/* Temperature */}
            <MetricCard
              title="Temperature"
              icon="🌡️"
              value={tempFormatted ? tempFormatted.value : "--"}
              unit={tempFormatted ? tempFormatted.unit : unitSystem === "imperial" ? "°F" : "°C"}
              status={latestTemp ? (latestTemp.value > 37.8 ? "Warm" : "Normal") : "No Data"}
              statusType={latestTemp && latestTemp.value > 37.8 ? "attention" : "normal"}
              trendText={getMetricTrendComparison("temperature", latestTemp)}
              lastUpdated={formatRelativeTime(latestTemp?.recordedAt)}
              historyData={getHistory("temperature")}
              color="#f59e0b"
              onClick={() => onNavigateTab("analytics")}
            />
          </div>

          {/* 3. THIRD: Activity + Sleep + Hydration + Active Minutes (Row 2) */}
          <div className="metrics-grid" style={{ marginBottom: "26px" }}>
            {/* Steps & Walking */}
            <MetricCard
              title="Daily Steps"
              icon="🚶"
              value={latestSteps ? latestSteps.value.toLocaleString() : "--"}
              unit="steps"
              status={`${stepPct}% target`}
              statusType="normal"
              trendText={getMetricTrendComparison("steps", latestSteps)}
              lastUpdated={formatRelativeTime(latestSteps?.recordedAt)}
              historyData={getHistory("steps")}
              color="#10b981"
              onClick={() => onNavigateTab("goals")}
            />

            {/* Hydration */}
            <MetricCard
              title="Hydration"
              icon="💧"
              value={waterFormatted ? waterFormatted.value : "--"}
              unit={waterFormatted ? waterFormatted.unit : unitSystem === "imperial" ? "fl oz" : "L"}
              status={`${waterPct}% target`}
              statusType="normal"
              trendText={getMetricTrendComparison("water", latestWater)}
              lastUpdated={formatRelativeTime(latestWater?.recordedAt)}
              historyData={getHistory("water")}
              color="#38bdf8"
              onClick={() => onNavigateTab("goals")}
            />

            {/* Sleep */}
            <MetricCard
              title="Sleep Duration"
              icon="😴"
              value={latestSleep ? sleepDisplay.display : "--"}
              unit=""
              status={latestSleep ? (sleepMinutes >= sleepTarget ? "Restful" : "Short") : "No Data"}
              statusType="normal"
              trendText={getMetricTrendComparison("sleep", latestSleep)}
              lastUpdated={formatRelativeTime(latestSleep?.recordedAt)}
              historyData={getHistory("sleep")}
              color="#a855f7"
              onClick={() => onNavigateTab("analytics")}
            />

            {/* Active Minutes */}
            <MetricCard
              title="Active Minutes"
              icon="⚡"
              value={latestActivity ? `${latestActivity.value}` : "--"}
              unit="mins"
              status={`${activePct}% target`}
              statusType="normal"
              trendText={getMetricTrendComparison("activity", latestActivity)}
              lastUpdated={formatRelativeTime(latestActivity?.recordedAt)}
              historyData={getHistory("activity")}
              color="#eab308"
              onClick={() => onNavigateTab("goals")}
            />
          </div>
        </>
      )}

      {/* 4. FOURTH: Daily Summary + Smart Insights */}
      <div className="two-col-grid" style={{ marginBottom: "26px" }}>
        {/* Daily Summary Card */}
        <div className="glass-card" style={{ padding: "26px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: "700", letterSpacing: "-0.01em" }}>TODAY'S SUMMARY</h3>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                  {todayRecordsCount} measurement{todayRecordsCount !== 1 ? "s" : ""} logged · {goalsCompletedCount} of 4 goals completed
                </p>
              </div>
              <button
                className="btn btn-secondary"
                style={{ padding: "5px 12px", fontSize: "12px" }}
                onClick={() => onNavigateTab("goals")}
              >
                Goals &rarr;
              </button>
            </div>

            {/* Progress Bars for Goals */}
            <div style={{ display: "grid", gap: "12px", marginBottom: "18px" }}>
              {/* Steps */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "5px" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span>🚶</span> <strong>Steps:</strong> {currentSteps.toLocaleString()} / {stepTarget.toLocaleString()}
                  </span>
                  <span style={{ fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums", color: "var(--text-secondary)" }}>
                    {stepPct}%
                  </span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${stepPct}%`, background: "linear-gradient(90deg, #10b981, #06b6d4)" }} />
                </div>
              </div>

              {/* Water */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "5px" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span>💧</span> <strong>Hydration:</strong> {waterFormatted ? `${waterFormatted.value} ${waterFormatted.unit}` : "--"} / {waterTargetFormatted.value} {waterTargetFormatted.unit}
                  </span>
                  <span style={{ fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums", color: "var(--text-secondary)" }}>
                    {waterPct}%
                  </span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${waterPct}%`, background: "linear-gradient(90deg, #38bdf8, #6366f1)" }} />
                </div>
              </div>

              {/* Sleep */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "5px" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span>😴</span> <strong>Sleep:</strong> {latestSleep ? sleepDisplay.display : "Not recorded today"}
                  </span>
                  <span style={{ fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums", color: "var(--text-secondary)" }}>
                    {latestSleep ? `${sleepPct}%` : "Pending"}
                  </span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${latestSleep ? sleepPct : 0}%`, background: "linear-gradient(90deg, #a855f7, #ec4899)" }} />
                </div>
              </div>

              {/* Activity */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "5px" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span>⚡</span> <strong>Active Minutes:</strong> {currentActive} / {activeTarget} mins
                  </span>
                  <span style={{ fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums", color: "var(--text-secondary)" }}>
                    {activePct}%
                  </span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${activePct}%`, background: "linear-gradient(90deg, #eab308, #f97316)" }} />
                </div>
              </div>
            </div>

            {/* Factual Missing Data & Trend Observations */}
            <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.06)", paddingTop: "14px", display: "grid", gap: "8px" }}>
              {observations.map((obs, i) => (
                <p key={`obs-${i}`} style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: "1.4" }}>
                  📈 {obs}
                </p>
              ))}
              {missingDataItems.slice(0, 2).map((item, i) => (
                <p key={`miss-${i}`} style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: "1.4" }}>
                  ℹ️ {item}
                </p>
              ))}
            </div>
          </div>

          <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.06)", paddingTop: "10px", marginTop: "14px", fontSize: "11px", color: "var(--text-muted)" }}>
            Observations are factual summaries of your recorded session data.
          </div>
        </div>

        {/* Smart Insights */}
        <SmartInsights records={records} goals={goals} />
      </div>

      {/* 5. FIFTH: Wellness Score + Chronological "My Day" Timeline */}
      <div className="two-col-grid">
        <WellnessScore records={records} goals={goals} />
        <MyDayTimeline records={records} onAddClick={() => onOpenAddModal(null)} />
      </div>
    </div>
  );
}
