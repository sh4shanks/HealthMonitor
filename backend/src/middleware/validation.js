export function validateItemBody(body, { partial = false } = {}) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { error: new Error("Request body must be an object") };
  }

  const allowed = new Set(["title", "content"]);
  const unknown = Object.keys(body).filter((key) => !allowed.has(key));
  if (unknown.length) return { error: new Error(`Unknown field: ${unknown[0]}`) };

  if (!partial || body.title !== undefined) {
    if (typeof body.title !== "string" || !body.title.trim()) {
      return { error: new Error("Title is required") };
    }
    if (body.title.trim().length > 200) return { error: new Error("Title is too long") };
  }

  if (!partial || body.content !== undefined) {
    if (body.content !== undefined && typeof body.content !== "string") {
      return { error: new Error("Content must be a string") };
    }
    if (typeof body.content === "string" && body.content.length > 10000) {
      return { error: new Error("Content is too long") };
    }
  }

  if (partial && Object.keys(body).length === 0) {
    return { error: new Error("At least one field is required") };
  }

  return {
    data: {
      ...(body.title !== undefined ? { title: body.title.trim() } : {}),
      ...(body.content !== undefined ? { content: body.content } : {})
    }
  };
}
