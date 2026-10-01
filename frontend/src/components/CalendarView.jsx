import React, { useState } from "react";
import { formatTemperature, formatWater, formatSleep } from "../utils/units.js";

export default function CalendarView({ records = [], goals = {}, onOpenAddModal, unitSystem = "metric" }) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selectedDayStr, setSelectedDayStr] = useState(() => new Date().toISOString().slice(0, 10));

  function prevMonth() {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  }

  function nextMonth() {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  }

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  // Map dates to recordings count
  const dayRecordsMap = {};
  records.forEach((r) => {
    const dStr = r.recordedAt.slice(0, 10);
    if (!dayRecordsMap[dStr]) dayRecordsMap[dStr] = [];
    dayRecordsMap[dStr].push(r);
  });

  const calendarDays = [];
  // Leading empty days
  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push(null);
  }
  // Days of month
  for (let d = 1; d <= totalDays; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    calendarDays.push({ dayNumber: d, dateStr, dayRecs: dayRecordsMap[dateStr] || [] });
  }

  const selectedRecords = dayRecordsMap[selectedDayStr] || [];

  const monthLabel = currentMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  // Calculate Streak & Consistency
  const uniqueTrackedDays = Object.keys(dayRecordsMap).sort().reverse();
  let currentStreak = 0;
  const todayStr = new Date().toISOString().slice(0, 10);
  const now = new Date();

  // Check if today has records
  let cursorDate = (dayRecordsMap[todayStr]?.length > 0) ? 0 : 1;
  while (cursorDate < 60) {
    const dStr = new Date(now.getTime() - cursorDate * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    if (dayRecordsMap[dStr] && dayRecordsMap[dStr].length > 0) {
      currentStreak++;
      cursorDate++;
    } else {
      break;
    }
  }

  // Days tracked this month
  const daysTrackedThisMonth = calendarDays.filter((item) => item && item.dayRecs.length > 0).length;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "26px", fontWeight: "800", letterSpacing: "-0.02em", marginBottom: "4px" }}>
            Health Calendar & Activity
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
            Inspect daily recording consistency, historical coverage, and inspect chronological readings by date
          </p>
        </div>

        {/* Consistency Stat Pills (Zero-Pill: Clean unboxed stats) */}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <div className="glass-card" style={{ padding: "8px 16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "18px" }}>🔥</span>
            <div>
              <span style={{ fontSize: "10px", color: "var(--text-muted)", display: "block", textTransform: "uppercase", fontWeight: "700" }}>
                Current Streak
              </span>
              <span style={{ fontSize: "14px", fontWeight: "700", fontFamily: "var(--font-mono)", color: "#f59e0b" }}>
                {currentStreak} Day{currentStreak !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          <div className="glass-card" style={{ padding: "8px 16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "18px" }}>📅</span>
            <div>
              <span style={{ fontSize: "10px", color: "var(--text-muted)", display: "block", textTransform: "uppercase", fontWeight: "700" }}>
                Active This Month
              </span>
              <span style={{ fontSize: "14px", fontWeight: "700", fontFamily: "var(--font-mono)", color: "var(--accent-cyan)" }}>
                {daysTrackedThisMonth} / {totalDays} Days
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="two-col-grid">
        {/* Calendar Grid Card */}
        <div className="glass-card" style={{ padding: "26px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2 style={{ fontSize: "17px", fontWeight: "700" }}>{monthLabel}</h2>
            <div style={{ display: "flex", gap: "8px" }}>
              <button className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: "13px" }} onClick={prevMonth}>
                &larr; Prev
              </button>
              <button className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: "13px" }} onClick={nextMonth}>
                Next &rarr;
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "6px", textAlign: "center", fontSize: "12px", color: "var(--text-muted)", fontWeight: "600", marginBottom: "8px" }}>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} style={{ padding: "6px 0" }}>{day}</div>
            ))}
          </div>

          {/* Days Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "6px" }}>
            {calendarDays.map((item, idx) => {
              if (!item) {
                return <div key={`empty-${idx}`} style={{ minHeight: "52px" }} />;
              }

              const isSelected = item.dateStr === selectedDayStr;
              const hasRecords = item.dayRecs.length > 0;
              const isToday = item.dateStr === todayStr;

              return (
                <button
                  key={item.dateStr}
                  onClick={() => setSelectedDayStr(item.dateStr)}
                  style={{
                    minHeight: "52px",
                    borderRadius: "10px",
                    background: isSelected
                      ? "rgba(6, 182, 212, 0.2)"
                      : hasRecords
                      ? "rgba(255, 255, 255, 0.04)"
                      : "rgba(255, 255, 255, 0.01)",
                    border: `1px solid ${
                      isSelected
                        ? "var(--accent-cyan)"
                        : isToday
                        ? "rgba(255, 255, 255, 0.3)"
                        : "var(--border-subtle)"
                    }`,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "6px 4px",
                    color: isSelected ? "#ffffff" : hasRecords ? "var(--text-primary)" : "var(--text-muted)",
                    position: "relative",
                    transition: "all 0.15s ease"
                  }}
                >
                  <span style={{ fontSize: "13px", fontWeight: isToday || isSelected ? "700" : "500", fontFamily: "var(--font-mono)" }}>
                    {item.dayNumber}
                  </span>

                  {/* Indicator dots for activity density */}
                  <div style={{ display: "flex", gap: "3px", minHeight: "6px" }}>
                    {hasRecords && (
                      <span
                        style={{
                          width: "5px",
                          height: "5px",
                          borderRadius: "50%",
                          background: item.dayRecs.length >= 3 ? "#10b981" : "#06b6d4",
                          boxShadow: item.dayRecs.length >= 3 ? "0 0 6px rgba(16, 185, 129, 0.6)" : "0 0 6px rgba(6, 182, 212, 0.6)"
                        }}
                      />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "18px", fontSize: "11.5px", color: "var(--text-muted)" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#06b6d4" }} /> Logged Events
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981" }} /> Comprehensive Log (&ge;3 metrics)
            </span>
          </div>
        </div>

        {/* Selected Day Details Card */}
        <div className="glass-card" style={{ padding: "26px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: "700" }}>
                  {new Date(selectedDayStr + "T00:00:00").toLocaleDateString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                  })}
                </h3>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                  {selectedRecords.length} recorded reading{selectedRecords.length !== 1 ? "s" : ""}
                </p>
              </div>
              {selectedDayStr === todayStr && (
                <span style={{ fontSize: "11px", color: "var(--accent-cyan)", fontWeight: "600" }}>
                  Today
                </span>
              )}
            </div>

            {selectedRecords.length === 0 ? (
              <div style={{ padding: "40px 12px", textAlign: "center", color: "var(--text-muted)" }}>
                <span style={{ fontSize: "36px", display: "block", marginBottom: "8px" }}>📅</span>
                <p style={{ fontSize: "13.5px", color: "var(--text-secondary)", fontWeight: "500", marginBottom: "6px" }}>
                  No measurements logged on this date
                </p>
                <p style={{ fontSize: "12px", maxWidth: "300px", margin: "0 auto 16px" }}>
                  Add a historical reading or retrospective habit check-in for this day.
                </p>
                {onOpenAddModal && (
                  <button
                    className="btn btn-secondary"
                    style={{ fontSize: "12px", padding: "6px 14px" }}
                    onClick={() => onOpenAddModal(null)}
                  >
                    + Log Entry for This Day
                  </button>
                )}
              </div>
            ) : (
              <div style={{ display: "grid", gap: "10px", maxHeight: "360px", overflowY: "auto" }}>
                {selectedRecords.map((r) => {
                  const time = new Date(r.recordedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                  const isBP = r.metric === "blood_pressure";
                  const valStr = isBP
                    ? `${r.value.systolic}/${r.value.diastolic} mmHg`
                    : r.metric === "sleep"
                    ? formatSleep(r.value).display
                    : r.metric === "water"
                    ? `${formatWater(r.value, unitSystem).value} ${formatWater(r.value, unitSystem).unit}`
                    : r.metric === "temperature"
                    ? `${formatTemperature(r.value, unitSystem).value} ${formatTemperature(r.value, unitSystem).unit}`
                    : `${r.value.toLocaleString()} ${r.unit}`;

                  return (
                    <div
                      key={r.id}
                      style={{
                        padding: "12px 14px",
                        background: "rgba(255, 255, 255, 0.02)",
                        border: "1px solid rgba(255, 255, 255, 0.05)",
                        borderRadius: "var(--radius-md)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}
                    >
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)" }}>
                          {r.metric.replace("_", " ").toUpperCase()}
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                          {time} {r.notes && `· ${r.notes}`}
                        </div>
                      </div>
                      <span style={{ fontFamily: "var(--font-mono)", fontWeight: "700", fontSize: "13.5px", color: "var(--accent-cyan)", fontVariantNumeric: "tabular-nums" }}>
                        {valStr}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {selectedRecords.length > 0 && onOpenAddModal && (
            <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.06)", paddingTop: "12px", marginTop: "14px", display: "flex", justifyContent: "flex-end" }}>
              <button
                className="btn btn-secondary"
                style={{ fontSize: "12px", padding: "6px 12px" }}
                onClick={() => onOpenAddModal(null)}
              >
                + Add Another Reading
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
