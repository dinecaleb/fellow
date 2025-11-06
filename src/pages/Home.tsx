/**
 * Home page - displays list of all notes with search functionality
 */

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useNotes } from "../hooks/useNotes";
import { NoteCard } from "../components/NoteCard";
import { Note } from "../lib/types";

export function Home() {
  const navigate = useNavigate();
  const { notes, loading, error, searchNotes } = useNotes();
  const [searchQuery, setSearchQuery] = useState("");

  // Filter notes based on search query
  const filteredNotes = useMemo(() => {
    return searchQuery.trim() ? searchNotes(searchQuery) : notes;
  }, [notes, searchQuery, searchNotes]);

  const handleNoteClick = (noteId: string) => {
    navigate(`/note/${noteId}`);
  };

  const handleNewTextNote = () => {
    navigate("/new/text");
  };

  const handleNewAudioNote = () => {
    navigate("/new/audio");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-safe">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 pt-safe px-4 py-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Memo-rable</h1>

        {/* Search Box */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <svg
            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Notes List */}
      <div className="px-4 py-4">
        {filteredNotes.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-gray-600 mb-2">
              {searchQuery ? "No notes found" : "No notes yet"}
            </p>
            {!searchQuery && (
              <p className="text-sm text-gray-500">
                Create your first note to get started
              </p>
            )}
          </div>
        ) : (
          filteredNotes.map((note: Note) => (
            <NoteCard
              key={note.id}
              note={note}
              onClick={() => handleNoteClick(note.id)}
            />
          ))
        )}
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 pb-safe flex flex-col gap-3">
        <button
          onClick={handleNewAudioNote}
          className="w-14 h-14 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center"
          title="New Audio Note"
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
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>
        </button>
        <button
          onClick={handleNewTextNote}
          className="w-14 h-14 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center"
          title="New Text Note"
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
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
