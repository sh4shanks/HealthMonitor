let rawApi = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");
if (rawApi === "http://localhost:5000" || rawApi === "http://127.0.0.1:5000") {
  rawApi = "";
}
const API = rawApi;

async function request(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers
    }
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const payload = await response.json();
      message = payload.error || message;
    } catch {}
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) return null;
  return response.json();
}

export const healthApi = {
  // Records
  getRecords: () => request("/api/health-records/records"),
  getRecord: (id) => request(`/api/health-records/records/${id}`),
  createRecord: (data) => request("/api/health-records/records", { method: "POST", body: JSON.stringify(data) }),
  updateRecord: (id, data) => request(`/api/health-records/records/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteRecord: (id) => request(`/api/health-records/records/${id}`, { method: "DELETE" }),
  clearRecords: (demoOnly = false) => request("/api/health-records/records/clear", { method: "POST", body: JSON.stringify({ demoOnly }) }),
  seedDemo: () => request("/api/health-records/records/seed-demo", { method: "POST" }),
  importRecords: (records, overwrite = false) => request("/api/health-records/records/import", { method: "POST", body: JSON.stringify({ records, overwrite }) }),

  // Goals
  getGoals: () => request("/api/health-records/goals"),
  updateGoals: (goals) => request("/api/health-records/goals", { method: "PUT", body: JSON.stringify(goals) }),

  // Profile
  getProfile: () => request("/api/health-records/profile"),
  updateProfile: (profile) => request("/api/health-records/profile", { method: "PUT", body: JSON.stringify(profile) }),

  // Ranges
  getRanges: () => request("/api/health-records/ranges")
};
