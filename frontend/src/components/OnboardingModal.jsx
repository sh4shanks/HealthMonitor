import React, { useState } from "react";

export default function OnboardingModal({ isOpen, onClose, onComplete }) {
  if (!isOpen) return null;

  const [step, setStep] = useState(1);
  const [name, setName] = useState("Shashank");
  const [unitSystem, setUnitSystem] = useState("metric");
  const [stepGoal, setStepGoal] = useState("10000");
  const [waterGoal, setWaterGoal] = useState("2500");
  const [sleepGoal, setSleepGoal] = useState("8");
  const [activeGoal, setActiveGoal] = useState("45");

  function handleFinish() {
    onComplete({
      name: name.trim() || "User",
      unitSystem,
      goals: {
        steps: parseInt(stepGoal, 10) || 10000,
        waterMl: parseInt(waterGoal, 10) || 2500,
        sleepMinutes: Math.round((parseFloat(sleepGoal) || 8) * 60),
        activeMinutes: parseInt(activeGoal, 10) || 45
      }
    });
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-content" style={{ maxWidth: "480px" }}>
        {step === 1 ? (
          <div>
            <div style={{ textAlign: "center", padding: "16px 0 24px" }}>
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "16px",
                  background: "linear-gradient(135deg, #06b6d4, #3b82f6)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "30px",
                  marginBottom: "16px",
                  boxShadow: "0 0 24px rgba(6, 182, 212, 0.4)"
                }}
              >
                🩺
              </div>
              <h2 style={{ fontSize: "22px", fontWeight: "800", letterSpacing: "-0.02em", color: "#ffffff", marginBottom: "8px" }}>
                WELCOME TO HEALTH MONITOR
              </h2>
              <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: "1.5", maxWidth: "360px", margin: "0 auto" }}>
                Track your personal wellness. Understand your trends. Build balanced, consistent daily habits.
              </p>
            </div>

            <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "16px", marginBottom: "24px" }}>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: "1.5" }}>
                🔒 <strong>Privacy Assurance:</strong> Non-diagnostic lifestyle tracking only. Your records remain private and stored in your session.
              </p>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Skip Setup
              </button>
              <button type="button" className="btn btn-primary" onClick={() => setStep(2)}>
                Get Started &rarr;
              </button>
            </div>
          </div>
        ) : (
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "4px" }}>
              Quick Target Calibration
            </h2>
            <p style={{ fontSize: "12.5px", color: "var(--text-muted)", marginBottom: "20px" }}>
              Customize your baseline targets. You can modify these anytime in Settings.
            </p>

            <div className="form-group">
              <label className="form-label">Display Name</label>
              <input
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Shashank"
                maxLength={40}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Preferred Unit System</label>
              <select className="form-select" value={unitSystem} onChange={(e) => setUnitSystem(e.target.value)}>
                <option value="metric">Metric (kg, cm, °C, ml)</option>
                <option value="imperial">Imperial (lbs, ft, °F, fl oz)</option>
              </select>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div className="form-group">
                <label className="form-label">Daily Steps</label>
                <input
                  type="number"
                  className="form-input"
                  value={stepGoal}
                  onChange={(e) => setStepGoal(e.target.value)}
                  step="500"
                  min="1000"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Water Target (ml)</label>
                <input
                  type="number"
                  className="form-input"
                  value={waterGoal}
                  onChange={(e) => setWaterGoal(e.target.value)}
                  step="100"
                  min="500"
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "20px" }}>
              <div className="form-group">
                <label className="form-label">Sleep Target (Hours)</label>
                <input
                  type="number"
                  className="form-input"
                  value={sleepGoal}
                  onChange={(e) => setSleepGoal(e.target.value)}
                  step="0.5"
                  min="4"
                  max="14"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Active Minutes</label>
                <input
                  type="number"
                  className="form-input"
                  value={activeGoal}
                  onChange={(e) => setActiveGoal(e.target.value)}
                  step="5"
                  min="10"
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
              <button type="button" className="btn btn-secondary" onClick={() => setStep(1)}>
                &larr; Back
              </button>
              <button type="button" className="btn btn-primary" onClick={handleFinish}>
                Complete Setup & Enter Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
