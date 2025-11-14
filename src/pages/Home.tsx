/**
 * Home page - displays list of all notes with search functionality
 */

import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useNotes } from "../hooks/useNotes";
import { ActionButtons } from "../components/ActionButtons";
import { NotesList } from "../components/NotesList";
import { SearchBar } from "../components/SearchBar";

export function Home() {
  const navigate = useNavigate();
  const { notes, loading, error, searchNotes } = useNotes();
  const [searchQuery, setSearchQuery] = useState("");

  // Filter notes based on search query
  const filteredNotes = useMemo(() => {
    return searchQuery.trim() ? searchNotes(searchQuery) : notes;
  }, [notes, searchQuery, searchNotes]);

  // Memoize handlers to prevent NoteCard re-renders
  const handleNoteClick = useCallback(
    (noteId: string) => {
      navigate(`/note/${noteId}`);
    },
    [navigate]
  );

  const handleNewTextNote = useCallback(() => {
    navigate("/new/text");
  }, [navigate]);

  const handleNewAudioNote = useCallback(() => {
    navigate("/new/audio");
  }, [navigate]);

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
    <div className="  flex flex-col h-screen bg-gray-50 overflow-hidden">
      {/* Fixed Header */}
      <div className="bg-white border-b border-gray-200 pt-safe px-4 py-4 flex-shrink-0">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Memo-rable</h1>

        {/* Search Box */}
        <SearchBar value={searchQuery} onChange={setSearchQuery} />

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Scrollable Notes List */}
      <NotesList
        notes={filteredNotes}
        searchQuery={searchQuery}
        onNoteClick={handleNoteClick}
      />

      {/* Floating Action Buttons */}
      <ActionButtons
        onNewAudioNote={handleNewAudioNote}
        onNewTextNote={handleNewTextNote}
      />
    </div>
  );
}
