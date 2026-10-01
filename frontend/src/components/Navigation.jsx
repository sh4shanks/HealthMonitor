import React from "react";

export default function Navigation({ activeTab, onSelectTab, alertsCount = 0, hasDemoData = false }) {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "timeline", label: "Timeline", icon: "🕒" },
    { id: "calendar", label: "Calendar", icon: "📅" },
    { id: "analytics", label: "Analytics", icon: "📈" },
    { id: "goals", label: "Goals & Streaks", icon: "🎯" },
    { id: "profile", label: "Profile", icon: "👤" },
    { id: "settings", label: "Settings", icon: "⚙️" }
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        style={{
          width: "var(--sidebar-width)",
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          background: "rgba(10, 16, 28, 0.95)",
          backdropFilter: "blur(20px)",
          borderRight: "1px solid var(--border-subtle)",
          padding: "24px 16px",
          display: "none",
          flexDirection: "column",
          zIndex: 50
        }}
        className="desktop-sidebar"
      >
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "0 8px 24px", borderBottom: "1px solid var(--border-subtle)" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #06b6d4, #3b82f6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 16px rgba(6, 182, 212, 0.35)",
              color: "#fff",
              fontSize: "18px"
            }}
          >
            🩺
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <h2 style={{ fontSize: "15px", fontWeight: "800", letterSpacing: "0.02em", color: "var(--text-primary)" }}>
                HEALTH MONITOR
              </h2>
              <span style={{ fontSize: "10px", background: "rgba(6,182,212,0.2)", color: "var(--accent-cyan)", padding: "1px 5px", borderRadius: "4px", fontWeight: "700" }}>
                V2
              </span>
            </div>
            <p style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "500" }}>Personal Wellness & Vitals</p>
          </div>
        </div>

        {/* Demo Mode Badge if active */}
        {hasDemoData && (
          <div style={{ marginTop: "12px", padding: "6px 10px", background: "rgba(139, 92, 246, 0.15)", border: "1px solid rgba(139, 92, 246, 0.3)", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "11px", fontWeight: "700", color: "#c084fc" }}>DEMO DATA ACTIVE</span>
            <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>Sample</span>
          </div>
        )}

        {/* Navigation Links */}
        <nav style={{ display: "flex", flexDirection: "column", gap: "5px", marginTop: "16px", flex: 1 }}>
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  borderRadius: "var(--radius-md)",
                  fontSize: "13.5px",
                  fontWeight: isActive ? "600" : "500",
                  color: isActive ? "#ffffff" : "var(--text-secondary)",
                  background: isActive ? "rgba(6, 182, 212, 0.12)" : "transparent",
                  border: isActive ? "1px solid rgba(6, 182, 212, 0.25)" : "1px solid transparent",
                  transition: "all 0.18s ease",
                  textAlign: "left"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "16px" }}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.id === "dashboard" && alertsCount > 0 && (
                  <span
                    style={{
                      background: "rgba(245, 158, 11, 0.2)",
                      color: "#fbbf24",
                      fontSize: "11px",
                      fontWeight: "700",
                      padding: "2px 7px",
                      borderRadius: "10px"
                    }}
                  >
                    {alertsCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Safety Notice in Sidebar */}
        <div style={{ padding: "12px", background: "rgba(255, 255, 255, 0.02)", borderRadius: "var(--radius-md)", border: "1px solid rgba(255, 255, 255, 0.05)" }}>
          <p style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: "1.45" }}>
            🔒 <strong>Lifestyle Tracking:</strong> Informational metrics only. Never intended as medical diagnosis.
          </p>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header
        className="mobile-top-header"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 18px",
          background: "rgba(10, 16, 28, 0.9)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid var(--border-subtle)",
          position: "sticky",
          top: 0,
          zIndex: 40
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "18px" }}>🩺</span>
          <span style={{ fontSize: "14px", fontWeight: "700", letterSpacing: "0.02em" }}>HEALTH MONITOR V2</span>
          {hasDemoData && <span className="badge badge-demo" style={{ fontSize: "9px" }}>DEMO</span>}
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {alertsCount > 0 && (
            <button
              onClick={() => onSelectTab("dashboard")}
              style={{
                background: "rgba(245, 158, 11, 0.15)",
                color: "#fbbf24",
                padding: "4px 8px",
                borderRadius: "var(--radius-full)",
                fontSize: "11px",
                fontWeight: "600"
              }}
            >
              ⚠️ {alertsCount}
            </button>
          )}
          <button className="btn-icon" onClick={() => onSelectTab("profile")} aria-label="User Profile">
            👤
          </button>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav
        className="mobile-bottom-nav"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "rgba(10, 16, 28, 0.95)",
          backdropFilter: "blur(20px)",
          borderTop: "1px solid var(--border-subtle)",
          display: "flex",
          justifyContent: "space-around",
          padding: "8px 4px max(8px, env(safe-area-inset-bottom))",
          zIndex: 50
        }}
      >
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "2px",
                padding: "4px 8px",
                borderRadius: "var(--radius-md)",
                fontSize: "10px",
                fontWeight: isActive ? "700" : "500",
                color: isActive ? "var(--accent-cyan)" : "var(--text-muted)",
                background: "transparent",
                minWidth: "46px"
              }}
            >
              <span style={{ fontSize: "16px" }}>{item.icon}</span>
              <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {item.id === "goals" ? "Goals" : item.label}
              </span>
            </button>
          );
        })}
      </nav>

      <style>{`
        @media (min-width: 1024px) {
          .desktop-sidebar { display: flex !important; }
          .mobile-top-header { display: none !important; }
          .mobile-bottom-nav { display: none !important; }
        }
      `}</style>
    </>
  );
}
