import React from "react";

export default function Profile({ profile, records = [], goals = {}, onUpdateProfile }) {
  const [name, setName] = React.useState(profile?.name || "Shashank");
  const [age, setAge] = React.useState(profile?.age || 29);
  const [gender, setGender] = React.useState(profile?.gender || "Not specified");
  const [heightCm, setHeightCm] = React.useState(profile?.heightCm || 175);
  const [weightKg, setWeightKg] = React.useState(profile?.weightKg || 70);
  const [unitSystem, setUnitSystem] = React.useState(profile?.unitSystem || "metric");
  const [saving, setSaving] = React.useState(false);
  const [statusMsg, setStatusMsg] = React.useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setStatusMsg("");
    try {
      await onUpdateProfile({
        name,
        age: Number(age),
        gender,
        heightCm: Number(heightCm),
        weightKg: Number(weightKg),
        unitSystem
      });
      setStatusMsg("Profile updated successfully.");
      setTimeout(() => setStatusMsg(""), 3500);
    } catch (err) {
      setStatusMsg(`Update failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  // Calculate BMI
  const heightM = heightCm / 100;
  const bmi = heightM > 0 ? (weightKg / (heightM * heightM)).toFixed(1) : "--";

  // Data Statistics
  const totalRecordsCount = records.length;
  const daysTrackedSet = new Set(records.map((r) => r.recordedAt.slice(0, 10)));
  const daysTrackedCount = daysTrackedSet.size;
  const activeGoalsCount = 4; // steps, water, sleep, activity

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "26px", fontWeight: "700", marginBottom: "4px" }}>User Profile & Wellness Account</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
          Physical baseline metrics, application tracking volume, and data summaries
        </p>
      </div>

      {statusMsg && (
        <div style={{
          background: "rgba(16, 185, 129, 0.15)",
          border: "1px solid rgba(16, 185, 129, 0.3)",
          color: "#34d399",
          padding: "12px 16px",
          borderRadius: "12px",
          fontSize: "14px",
          marginBottom: "20px"
        }}>
          {statusMsg}
        </div>
      )}

      {/* Statistics Banner */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "26px" }}>
        <div className="glass-card" style={{ padding: "20px" }}>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px", textTransform: "uppercase", fontWeight: "700", letterSpacing: "0.05em" }}>
            Total Records Logged
          </p>
          <div style={{ fontSize: "28px", fontWeight: "800", fontFamily: "var(--font-mono)", color: "var(--accent-cyan)" }}>
            {totalRecordsCount}
          </div>
          <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>Biometric readings in session</p>
        </div>

        <div className="glass-card" style={{ padding: "20px" }}>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px", textTransform: "uppercase", fontWeight: "700", letterSpacing: "0.05em" }}>
            Active Daily Goals
          </p>
          <div style={{ fontSize: "28px", fontWeight: "800", fontFamily: "var(--font-mono)", color: "#10b981" }}>
            {activeGoalsCount}
          </div>
          <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>Steps, Water, Sleep, Activity</p>
        </div>

        <div className="glass-card" style={{ padding: "20px" }}>
          <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px", textTransform: "uppercase", fontWeight: "700", letterSpacing: "0.05em" }}>
            Days Tracked
          </p>
          <div style={{ fontSize: "28px", fontWeight: "800", fontFamily: "var(--font-mono)", color: "#8b5cf6" }}>
            {daysTrackedCount}
          </div>
          <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>Unique calendar days with logs</p>
        </div>
      </div>

      <div className="two-col-grid">
        {/* Main Profile Form */}
        <div className="glass-card" style={{ padding: "28px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "20px" }}>Personal Calibration</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className="form-group">
                <label className="form-label">Display Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={50}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Age (Years)</label>
                <input
                  type="number"
                  className="form-input"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  min="1"
                  max="125"
                  required
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className="form-group">
                <label className="form-label">Height (cm)</label>
                <input
                  type="number"
                  className="form-input"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  min="50"
                  max="260"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Weight (kg)</label>
                <input
                  type="number"
                  className="form-input"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  min="10"
                  max="400"
                  step="0.5"
                  required
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className="form-group">
                <label className="form-label">Unit System</label>
                <select className="form-select" value={unitSystem} onChange={(e) => setUnitSystem(e.target.value)}>
                  <option value="metric">Metric (kg, cm, °C, ml)</option>
                  <option value="imperial">Imperial (lbs, ft, °F, fl oz)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Biological Gender</label>
                <select className="form-select" value={gender} onChange={(e) => setGender(e.target.value)}>
                  <option value="Not specified">Prefer not to say</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "14px" }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Saving Changes..." : "Save Profile Settings"}
              </button>
            </div>
          </form>
        </div>

        {/* Profile Summary Card */}
        <div>
          <div className="glass-card" style={{ padding: "24px", marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
              <div style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #06b6d4, #3b82f6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "22px",
                fontWeight: "700",
                color: "#ffffff"
              }}>
                {name ? name.charAt(0).toUpperCase() : "U"}
              </div>
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: "700" }}>{name}</h3>
                <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>Health Monitor V2 Profile</p>
              </div>
            </div>

            <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "16px", display: "grid", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13.5px" }}>
                <span style={{ color: "var(--text-secondary)" }}>Age</span>
                <span style={{ fontWeight: "600" }}>{age} yrs</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13.5px" }}>
                <span style={{ color: "var(--text-secondary)" }}>Height & Weight</span>
                <span style={{ fontWeight: "600" }}>{heightCm} cm / {weightKg} kg</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13.5px" }}>
                <span style={{ color: "var(--text-secondary)" }}>Estimated BMI</span>
                <span style={{ fontWeight: "600", fontFamily: "var(--font-mono)", color: "var(--accent-cyan)" }}>{bmi}</span>
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: "20px", fontSize: "12px", color: "var(--text-muted)", lineHeight: "1.6" }}>
            <strong style={{ color: "var(--text-secondary)" }}>🔒 Private Session Protocol</strong>
            <p style={{ marginTop: "6px" }}>
              All health telemetry resides securely within your isolated applet container. No unencrypted transmission or cross-user sharing is enabled.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
