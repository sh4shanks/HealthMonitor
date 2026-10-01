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

export const itemsApi = {
  list: () => request("/api/items"),
  create: (data) => request("/api/items", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => request(`/api/items/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  remove: (id) => request(`/api/items/${id}`, { method: "DELETE" }),
  diagnostic: (type) => request(`/api/errors/${type}`, { method: "POST" })
};
