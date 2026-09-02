import express from "express";
import { createItem, deleteItem, getItem, listItems, updateItem } from "../store/items.js";
import { validateItemBody } from "../middleware/validation.js";

export const itemsRouter = express.Router();

itemsRouter.get("/", (_req, res) => res.json(listItems()));

itemsRouter.get("/:id", (req, res) => {
  const item = getItem(req.params.id);
  if (!item) return res.status(404).json({ error: "Item not found" });
  res.json(item);
});

itemsRouter.post("/", (req, res) => {
  const result = validateItemBody(req.body);
  if (result.error) return res.status(400).json({ error: result.error.message });
  res.status(201).json(createItem({ title: result.data.title, content: result.data.content || "" }));
});

itemsRouter.put("/:id", (req, res) => {
  const result = validateItemBody(req.body, { partial: true });
  if (result.error) return res.status(400).json({ error: result.error.message });
  const item = updateItem(req.params.id, result.data);
  if (!item) return res.status(404).json({ error: "Item not found" });
  res.json(item);
});

itemsRouter.delete("/:id", (req, res) => {
  const item = deleteItem(req.params.id);
  if (!item) return res.status(404).json({ error: "Item not found" });
  res.status(204).send();
});
