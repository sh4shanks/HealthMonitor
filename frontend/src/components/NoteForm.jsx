import React from "react";

export default function NoteForm({ editing, title, content, busy, onTitleChange, onContentChange, onSubmit, onCancel }) {
  return (
    <section className="card">
      <h2>{editing ? "Edit note" : "Create note"}</h2>
      <form onSubmit={onSubmit}>
        <label htmlFor="note-title">Title</label>
        <input id="note-title" value={title} onChange={(e) => onTitleChange(e.target.value)} maxLength={200} required />
        <label htmlFor="note-content">Content</label>
        <textarea id="note-content" value={content} onChange={(e) => onContentChange(e.target.value)} maxLength={10000} rows={5} />
        <div className="actions">
          <button type="submit" disabled={busy}>{busy ? "Saving…" : editing ? "Update" : "Create"}</button>
          {editing && <button type="button" className="muted" onClick={onCancel} disabled={busy}>Cancel</button>}
        </div>
      </form>
    </section>
  );
}
