import React, { useCallback, useEffect, useState } from "react";
import * as Sentry from "@sentry/react";
import { itemsApi } from "./api/items.js";
import NoteForm from "./components/NoteForm.jsx";
import NoteList from "./components/NoteList.jsx";

const release = import.meta.env.VITE_SENTRY_RELEASE || "release-health-monitor@1.1.1";
const diagnosticsEnabled = import.meta.env.DEV;

export default function App() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [status, setStatus] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await itemsApi.list());
      setStatus("");
    } catch (error) {
      Sentry.captureException(error);
      setStatus(`Could not load notes: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function reset() {
    setEditing(null);
    setTitle("");
    setContent("");
  }

  async function save(event) {
    event.preventDefault();
    setBusy(true);
    setStatus("");
    try {
      if (editing) await itemsApi.update(editing.id, { title: title.trim(), content });
      else await itemsApi.create({ title: title.trim(), content });
      reset();
      await load();
      setStatus(editing ? "Note updated." : "Note created.");
    } catch (error) {
      Sentry.captureException(error);
      setStatus(`Save failed: ${error.message}`);
    } finally {
      setBusy(false);
    }
  }

  async function remove(id) {
    if (!window.confirm("Delete this note?")) return;
    setBusyId(id);
    try {
      await itemsApi.remove(id);
      if (editing?.id === id) reset();
      await load();
      setStatus("Note deleted.");
    } catch (error) {
      Sentry.captureException(error);
      setStatus(`Delete failed: ${error.message}`);
    } finally {
      setBusyId(null);
    }
  }

  function edit(item) {
    setEditing(item);
    setTitle(item.title);
    setContent(item.content);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function triggerUnhandledFrontendError() {
    throw new Error("Intentional Unhandled Exception!");
  }

  function triggerHandledFrontendError() {
    try {
      throw new Error("Intentional Handled Exception!");
    } catch (error) {
      Sentry.captureException(error);
      setStatus("Handled error sent to Sentry.");
    }
  }

  async function triggerBackendError() {
    try {
      await itemsApi.diagnostic("async-rejection");
      setStatus("Backend diagnostic error captured.");
    } catch (error) {
      Sentry.captureException(error);
      setStatus(`Backend diagnostic failed: ${error.message}`);
    }
  }

  return (
    <main className="shell">
      <header className="hero">
        <div>
          <p className="eyebrow">DEVOPS • SENTRY</p>
          <h1>Release Health Monitor</h1>
          <p className="sub">Production-minded CRUD notes with validation, observability, resilient API handling and release tracking.</p>
        </div>
        <span className="release">{release}</span>
      </header>

      <NoteForm {...{ editing, title, content, busy, onTitleChange: setTitle, onContentChange: setContent, onSubmit: save, onCancel: reset }} />
      <NoteList {...{ items, loading, busyId, onRefresh: load, onEdit: edit, onDelete: remove }} />

      {diagnosticsEnabled && (
        <section className="card testing">
          <h2>Sentry Verification</h2>
          <p>Development-only diagnostic controls. They are not exposed in production builds.</p>
          <div className="grid">
            <button onClick={triggerUnhandledFrontendError}>Trigger Unhandled Frontend Error</button>
            <button onClick={triggerBackendError}>Trigger Backend Diagnostic Error</button>
            <button onClick={triggerHandledFrontendError}>Trigger Handled Frontend Error</button>
          </div>
        </section>
      )}

      {status && <div className="status" role="status" aria-live="polite">{status}</div>}
    </main>
  );
}
