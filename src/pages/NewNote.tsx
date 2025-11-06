/**
 * NewNote page - create new text or audio notes
 */

import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useNotes } from "../hooks/useNotes";
import { Recorder } from "../components/Recorder";
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
        <div className="bg-white border-b border-gray-200 pt-safe px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleCancel}
              className="text-indigo-600 hover:text-indigo-700"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <h1 className="text-xl font-semibold text-gray-900">
              New Audio Note
            </h1>
            <div className="w-6"></div>
          </div>
        </div>
        <Recorder onSave={handleSaveAudioNote} onCancel={handleCancel} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-safe">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 pt-safe px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handleCancel}
            className="text-indigo-600 hover:text-indigo-700"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h1 className="text-xl font-semibold text-gray-900">New Text Note</h1>
          <button
            onClick={handleSaveTextNote}
            disabled={saving}
            className="text-indigo-600 hover:text-indigo-700 font-medium disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Form */}
      <div className="px-4 py-6 space-y-4">
        <div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg font-medium"
          />
        </div>
        <div>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Start writing..."
            rows={15}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
          />
        </div>
      </div>
    </div>
  );
}
