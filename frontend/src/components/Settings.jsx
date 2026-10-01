import React, { useState } from "react";

export default function Settings({
  hasDemoData,
  onSeedDemo,
  onClearDemo,
  onClearAll,
  profile,
  records = [],
  onUpdateProfile,
  onImportRecords
}) {
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [importStatus, setImportStatus] = useState("");

  async function handleSeedDemo() {
    setStatusMsg("");
    try {
      await onSeedDemo();
      setStatusMsg("Demo dataset loaded successfully. All sample records are labeled with DEMO.");
      setTimeout(() => setStatusMsg(""), 3500);
    } catch (err) {
      setStatusMsg(`Demo generation failed: ${err.message}`);
    }
  }

  async function handleClearDemo() {
    setStatusMsg("");
    try {
      await onClearDemo();
      setStatusMsg("Demo sample data cleared. User data retained.");
      setTimeout(() => setStatusMsg(""), 3500);
    } catch (err) {
      setStatusMsg(`Failed to clear demo data: ${err.message}`);
    }
  }

  async function handleConfirmClearAll() {
    setClearing(true);
    try {
      await onClearAll();
      setShowClearConfirm(false);
      setStatusMsg("All health data records have been cleared.");
      setTimeout(() => setStatusMsg(""), 3500);
    } catch (err) {
      setStatusMsg(`Clear failed: ${err.message}`);
    } finally {
      setClearing(false);
    }
  }

  // Export data as JSON
  function handleExportJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(records, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `health_monitor_export_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setStatusMsg("Health data exported as JSON.");
  }

  // Export data as CSV
  function handleExportCSV() {
    if (records.length === 0) {
      setStatusMsg("No records available to export.");
      return;
    }
    const headers = ["id", "recordedAt", "metric", "value", "unit", "notes", "isDemo"];
    const rows = records.map((r) => {
      const valStr = typeof r.value === "object" ? `${r.value.systolic}/${r.value.diastolic}` : r.value;
      const cleanNotes = (r.notes || "").replace(/"/g, '""');
      return `"${r.id}","${r.recordedAt}","${r.metric}","${valStr}","${r.unit || ""}","${cleanNotes}","${r.isDemo || false}"`;
    });
    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent([headers.join(","), ...rows].join("\n"));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", csvContent);
    downloadAnchor.setAttribute("download", `health_monitor_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setStatusMsg("Health data exported as CSV.");
  }

  // Import JSON File
  function handleFileImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (!Array.isArray(parsed)) {
          setImportStatus("Invalid file structure: Expected a JSON array of health records.");
          return;
        }
        await onImportRecords(parsed, false);
        setImportStatus(`Successfully imported ${parsed.length} records into your session.`);
        setTimeout(() => setImportStatus(""), 4000);
      } catch (err) {
        setImportStatus(`Import failed: ${err.message}`);
      }
    };
    reader.readAsText(file);
  }

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "26px", fontWeight: "700", marginBottom: "4px" }}>Settings & Preferences</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
          Configure application interface, tracking bounds, data portability, and demonstration mode
        </p>
      </div>

      {statusMsg && (
        <div style={{
          background: "rgba(6, 182, 212, 0.15)",
          border: "1px solid rgba(6, 182, 212, 0.3)",
          color: "#22d3ee",
          padding: "12px 16px",
          borderRadius: "12px",
          fontSize: "14px",
          marginBottom: "20px"
        }}>
          {statusMsg}
        </div>
      )}

      {importStatus && (
        <div style={{
          background: "rgba(16, 185, 129, 0.15)",
          border: "1px solid rgba(16, 185, 129, 0.3)",
          color: "#34d399",
          padding: "12px 16px",
          borderRadius: "12px",
          fontSize: "14px",
          marginBottom: "20px"
        }}>
          {importStatus}
        </div>
      )}

      <div style={{ display: "grid", gap: "20px" }}>
        {/* Appearance & Interface */}
        <div className="glass-card" style={{ padding: "24px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px" }}>Interface Theme</h2>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ fontSize: "14px", fontWeight: "500", color: "var(--text-primary)" }}>Dark Glassmorphism Theme</p>
              <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>Optimized for high contrast and minimal eye fatigue</p>
            </div>
            <span className="badge badge-normal">Active (Default)</span>
          </div>
        </div>

        {/* Units System Configuration */}
        <div className="glass-card" style={{ padding: "24px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px" }}>Measurement System</h2>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <p style={{ fontSize: "14px", fontWeight: "500", color: "var(--text-primary)" }}>Units Preference</p>
              <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                Selected: {profile?.unitSystem === "imperial" ? "Imperial (lbs, °F, fl oz)" : "Metric (kg, °C, ml)"}
              </p>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                className={profile?.unitSystem !== "imperial" ? "btn btn-primary" : "btn btn-secondary"}
                style={{ padding: "6px 14px", fontSize: "12.5px" }}
                onClick={() => onUpdateProfile({ unitSystem: "metric" })}
              >
                Metric
              </button>
              <button
                className={profile?.unitSystem === "imperial" ? "btn btn-primary" : "btn btn-secondary"}
                style={{ padding: "6px 14px", fontSize: "12.5px" }}
                onClick={() => onUpdateProfile({ unitSystem: "imperial" })}
              >
                Imperial
              </button>
            </div>
          </div>
        </div>

        {/* Tracking Alerts Configuration */}
        <div className="glass-card" style={{ padding: "24px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px" }}>Tracking Alerts & Informational Banners</h2>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <div>
              <p style={{ fontSize: "14px", fontWeight: "500", color: "var(--text-primary)" }}>Biometric Range Guidance</p>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", maxWidth: "480px" }}>
                Identifies when recorded values are outside your configured baseline ranges. Never provides medical diagnoses or prescriptive advice.
              </p>
            </div>
            <input
              type="checkbox"
              style={{ width: "20px", height: "20px", accentColor: "var(--accent-cyan)", cursor: "pointer" }}
              checked={profile?.trackingAlertsEnabled !== false}
              onChange={(e) => onUpdateProfile({ trackingAlertsEnabled: e.target.checked })}
            />
          </div>
        </div>

        {/* Data Portability (Export & Import) */}
        <div className="glass-card" style={{ padding: "24px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px" }}>Data Portability & Backup</h2>
          <div style={{ display: "grid", gap: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <p style={{ fontSize: "14px", fontWeight: "500", color: "var(--text-primary)" }}>Export Health Records</p>
                <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  Download your stored biometric events in portable JSON or CSV format
                </p>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button className="btn btn-secondary" style={{ padding: "7px 14px", fontSize: "13px" }} onClick={handleExportJSON}>
                  Export JSON
                </button>
                <button className="btn btn-secondary" style={{ padding: "7px 14px", fontSize: "13px" }} onClick={handleExportCSV}>
                  Export CSV
                </button>
              </div>
            </div>

            <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "14px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <p style={{ fontSize: "14px", fontWeight: "500", color: "var(--text-primary)" }}>Import JSON Records</p>
                <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  Restore previously exported health records into your active session
                </p>
              </div>
              <label className="btn btn-secondary" style={{ padding: "7px 14px", fontSize: "13px", cursor: "pointer" }}>
                Select File
                <input type="file" accept=".json" onChange={handleFileImport} style={{ display: "none" }} />
              </label>
            </div>
          </div>
        </div>

        {/* Demo Mode / Sample Data */}
        <div className="glass-card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <h2 style={{ fontSize: "16px", fontWeight: "600" }}>Demonstration Mode</h2>
                <span className="badge badge-demo">Sample Data</span>
              </div>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", maxWidth: "520px" }}>
                Generate longitudinal sample readings across Heart Rate, Blood Pressure, SpO₂, Sleep, Steps, and Active Minutes clearly tagged as <strong>DEMO DATA</strong>.
              </p>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button className="btn btn-primary" onClick={handleSeedDemo}>
                Enter Demo Mode
              </button>
              {hasDemoData && (
                <button className="btn btn-secondary" onClick={handleClearDemo} style={{ color: "#fb7185" }}>
                  Exit Demo Mode
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Data Management & Clear Data */}
        <div className="glass-card" style={{ padding: "24px", borderColor: "rgba(244, 63, 94, 0.2)" }}>
          <h2 style={{ fontSize: "16px", fontWeight: "600", color: "#fb7185", marginBottom: "12px" }}>Danger Zone</h2>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px" }}>
            <div>
              <p style={{ fontSize: "14px", fontWeight: "500", color: "var(--text-primary)" }}>Clear All Health Data</p>
              <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                Permanently deletes all biometric records and daily check-ins from the current in-memory session.
              </p>
            </div>
            <button className="btn btn-danger" onClick={() => setShowClearConfirm(true)}>
              Clear All Health Data
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showClearConfirm && (
        <div className="modal-overlay" onClick={() => setShowClearConfirm(false)} role="dialog" aria-modal="true">
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "440px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#fb7185", marginBottom: "10px" }}>
              ⚠️ Confirm Reset All Health Data
            </h2>
            <p style={{ fontSize: "13.5px", color: "var(--text-secondary)", lineHeight: "1.5", marginBottom: "20px" }}>
              Are you sure you want to clear all health tracking readings? This action cannot be undone.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button className="btn btn-secondary" onClick={() => setShowClearConfirm(false)} disabled={clearing}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleConfirmClearAll} disabled={clearing}>
                {clearing ? "Clearing..." : "Yes, Delete Everything"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
