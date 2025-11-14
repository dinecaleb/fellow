/**
 * NewNote page - create new text or audio notes
 */

import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useNotes } from "../hooks/useNotes";
import { Recorder } from "../components/newNote/Recorder";
import { NewNoteHeader } from "../components/newNote/NewNoteHeader";
import { TextNoteForm } from "../components/newNote/TextNoteForm";
import { AudioNote } from "../lib/types";

export function NewNote() {
  const { type } = useParams<{ type: "text" | "audio" }>();
  const navigate = useNavigate();
  const { createTextNote, createAudioNote } = useNotes();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSaveTextNote = async () => {
    if (!title.trim() && !body.trim()) {
      setError("Please enter a title or body");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await createTextNote(title, body);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create note");
      setSaving(false);
    }
  };

  const handleSaveAudioNote = async (note: AudioNote) => {
    try {
      setSaving(true);
      setError(null);
      await createAudioNote(note.title, note.audioPath, note.duration);
      navigate("/");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create audio note"
      );
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/");
  };

  if (type === "audio") {
    return (
      <div className="h-screen flex flex-col bg-gray-50">
        <NewNoteHeader title="New Audio Note" onCancel={handleCancel} />
        <Recorder onSave={handleSaveAudioNote} onCancel={handleCancel} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-safe">
      {/* Header */}
      <NewNoteHeader
        title="New Text Note"
        onCancel={handleCancel}
        rightElement={
          <button
            onClick={handleSaveTextNote}
            disabled={saving}
            className="text-indigo-600 hover:text-indigo-700 font-medium disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        }
      />

      {/* Error Message */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm animate-fade-in-down">
          {error}
        </div>
      )}

      {/* Form */}
      <TextNoteForm
        title={title}
        body={body}
        onTitleChange={setTitle}
        onBodyChange={setBody}
      />
    </div>
  );
}
