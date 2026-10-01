import React from "react";
import { formatWater } from "../utils/units.js";

export default function SmartInsights({ records = [], goals = {}, unitSystem = "metric" }) {
  const insights = [];

  const nowMs = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const cutoff7d = nowMs - 7 * dayMs;
  const cutoff14d = nowMs - 14 * dayMs;

  const recordsLast7d = records.filter((r) => new Date(r.recordedAt).getTime() >= cutoff7d);
  const recordsPrev7d = records.filter(
    (r) => new Date(r.recordedAt).getTime() >= cutoff14d && new Date(r.recordedAt).getTime() < cutoff7d
  );

  const waterTarget = goals?.waterMl || 2500;
  const stepTarget = goals?.steps || 10000;

  // 1. Sleep Insight
  const sleep7d = recordsLast7d.filter((r) => r.metric === "sleep").map((r) => r.value);
  const sleepPrev7d = recordsPrev7d.filter((r) => r.metric === "sleep").map((r) => r.value);
  if (sleep7d.length >= 2 && sleepPrev7d.length >= 2) {
    const avgSleep7 = sleep7d.reduce((a, b) => a + b, 0) / sleep7d.length;
    const avgSleepPrev = sleepPrev7d.reduce((a, b) => a + b, 0) / sleepPrev7d.length;
    const diffPct = Math.round(((avgSleep7 - avgSleepPrev) / avgSleepPrev) * 100);

    if (diffPct !== 0) {
      insights.push({
        id: "sleep-trend",
        icon: "😴",
        title: "Sleep Duration Trend",
        text: `Your recorded sleep duration averaged ${(avgSleep7 / 60).toFixed(1)} hrs over the last 7 days (${Math.abs(diffPct)}% ${diffPct > 0 ? "higher" : "lower"} than your previous 7-day average of ${(avgSleepPrev / 60).toFixed(1)} hrs).`,
        type: diffPct > 0 ? "positive" : "neutral"
      });
    }
  }

  // 2. Steps Consistency & Trend
  const steps7d = recordsLast7d.filter((r) => r.metric === "steps").map((r) => r.value);
  const stepsPrev7d = recordsPrev7d.filter((r) => r.metric === "steps").map((r) => r.value);
  if (steps7d.length >= 2 && stepsPrev7d.length >= 2) {
    const avgSteps7 = Math.round(steps7d.reduce((a, b) => a + b, 0) / steps7d.length);
    const avgStepsPrev = Math.round(stepsPrev7d.reduce((a, b) => a + b, 0) / stepsPrev7d.length);
    const diffPct = Math.round(((avgSteps7 - avgStepsPrev) / avgStepsPrev) * 100);
    if (diffPct !== 0) {
      insights.push({
        id: "steps-trend",
        icon: "🚶",
        title: "Weekly Activity Variance",
        text: `Your daily step count averaged ${avgSteps7.toLocaleString()} steps over the past 7 days, a ${Math.abs(diffPct)}% ${diffPct > 0 ? "increase" : "decrease"} compared with the preceding week.`,
        type: diffPct > 0 ? "positive" : "neutral"
      });
    }
  }

  const stepDaysMet = new Set();
  recordsLast7d.filter((r) => r.metric === "steps" && r.value >= stepTarget).forEach((r) => {
    stepDaysMet.add(r.recordedAt.slice(0, 10));
  });

  if (stepDaysMet.size > 0) {
    insights.push({
      id: "steps-goal",
      icon: "🎯",
      title: "Activity Target Reached",
      text: `You achieved your target of ${stepTarget.toLocaleString()} steps on ${stepDaysMet.size} of the last 7 recorded days.`,
      type: "positive"
    });
  }

  // 3. Hydration Goal
  const waterDaysMet = new Set();
  recordsLast7d.filter((r) => r.metric === "water" && r.value >= waterTarget).forEach((r) => {
    waterDaysMet.add(r.recordedAt.slice(0, 10));
  });

  if (waterDaysMet.size > 0) {
    const formattedTarget = formatWater(waterTarget, unitSystem);
    insights.push({
      id: "water-goal",
      icon: "💧",
      title: "Hydration Target Consistency",
      text: `You reached your water target of ${formattedTarget.value} ${formattedTarget.unit} on ${waterDaysMet.size} of the last 7 days.`,
      type: "positive"
    });
  }

  // 4. Resting Heart Rate Stability
  const hr7d = recordsLast7d.filter((r) => r.metric === "heart_rate").map((r) => r.value);
  if (hr7d.length >= 2) {
    const minHR = Math.min(...hr7d);
    const maxHR = Math.max(...hr7d);
    const avgHR = Math.round(hr7d.reduce((a, b) => a + b, 0) / hr7d.length);
    insights.push({
      id: "hr-range",
      icon: "❤️",
      title: "Resting Heart Rate Range",
      text: `Your recorded heart rate readings over the last 7 days averaged ${avgHR} bpm (ranging between ${minHR} and ${maxHR} bpm across ${hr7d.length} check-ins).`,
      type: "neutral"
    });
  }

  // 5. Blood Pressure Stability
  const bp7d = recordsLast7d.filter((r) => r.metric === "blood_pressure");
  if (bp7d.length >= 2) {
    const avgSys = Math.round(bp7d.reduce((a, b) => a + b.value.systolic, 0) / bp7d.length);
    const avgDia = Math.round(bp7d.reduce((a, b) => a + b.value.diastolic, 0) / bp7d.length);
    insights.push({
      id: "bp-trend",
      icon: "🩸",
      title: "Blood Pressure Distribution",
      text: `Your recorded blood pressure readings over the last 7 days averaged ${avgSys}/${avgDia} mmHg across ${bp7d.length} readings.`,
      type: "neutral"
    });
  }

  // Fallback default insights if minimal data
  if (insights.length === 0) {
    insights.push(
      {
        id: "start-logging",
        icon: "💡",
        title: "Building Habit Insights",
        text: "Log your daily steps, hydration, and sleep regularly. As multiple days of recordings accumulate, automated neutral comparison trends will populate here.",
        type: "neutral"
      },
      {
        id: "goal-tracking",
        icon: "🎯",
        title: "Target Tracking",
        text: `Your current benchmarks are set to ${stepTarget.toLocaleString()} steps and ${formatWater(waterTarget, unitSystem).value} ${formatWater(waterTarget, unitSystem).unit} of water daily. Customize these at any time in the Goals tab.`,
        type: "neutral"
      }
    );
  }

  return (
    <div className="glass-card" style={{ padding: "26px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
          <div>
            <h2 style={{ fontSize: "16px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px", letterSpacing: "-0.01em" }}>
              <span>💡</span> Your Insights
            </h2>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
              Neutral statistical comparisons of your own recorded habits & trends
            </p>
          </div>
          {/* Zero-pill unboxed label */}
          <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "500", letterSpacing: "0.02em" }}>
            Neutral · Non-Diagnostic
          </span>
        </div>

        <div style={{ display: "grid", gap: "12px", maxHeight: "360px", overflowY: "auto" }}>
          {insights.map((item) => (
            <div
              key={item.id}
              style={{
                padding: "14px 16px",
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px solid rgba(255, 255, 255, 0.06)",
                borderRadius: "var(--radius-md)",
                display: "flex",
                alignItems: "flex-start",
                gap: "14px"
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  background: "rgba(6, 182, 212, 0.12)",
                  border: "1px solid rgba(6, 182, 212, 0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                  flexShrink: 0
                }}
              >
                {item.icon}
              </div>
              <div>
                <h4 style={{ fontSize: "13.5px", fontWeight: "600", color: "var(--text-primary)", marginBottom: "3px" }}>
                  {item.title}
                </h4>
                <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                  {item.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.06)", paddingTop: "10px", marginTop: "14px", fontSize: "11px", color: "var(--text-muted)" }}>
        🔒 Insights strictly summarize statistical differences in your logged entries. No medical conditions are diagnosed.
      </div>
    </div>
  );
}
