import crypto from "node:crypto";

const now = () => new Date().toISOString();

let items = [
  {
    id: crypto.randomUUID(),
    title: "Welcome",
    content: "This is your first note.",
    createdAt: now(),
    updatedAt: now()
  }
];

export function listItems() {
  return [...items];
}

export function getItem(id) {
  return items.find((item) => item.id === id) ?? null;
}

export function createItem({ title, content }) {
  const timestamp = now();
  const item = {
    id: crypto.randomUUID(),
    title,
    content,
    createdAt: timestamp,
    updatedAt: timestamp
  };
  items = [item, ...items];
  return item;
}

export function updateItem(id, changes) {
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) return null;

  const updated = {
    ...items[index],
    ...changes,
    updatedAt: now()
  };
  items = items.with(index, updated);
  return updated;
}

export function deleteItem(id) {
  const existing = getItem(id);
  if (!existing) return null;
  items = items.filter((item) => item.id !== id);
  return existing;
}
