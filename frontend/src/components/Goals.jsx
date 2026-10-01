import React, { useState } from "react";
import { formatWater } from "../utils/units.js";

export default function Goals({ goals, records = [], onUpdateGoals, onQuickLog, unitSystem = "metric" }) {
  const [editing, setEditing] = useState(false);
  const [stepsGoal, setStepsGoal] = useState(goals?.steps || 10000);
  const [waterGoal, setWaterGoal] = useState(goals?.waterMl || 2500);
  const [sleepGoalHours, setSleepGoalHours] = useState(
    goals?.sleepMinutes ? (goals.sleepMinutes / 60).toString() : "8"
  );
  const [activeGoal, setActiveGoal] = useState(goals?.activeMinutes || 45);
  const [saving, setSaving] = useState(false);
  const [quickLogSuccess, setQuickLogSuccess] = useState("");

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayRecords = records.filter((r) => r.recordedAt.slice(0, 10) === todayStr);

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

  // Consistency & Streaks calculation over the last 14 days
  function calculateStreakAndWeeklyConsistency(metric, target) {
    const daysMap = {};
    records.filter((r) => r.metric === metric).forEach((r) => {
      const d = r.recordedAt.slice(0, 10);
      daysMap[d] = (daysMap[d] || 0) + (typeof r.value === "number" ? r.value : 0);
    });

    // Check last 7 days completed count
    let completedInLast7 = 0;
    const now = new Date();
    for (let i = 0; i < 7; i++) {
      const checkDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      if ((daysMap[checkDate] || 0) >= target) {
        completedInLast7++;
      }
    }

    // Check current streak backwards starting from today or yesterday
    let streak = 0;
    let dayCursor = 0;
    // Check if today already achieved
    const todayAchieved = (daysMap[todayStr] || 0) >= target;
    if (todayAchieved) {
      streak = 1;
      dayCursor = 1;
    } else {
      // check from yesterday
      dayCursor = 1;
    }

    while (dayCursor < 30) {
      const checkDate = new Date(now.getTime() - dayCursor * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      if ((daysMap[checkDate] || 0) >= target) {
        streak++;
        dayCursor++;
      } else {
        break;
      }
    }

    return { completedInLast7, streak };
  }

  const targetSteps = goals?.steps || 10000;
  const targetWater = goals?.waterMl || 2500;
  const targetSleep = goals?.sleepMinutes || 480;
  const targetActive = goals?.activeMinutes || 45;

  const stepStats = calculateStreakAndWeeklyConsistency("steps", targetSteps);
  const waterStats = calculateStreakAndWeeklyConsistency("water", targetWater);
  const sleepStats = calculateStreakAndWeeklyConsistency("sleep", targetSleep);
  const activeStats = calculateStreakAndWeeklyConsistency("activity", targetActive);

  const stepPct = Math.min(100, Math.round((todaySteps / (targetSteps || 1)) * 100));
  const waterPct = Math.min(100, Math.round((todayWater / (targetWater || 1)) * 100));
  const sleepPct = Math.min(100, Math.round((todaySleep / (targetSleep || 1)) * 100));
  const activePct = Math.min(100, Math.round((todayActive / (targetActive || 1)) * 100));

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const parsedSleepHours = parseFloat(sleepGoalHours) || 8;
      await onUpdateGoals({
        steps: Math.max(500, parseInt(stepsGoal, 10) || 10000),
        waterMl: Math.max(250, parseInt(waterGoal, 10) || 2500),
        sleepMinutes: Math.max(60, Math.round(parsedSleepHours * 60)),
        activeMinutes: Math.max(10, parseInt(activeGoal, 10) || 45)
      });
      setEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function handleQuickAdd(metric, delta, unit, label) {
    if (!onQuickLog) return;
    try {
      await onQuickLog({
        metric,
        value: delta,
        unit,
        notes: `Quick log (+${label})`
      });
      setQuickLogSuccess(`Logged +${label}!`);
      setTimeout(() => setQuickLogSuccess(""), 3000);
    } catch (err) {
      console.error(err);
    }
  }

  const goalCards = [
    {
      id: "steps",
      title: "Daily Steps",
      icon: "🚶",
      current: todaySteps,
      target: targetSteps,
      pct: stepPct,
      unit: "steps",
      color: "#10b981",
      glowColor: "rgba(16, 185, 129, 0.25)",
      bgGradient: "linear-gradient(90deg, #10b981, #06b6d4)",
      displayValue: todaySteps.toLocaleString(),
      displayTarget: `${targetSteps.toLocaleString()} steps`,
      remaining: targetSteps > todaySteps ? `${(targetSteps - todaySteps).toLocaleString()} steps remaining` : "Daily step goal completed!",
      streak: stepStats.streak,
      weeklyConsistency: `${stepStats.completedInLast7} / 7 days completed`,
      quickButtons: [
        { label: "1,000 steps", val: 1000, unit: "steps" },
        { label: "2,500 steps", val: 2500, unit: "steps" }
      ]
    },
    {
      id: "water",
      title: "Daily Hydration",
      icon: "💧",
      current: todayWater,
      target: targetWater,
      pct: waterPct,
      unit: "ml",
      color: "#38bdf8",
      glowColor: "rgba(56, 189, 248, 0.25)",
      bgGradient: "linear-gradient(90deg, #38bdf8, #6366f1)",
      displayValue: `${formatWater(todayWater, unitSystem).value} ${formatWater(todayWater, unitSystem).unit}`,
      displayTarget: `${formatWater(targetWater, unitSystem).value} ${formatWater(targetWater, unitSystem).unit}`,
      remaining: targetWater > todayWater ? `${formatWater(targetWater - todayWater, unitSystem).value} ${formatWater(targetWater, unitSystem).unit} to goal` : "Daily hydration target reached!",
      streak: waterStats.streak,
      weeklyConsistency: `${waterStats.completedInLast7} / 7 days completed`,
      quickButtons: [
        { label: "250 ml (Glass)", val: 250, unit: "ml" },
        { label: "500 ml (Bottle)", val: 500, unit: "ml" }
      ]
    },
    {
      id: "sleep",
      title: "Sleep Duration",
      icon: "😴",
      current: todaySleep,
      target: targetSleep,
      pct: sleepPct,
      unit: "minutes",
      color: "#a855f7",
      glowColor: "rgba(168, 85, 247, 0.25)",
      bgGradient: "linear-gradient(90deg, #a855f7, #ec4899)",
      displayValue: `${Math.floor(todaySleep / 60)}h ${todaySleep % 60}m`,
      displayTarget: `${(targetSleep / 60).toFixed(1)} hrs (${Math.floor(targetSleep / 60)}h ${targetSleep % 60}m)`,
      remaining: targetSleep > todaySleep ? `${Math.floor((targetSleep - todaySleep) / 60)}h ${(targetSleep - todaySleep) % 60}m needed` : "Rest target achieved!",
      streak: sleepStats.streak,
      weeklyConsistency: `${sleepStats.completedInLast7} / 7 days completed`,
      quickButtons: [
        { label: "7.5 hrs", val: 450, unit: "minutes" },
        { label: "8.0 hrs", val: 480, unit: "minutes" }
      ]
    },
    {
      id: "activity",
      title: "Active Minutes",
      icon: "⚡",
      current: todayActive,
      target: targetActive,
      pct: activePct,
      unit: "minutes",
      color: "#eab308",
      glowColor: "rgba(234, 179, 8, 0.25)",
      bgGradient: "linear-gradient(90deg, #eab308, #f97316)",
      displayValue: `${todayActive} mins`,
      displayTarget: `${targetActive} active mins`,
      remaining: targetActive > todayActive ? `${targetActive - todayActive} mins remaining` : "Daily activity milestone achieved!",
      streak: activeStats.streak,
      weeklyConsistency: `${activeStats.completedInLast7} / 7 days completed`,
      quickButtons: [
        { label: "15 mins", val: 15, unit: "minutes" },
        { label: "30 mins", val: 30, unit: "minutes" }
      ]
    }
  ];

  return (
    <div>
      {/* Top Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "26px", fontWeight: "700", marginBottom: "4px" }}>Goals & Consistency</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
            Track daily targets, weekly completion rates, and goal achievement streaks
          </p>
        </div>
        <button
          className="btn btn-secondary"
          onClick={() => setEditing(!editing)}
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
        >
          <span>{editing ? "✕ Close Editor" : "⚙️ Adjust Targets"}</span>
        </button>
      </div>

      {quickLogSuccess && (
        <div style={{
          background: "rgba(16, 185, 129, 0.15)",
          border: "1px solid rgba(16, 185, 129, 0.3)",
          color: "#34d399",
          padding: "10px 16px",
          borderRadius: "var(--radius-md)",
          fontSize: "13px",
          marginBottom: "20px"
        }}>
          ✨ {quickLogSuccess}
        </div>
      )}

      {/* Target Customization Form */}
      {editing && (
        <div className="glass-card" style={{ padding: "26px", marginBottom: "28px", border: "1px solid rgba(6, 182, 212, 0.3)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
            <h2 style={{ fontSize: "17px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>🎯</span> Configure Daily Goals
            </h2>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Values save directly to session</span>
          </div>

          <form onSubmit={handleSave}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "18px" }}>
              <div className="form-group">
                <label className="form-label">
                  <span>🚶 Daily Steps Target</span>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>steps/day</span>
                </label>
                <input
                  type="number"
                  className="form-input"
                  value={stepsGoal}
                  onChange={(e) => setStepsGoal(e.target.value)}
                  min="1000"
                  max="100000"
                  step="500"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>💧 Daily Hydration Target</span>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>ml/day</span>
                </label>
                <input
                  type="number"
                  className="form-input"
                  value={waterGoal}
                  onChange={(e) => setWaterGoal(e.target.value)}
                  min="500"
                  max="10000"
                  step="100"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>😴 Sleep Goal</span>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>hours/night</span>
                </label>
                <input
                  type="number"
                  className="form-input"
                  value={sleepGoalHours}
                  onChange={(e) => setSleepGoalHours(e.target.value)}
                  min="4"
                  max="14"
                  step="0.5"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span>⚡ Active Minutes</span>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>mins/day</span>
                </label>
                <input
                  type="number"
                  className="form-input"
                  value={activeGoal}
                  onChange={(e) => setActiveGoal(e.target.value)}
                  min="10"
                  max="360"
                  step="5"
                  required
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "16px", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
              <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)} disabled={saving}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Saving Targets..." : "Apply Target Goals"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Target Progress Glass Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "22px" }}>
        {goalCards.map((g) => {
          const isDone = g.pct >= 100;
          return (
            <div
              key={g.id}
              className="glass-card"
              style={{
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                position: "relative",
                overflow: "hidden"
              }}
            >
              <div>
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "12px",
                        background: `${g.color}15`,
                        border: `1px solid ${g.color}35`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "20px"
                      }}
                    >
                      {g.icon}
                    </div>
                    <div>
                      <h3 style={{ fontSize: "16px", fontWeight: "700" }}>{g.title}</h3>
                      <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>Target: {g.displayTarget}</p>
                    </div>
                  </div>

                  <span
                    className={`badge ${isDone ? "badge-normal" : ""}`}
                    style={{
                      fontSize: "12px",
                      padding: "4px 10px",
                      color: isDone ? "#34d399" : g.color,
                      border: `1px solid ${isDone ? "rgba(16, 185, 129, 0.4)" : `${g.color}40`}`,
                      background: isDone ? "rgba(16, 185, 129, 0.15)" : `${g.color}15`
                    }}
                  >
                    {isDone ? "✓ 100%" : `${g.pct}%`}
                  </span>
                </div>

                {/* Main Values Display */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "12px" }}>
                  <div>
                    <span style={{ fontSize: "28px", fontWeight: "800", fontFamily: "var(--font-mono)", color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
                      {g.displayValue}
                    </span>
                    <span style={{ fontSize: "12.5px", color: "var(--text-muted)", marginLeft: "6px" }}>
                      today
                    </span>
                  </div>
                  <span style={{ fontSize: "12.5px", color: "var(--text-secondary)", fontWeight: "500" }}>
                    {g.pct}% of goal
                  </span>
                </div>

                {/* Glassmorphic Progress Bar */}
                <div
                  className="progress-track"
                  style={{
                    height: "12px",
                    background: "rgba(255, 255, 255, 0.06)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "999px",
                    marginBottom: "14px",
                    overflow: "hidden"
                  }}
                >
                  <div
                    className="progress-fill"
                    style={{
                      width: `${g.pct}%`,
                      background: g.bgGradient,
                      borderRadius: "999px",
                      boxShadow: `0 0 14px ${g.glowColor}`
                    }}
                  />
                </div>

                {/* Subtext Status & Consistency Stats */}
                <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.05)", borderRadius: "var(--radius-md)", padding: "10px 12px", marginBottom: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                    <span style={{ color: "var(--text-secondary)" }}>🔥 Completion Streak</span>
                    <span style={{ fontWeight: "700", color: g.streak > 0 ? "#fbbf24" : "var(--text-muted)" }}>
                      {g.streak > 0 ? `${g.streak} day streak` : "0 days"}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                    <span style={{ color: "var(--text-secondary)" }}>📅 7-Day Consistency</span>
                    <span style={{ fontWeight: "600", color: "var(--text-primary)" }}>{g.weeklyConsistency}</span>
                  </div>
                </div>

                <p style={{ fontSize: "12px", color: isDone ? "#34d399" : "var(--text-muted)", marginBottom: "16px" }}>
                  {isDone ? "🎉 Goal completed for today!" : g.remaining}
                </p>
              </div>

              {/* Quick Log Buttons */}
              {onQuickLog && (
                <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.06)", paddingTop: "14px" }}>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "8px", fontWeight: "600", letterSpacing: "0.02em" }}>
                    QUICK LOG:
                  </p>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {g.quickButtons.map((btn, bIdx) => (
                      <button
                        key={bIdx}
                        className="btn btn-secondary"
                        style={{ padding: "5px 10px", fontSize: "12px", borderRadius: "8px" }}
                        onClick={() => handleQuickAdd(g.id, btn.val, btn.unit, btn.label)}
                      >
                        + {btn.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
