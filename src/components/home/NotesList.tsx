/**
 * NotesList component - displays a list of notes with empty state
 */

import { Note } from "../../lib/types";
import { NoteCard } from "./NoteCard";
import { DocumentIcon } from "../shared/icons";

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
          <div className="text-center py-12 animate-fade-in">
            <div className="mx-auto mb-4 text-gray-400 animate-scale-in">
              <DocumentIcon />
            </div>
            <p
              className="text-gray-600 mb-2 animate-fade-in"
              style={{ animationDelay: "100ms" }}
            >
              {searchQuery ? "No notes found" : "No notes yet"}
            </p>
            {!searchQuery && (
              <p
                className="text-sm text-gray-500 animate-fade-in"
                style={{ animationDelay: "200ms" }}
              >
                Create your first note to get started
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map((note: Note, index: number) => (
              <div
                key={note.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <NoteCard note={note} onClick={() => onNoteClick(note.id)} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
