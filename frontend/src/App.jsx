import React, { useCallback, useEffect, useState } from "react";
import * as Sentry from "@sentry/react";
import { healthApi } from "./api/health.js";
import AddHealthDataModal from "./components/AddHealthDataModal.jsx";
import Analytics from "./components/Analytics.jsx";
import CalendarView from "./components/CalendarView.jsx";
import Dashboard from "./components/Dashboard.jsx";
import Goals from "./components/Goals.jsx";
import Navigation from "./components/Navigation.jsx";
import OnboardingModal from "./components/OnboardingModal.jsx";
import Profile from "./components/Profile.jsx";
import QuickAddFab from "./components/QuickAddFab.jsx";
import Settings from "./components/Settings.jsx";
import Timeline from "./components/Timeline.jsx";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [records, setRecords] = useState([]);
  const [goals, setGoals] = useState({ steps: 10000, waterMl: 2500, sleepMinutes: 480, activeMinutes: 45 });
  const [profile, setProfile] = useState({ name: "Shashank", age: 29, unitSystem: "metric", trackingAlertsEnabled: true, onboardingCompleted: true });
  const [ranges, setRanges] = useState({});
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [defaultMetricForModal, setDefaultMetricForModal] = useState("heart_rate");

  // Load all initial health data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [recs, g, p, rng] = await Promise.all([
        healthApi.getRecords(),
        healthApi.getGoals(),
        healthApi.getProfile(),
        healthApi.getRanges()
      ]);
      setRecords(recs);
      setGoals(g);
      setProfile(p);
      setRanges(rng);

      // Trigger onboarding if not completed and no records
      if (p && p.onboardingCompleted === false && recs.length === 0) {
        setShowOnboarding(true);
      }
    } catch (error) {
      Sentry.captureException(error);
      setStatusMessage(`Error loading health data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Record CRUD Handlers
  async function handleSaveRecord(recordData) {
    try {
      if (recordData.id) {
        await healthApi.updateRecord(recordData.id, recordData);
        setStatusMessage("Record updated successfully.");
      } else {
        await healthApi.createRecord(recordData);
        setStatusMessage("New health reading recorded.");
      }
      await loadData();
      setTimeout(() => setStatusMessage(""), 3500);
    } catch (error) {
      Sentry.captureException(error);
      throw error;
    }
  }

  async function handleDeleteRecord(id) {
    if (!window.confirm("Delete this biometric reading?")) return;
    try {
      await healthApi.deleteRecord(id);
      setRecords((prev) => prev.filter((r) => r.id !== id));
      setStatusMessage("Reading deleted.");
      setTimeout(() => setStatusMessage(""), 3000);
    } catch (error) {
      Sentry.captureException(error);
      setStatusMessage(`Delete failed: ${error.message}`);
    }
  }

  // Demo & Clear Handlers
  async function handleSeedDemo() {
    try {
      await healthApi.seedDemo();
      await loadData();
    } catch (error) {
      Sentry.captureException(error);
      throw error;
    }
  }

  async function handleClearDemo() {
    try {
      await healthApi.clearRecords(true);
      await loadData();
    } catch (error) {
      Sentry.captureException(error);
      throw error;
    }
  }

  async function handleClearAll() {
    try {
      await healthApi.clearRecords(false);
      await loadData();
    } catch (error) {
      Sentry.captureException(error);
      throw error;
    }
  }

  async function handleImportRecords(importedList, overwrite = false) {
    try {
      await healthApi.importRecords(importedList, overwrite);
      await loadData();
      setStatusMessage(`Imported ${importedList.length} records successfully.`);
      setTimeout(() => setStatusMessage(""), 3500);
    } catch (error) {
      Sentry.captureException(error);
      throw error;
    }
  }

  async function handleUpdateGoals(updatedGoals) {
    try {
      const saved = await healthApi.updateGoals(updatedGoals);
      setGoals(saved);
      setStatusMessage("Goals updated.");
      setTimeout(() => setStatusMessage(""), 3000);
    } catch (error) {
      Sentry.captureException(error);
      throw error;
    }
  }

  async function handleUpdateProfile(updatedProfile) {
    try {
      const saved = await healthApi.updateProfile(updatedProfile);
      setProfile(saved);
      setStatusMessage("Profile preferences saved.");
      setTimeout(() => setStatusMessage(""), 3000);
    } catch (error) {
      Sentry.captureException(error);
      throw error;
    }
  }

  function handleCompleteOnboarding(data) {
    setShowOnboarding(false);
    handleUpdateProfile({
      name: data.name,
      unitSystem: data.unitSystem,
      onboardingCompleted: true
    });
    if (data.goals) {
      handleUpdateGoals(data.goals);
    }
  }

  function openAddModal(recordToEdit = null, metricKey = "heart_rate") {
    setEditingRecord(recordToEdit);
    setDefaultMetricForModal(metricKey || "heart_rate");
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingRecord(null);
  }

  // Count active alerts
  const hasDemoData = records.some((r) => r.isDemo);
  let alertsCount = 0;
  if (profile?.trackingAlertsEnabled !== false) {
    const latestHR = records.find((r) => r.metric === "heart_rate");
    const latestSpO2 = records.find((r) => r.metric === "spo2");
    const latestBP = records.find((r) => r.metric === "blood_pressure");

    if (latestHR && (latestHR.value < 55 || latestHR.value > 105)) alertsCount++;
    if (latestSpO2 && latestSpO2.value < 94) alertsCount++;
    if (latestBP && (latestBP.value.systolic > 135 || latestBP.value.diastolic > 88)) alertsCount++;
  }

  return (
    <div className="app-container">
      {/* Navigation (Sidebar on Desktop, Bottom bar on Mobile) */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        alertsCount={alertsCount}
        hasDemoData={hasDemoData}
      />

      {/* Main Content Area */}
      <main className="main-content">
        <div className="content-body">
          {statusMessage && (
            <div
              style={{
                background: "rgba(6, 182, 212, 0.15)",
                border: "1px solid rgba(6, 182, 212, 0.3)",
                color: "#22d3ee",
                padding: "10px 16px",
                borderRadius: "var(--radius-md)",
                fontSize: "13.5px",
                marginBottom: "20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <span>{statusMessage}</span>
              <button
                onClick={() => setStatusMessage("")}
                style={{ color: "#22d3ee", fontWeight: "700", fontSize: "16px", padding: "0 6px" }}
              >
                &times;
              </button>
            </div>
          )}

          {loading ? (
            <div style={{ padding: "80px 20px", textAlign: "center", color: "var(--text-muted)" }}>
              <div style={{ fontSize: "32px", marginBottom: "12px", animation: "spin 1.5s linear infinite" }}>⏳</div>
              <p style={{ fontSize: "14px", fontWeight: "500" }}>Loading Health Monitor V2...</p>
            </div>
          ) : (
            <>
              {activeTab === "dashboard" && (
                <Dashboard
                  records={records}
                  goals={goals}
                  profile={profile}
                  ranges={ranges}
                  onOpenAddModal={(rec) => openAddModal(rec, "heart_rate")}
                  onNavigateTab={setActiveTab}
                />
              )}

              {activeTab === "timeline" && (
                <Timeline
                  records={records}
                  onEdit={(record) => openAddModal(record, record.metric)}
                  onDelete={handleDeleteRecord}
                  onAddNew={() => openAddModal(null, "heart_rate")}
                  unitSystem={profile?.unitSystem}
                />
              )}

              {activeTab === "calendar" && (
                <CalendarView
                  records={records}
                  goals={goals}
                  onOpenAddModal={(rec) => openAddModal(rec, "heart_rate")}
                  unitSystem={profile?.unitSystem}
                />
              )}

              {activeTab === "analytics" && (
                <Analytics records={records} unitSystem={profile?.unitSystem} />
              )}

              {activeTab === "goals" && (
                <Goals
                  goals={goals}
                  records={records}
                  onUpdateGoals={handleUpdateGoals}
                  onQuickLog={handleSaveRecord}
                  unitSystem={profile?.unitSystem}
                />
              )}

              {activeTab === "profile" && (
                <Profile
                  profile={profile}
                  records={records}
                  goals={goals}
                  onUpdateProfile={handleUpdateProfile}
                />
              )}

              {activeTab === "settings" && (
                <Settings
                  hasDemoData={hasDemoData}
                  onSeedDemo={handleSeedDemo}
                  onClearDemo={handleClearDemo}
                  onClearAll={handleClearAll}
                  profile={profile}
                  records={records}
                  onUpdateProfile={handleUpdateProfile}
                  onImportRecords={handleImportRecords}
                />
              )}
            </>
          )}
        </div>
      </main>

      {/* Floating Quick Add System (FAB) */}
      <QuickAddFab onSelectMetric={(metric) => openAddModal(null, metric)} />

      {/* Add / Edit Health Data Modal */}
      <AddHealthDataModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleSaveRecord}
        editingRecord={editingRecord}
        defaultMetric={defaultMetricForModal}
      />

      {/* Onboarding Dialog */}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={handleCompleteOnboarding}
      />
    </div>
  );
}
