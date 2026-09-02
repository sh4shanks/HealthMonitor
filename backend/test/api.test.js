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
