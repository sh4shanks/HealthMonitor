import test from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../src/app.js";

const server = createApp().listen(0);
const base = `http://127.0.0.1:${server.address().port}`;

test.after(() => server.close());

async function request(path, options) {
  return fetch(`${base}${path}`, {
    ...options,
    headers: { "content-type": "application/json", ...(options?.headers || {}) }
  });
}

test("health endpoint reports ok", async () => {
  const res = await request("/api/health");
  assert.equal(res.status, 200);
  assert.equal((await res.json()).status, "ok");
});

test("creates and validates an item", async () => {
  const bad = await request("/api/items", { method: "POST", body: JSON.stringify({ title: "   " }) });
  assert.equal(bad.status, 400);

  const created = await request("/api/items", {
    method: "POST",
    body: JSON.stringify({ title: "Test", content: "Hello" })
  });
  assert.equal(created.status, 201);
  const item = await created.json();
  assert.equal(item.title, "Test");

  const updated = await request(`/api/items/${item.id}`, {
    method: "PUT",
    body: JSON.stringify({ content: "Updated" })
  });
  assert.equal(updated.status, 200);
  assert.equal((await updated.json()).content, "Updated");

  const deleted = await request(`/api/items/${item.id}`, { method: "DELETE" });
  assert.equal(deleted.status, 204);
});

test("returns 404 for an unknown item", async () => {
  const res = await request("/api/items/not-real");
  assert.equal(res.status, 404);
});

test("health-records API creates, validates, lists and deletes health records", async () => {
  // Test invalid metric
  const invalid = await request("/api/health-records/records", {
    method: "POST",
    body: JSON.stringify({ metric: "invalid_type", value: 120 })
  });
  assert.equal(invalid.status, 400);

  // Test valid heart rate record
  const created = await request("/api/health-records/records", {
    method: "POST",
    body: JSON.stringify({
      metric: "heart_rate",
      value: 72,
      unit: "bpm",
      notes: "Morning resting check"
    })
  });
  assert.equal(created.status, 201);
  const record = await created.json();
  assert.equal(record.metric, "heart_rate");
  assert.equal(record.value, 72);

  // Test list
  const list = await request("/api/health-records/records");
  assert.equal(list.status, 200);
  const items = await list.json();
  assert.ok(Array.isArray(items));
  assert.ok(items.some((r) => r.id === record.id));

  // Test goals
  const goalsRes = await request("/api/health-records/goals");
  assert.equal(goalsRes.status, 200);
  const goals = await goalsRes.json();
  assert.equal(typeof goals.steps, "number");

  // Test activity metric
  const actRes = await request("/api/health-records/records", {
    method: "POST",
    body: JSON.stringify({
      metric: "activity",
      value: 45,
      unit: "minutes",
      notes: "Cardio workout"
    })
  });
  assert.equal(actRes.status, 201);
  const actRecord = await actRes.json();
  assert.equal(actRecord.metric, "activity");
  assert.equal(actRecord.value, 45);

  // Test import endpoint
  const importRes = await request("/api/health-records/records/import", {
    method: "POST",
    body: JSON.stringify({
      records: [
        {
          id: "imported-test-1",
          metric: "steps",
          value: 6500,
          unit: "steps",
          recordedAt: new Date().toISOString()
        }
      ],
      overwrite: false
    })
  });
  assert.equal(importRes.status, 200);

  // Clean up
  const del = await request(`/api/health-records/records/${record.id}`, { method: "DELETE" });
  assert.equal(del.status, 204);
  const delAct = await request(`/api/health-records/records/${actRecord.id}`, { method: "DELETE" });
  assert.equal(delAct.status, 204);
});
