import React from "react";

export default function NoteList({ items, loading, busyId, onRefresh, onEdit, onDelete }) {
  return (
    <section className="card">
      <div className="section-head">
        <h2>Notes</h2>
        <button className="muted" onClick={onRefresh} disabled={loading}>{loading ? "Loading…" : "Refresh"}</button>
      </div>
      <div className="notes" aria-live="polite">
        {items.map((item) => (
          <article className="note" key={item.id}>
            <div className="note-copy">
              <h3>{item.title}</h3>
              <p>{item.content || "No content"}</p>
            </div>
            <div className="note-actions">
              <button onClick={() => onEdit(item)} disabled={busyId === item.id}>Edit</button>
              <button className="danger" onClick={() => onDelete(item.id)} disabled={busyId === item.id}>{busyId === item.id ? "Deleting…" : "Delete"}</button>
            </div>
          </article>
        ))}
        {!loading && !items.length && <p className="empty">No notes yet.</p>}
      </div>
    </section>
  );
}
