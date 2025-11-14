/**
 * NotesList component - displays a list of notes with empty state
 */

import { Note } from "../../lib/types";
import { NoteCard } from "./NoteCard";

interface NotesListProps {
  notes: Note[];
  searchQuery: string;
  onNoteClick: (noteId: string) => void;
}

export function NotesList({ notes, searchQuery, onNoteClick }: NotesListProps) {
  return (
    <div className="flex-1 overflow-y-auto pb-safe">
      <div className="px-4 py-4">
        {notes.length === 0 ? (
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
          <div className="space-y-3">
            {notes.map((note: Note) => (
              <NoteCard
                key={note.id}
                note={note}
                onClick={() => onNoteClick(note.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
