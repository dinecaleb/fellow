/**
 * NoteView page - displays a single note (text or audio) with options to edit/delete
 */

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useNotes } from "../hooks/useNotes";
import { Note } from "../lib/types";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Capacitor } from "@capacitor/core";
import { AudioPlayer } from "../components/AudioPlayer";

export function NoteView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { notes, loading, deleteNote, updateNote } = useNotes();
  const [note, setNote] = useState<Note | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const lastAudioPathRef = useRef<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");

  // Memoize the current note to prevent unnecessary reloads
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

  /**
   * Load audio file for playback
   * path should be just the filename (not full path)
   * Uses Capacitor.convertFileSrc for native platforms
   */
  const loadAudioUrl = useCallback(
    async (fileName: string, mimeTypeFromNote?: string) => {
      try {
        if (Capacitor.isNativePlatform()) {
          // Native: Read file and create data URL
          const result = await Filesystem.readFile({
            path: fileName,
            directory: Directory.Data,
          });

          // Get base64 data
          let base64Data = typeof result.data === "string" ? result.data : "";
          if (base64Data.includes(",")) {
            base64Data = base64Data.split(",")[1];
          }

          // Remove any leading slashes or invalid characters
          base64Data = base64Data.replace(/^\/+/, "").trim();

          // Validate base64 string
          if (!/^[A-Za-z0-9+/]*={0,2}$/.test(base64Data)) {
            throw new Error("Invalid base64 audio data");
          }

          // Convert plugin MIME type to HTML5-compatible MIME type
          let mimeType: string;
          if (mimeTypeFromNote) {
            const pluginMimeType = mimeTypeFromNote;
            if (
              pluginMimeType === "audio/aac" ||
              pluginMimeType.includes("aac") ||
              fileName.endsWith(".m4a")
            ) {
              mimeType = "audio/mp4";
            } else if (pluginMimeType.includes("webm")) {
              mimeType = "audio/webm";
            } else if (pluginMimeType.includes("ogg")) {
              mimeType = "audio/ogg";
            } else {
              mimeType = pluginMimeType;
            }
          } else {
            // Fallback: guess from filename
            if (fileName.endsWith(".m4a")) {
              mimeType = "audio/mp4";
            } else if (fileName.endsWith(".mp4")) {
              mimeType = "audio/mp4";
            } else if (fileName.endsWith(".webm")) {
              mimeType = "audio/webm";
            } else if (fileName.endsWith(".ogg")) {
              mimeType = "audio/ogg";
            } else {
              mimeType = "audio/mp4";
            }
          }

          // For iOS, use data URLs directly (more reliable than blob URLs in WebView)
          const isIOS = Capacitor.getPlatform() === "ios";
          if (isIOS) {
            const dataUrl = `data:${mimeType};base64,${base64Data}`;
            console.log("[NOTEVIEW] iOS: Using data URL for audio playback");
            setAudioUrl(dataUrl);
          } else {
            // For Android and web, try blob URL first, fallback to data URL
            try {
              // Convert base64 to binary
              const binaryString = atob(base64Data);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }

              // Create Blob with correct MIME type
              const blob = new Blob([bytes], { type: mimeType });
              const blobUrl = URL.createObjectURL(blob);

              console.log(
                "[NOTEVIEW] Blob URL created:",
                blobUrl.substring(0, 50) + "..."
              );
              console.log("[NOTEVIEW] Blob size:", blob.size, "bytes");
              console.log("[NOTEVIEW] Blob MIME type:", mimeType);

              setAudioUrl(blobUrl);
            } catch (blobErr) {
              console.error("[NOTEVIEW] Error creating blob URL:", blobErr);
              // Fallback to data URL
              const dataUrl = `data:${mimeType};base64,${base64Data}`;
              console.log("[NOTEVIEW] Falling back to data URL");
              setAudioUrl(dataUrl);
            }
          }
        } else {
          // Web: Read file as Blob or base64
          const result = await Filesystem.readFile({
            path: fileName,
            directory: Directory.Data,
          });

          if (result.data instanceof Blob) {
            const objectUrl = URL.createObjectURL(result.data);
            setAudioUrl(objectUrl);
          } else {
            const base64Data =
              typeof result.data === "string" ? result.data : "";
            const cleanBase64 = base64Data.includes(",")
              ? base64Data.split(",")[1]
              : base64Data;

            let mimeType = "audio/mp4";
            if (fileName.endsWith(".m4a") || fileName.endsWith(".mp4")) {
              mimeType = "audio/mp4";
            } else if (fileName.endsWith(".webm")) {
              mimeType = "audio/webm";
            } else if (fileName.endsWith(".ogg")) {
              mimeType = "audio/ogg";
            }

            const dataUrl = `data:${mimeType};base64,${cleanBase64}`;
            setAudioUrl(dataUrl);
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setAudioError(`Failed to load audio file: ${errorMessage}`);
        setAudioUrl(null);
      }
    },
    []
  );

  // Extract audio-specific values to prevent unnecessary reloads
  const noteAudioPath =
    currentNote && currentNote.type === "audio" ? currentNote.audioPath : null;
  const noteMimeType =
    currentNote && currentNote.type === "audio" ? currentNote.mimeType : null;

  // Load audio only when audioPath changes (not when title changes)
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

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString();
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
      {/* Header */}
      <div className="bg-white border-b border-gray-200 pt-safe px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate("/")}
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
          <div className="flex gap-2">
            {!isEditing && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-700"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="px-3 py-1 text-sm text-red-600 hover:text-red-700"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>

        {isEditing ? (
          <div className="space-y-3">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Title"
            />
            {note.type === "text" && (
              <textarea
                value={editBody}
                onChange={(e) => setEditBody(e.target.value)}
                rows={10}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Note content..."
              />
            )}
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {note.title}
            </h1>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 font-medium">
                {note.type === "text" ? "Text" : "Audio"}
              </span>
              <span>•</span>
              <span>{formatDate(note.updatedAt)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        {note.type === "text" ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="prose max-w-none whitespace-pre-wrap text-gray-700">
              {note.body || (
                <span className="italic text-gray-400">No content</span>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {audioError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                {audioError}
              </div>
            )}
            {audioUrl ? (
              <AudioPlayer
                src={audioUrl}
                duration={
                  currentNote && currentNote.type === "audio"
                    ? currentNote.duration
                    : undefined
                }
                onError={(error) => setAudioError(error)}
                fileName={noteAudioPath || undefined}
              />
            ) : !audioError ? (
              <div className="text-center py-8 text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
                <div className="text-sm">Loading audio...</div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
