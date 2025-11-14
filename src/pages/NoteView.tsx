/**
 * NoteView page - displays a single note (text or audio) with options to edit/delete
 */

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useNotes } from "../hooks/useNotes";
import { Note } from "../lib/types";
import { useAudioUrlLoader } from "../hooks/useAudioUrlLoader";
import { NoteViewHeader } from "../components/note/NoteViewHeader";
import { NoteViewContent } from "../components/note/NoteViewContent";

export function NoteView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { notes, loading, deleteNote, updateNote } = useNotes();
  const [note, setNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const lastAudioPathRef = useRef<string | null>(null);

  const { audioUrl, audioError, loadAudioUrl } = useAudioUrlLoader();

  // Find current note
  const currentNote = useMemo(() => {
    if (id && notes.length > 0) {
      return notes.find((n) => n.id === id) || null;
    }
    return null;
  }, [id, notes]);

  // Update note state when currentNote changes
  useEffect(() => {
    if (currentNote) {
      setNote(currentNote);
      setEditTitle(currentNote.title);
      if (currentNote.type === "text") {
        setEditBody(currentNote.body);
      }
    }
  }, [currentNote]);

  // Load audio when audioPath changes
  const noteAudioPath =
    currentNote && currentNote.type === "audio" ? currentNote.audioPath : null;
  const noteMimeType =
    currentNote && currentNote.type === "audio" ? currentNote.mimeType : null;

  useEffect(() => {
    if (noteAudioPath && noteAudioPath !== lastAudioPathRef.current) {
      lastAudioPathRef.current = noteAudioPath;
      loadAudioUrl(noteAudioPath, noteMimeType || undefined);
    }
  }, [noteAudioPath, noteMimeType, loadAudioUrl]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (audioUrl && audioUrl.startsWith("blob:")) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  // Memoize audio error handler to prevent re-renders
  const handleAudioError = useCallback((error: string) => {
    console.error("Audio error:", error);
  }, []);

  // Memoize duration to prevent re-renders when editing title
  const audioDuration = useMemo(() => {
    if (currentNote && currentNote.type === "audio") {
      return currentNote.duration;
    }
    return undefined;
  }, [currentNote]);

  const handleDelete = async () => {
    if (
      !note ||
      !window.confirm("Are you sure you want to delete this note?")
    ) {
      return;
    }

    try {
      await deleteNote(note.id);
      navigate("/");
    } catch (err) {
      console.error("Error deleting note:", err);
      alert("Failed to delete note");
    }
  };

  const handleSaveEdit = async () => {
    if (!note) return;

    try {
      await updateNote(note.id, {
        title:
          editTitle.trim() ||
          (note.type === "text" ? "Untitled" : "Untitled Audio"),
        ...(note.type === "text" && { body: editBody }),
      });
      setIsEditing(false);
      // Refresh the note
      const updatedNote = notes.find((n) => n.id === note.id);
      if (updatedNote) {
        setNote(updatedNote);
      }
    } catch (err) {
      console.error("Error updating note:", err);
      alert("Failed to update note");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading note...</p>
        </div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Note not found</p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-safe">
      <NoteViewHeader
        note={note}
        isEditing={isEditing}
        editTitle={editTitle}
        editBody={editBody}
        onEditTitleChange={setEditTitle}
        onEditBodyChange={setEditBody}
        onEdit={() => setIsEditing(true)}
        onCancel={() => setIsEditing(false)}
        onSave={handleSaveEdit}
        onDelete={handleDelete}
        onBack={() => navigate("/")}
      />

      <NoteViewContent
        noteType={note.type}
        noteBody={note.type === "text" ? note.body : undefined}
        audioUrl={audioUrl}
        audioError={audioError}
        duration={audioDuration}
        audioPath={noteAudioPath || undefined}
        title={note.title}
        onAudioError={handleAudioError}
      />
    </div>
  );
}
