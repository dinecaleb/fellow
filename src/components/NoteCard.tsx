/**
 * NoteCard component - displays a preview of a note in the list
 */

import { Note } from "../lib/types";

interface NoteCardProps {
  note: Note;
  onClick: () => void;
}

export function NoteCard({ note, onClick }: NoteCardProps) {
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return "";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-3 cursor-pointer hover:shadow-md transition-shadow active:bg-gray-50"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-lg font-semibold text-gray-900 flex-1 line-clamp-2">
          {note.title}
        </h3>
        <span className="ml-2 text-xs text-gray-500 whitespace-nowrap">
          {formatDate(note.updatedAt)}
        </span>
      </div>

      {note.type === "text" ? (
        <p className="text-gray-600 text-sm line-clamp-2 mb-2">
          {note.body || (
            <span className="italic text-gray-400">No content</span>
          )}
        </p>
      ) : (
        <div className="flex items-center text-sm text-gray-600 mb-2">
          <svg
            className="w-4 h-4 mr-2 text-indigo-600"
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
          <span>{formatDuration(note.duration)}</span>
          {note.duration && (
            <span className="ml-1 text-gray-400">• Audio memo</span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <span className="text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 font-medium">
          {note.type === "text" ? "Text" : "Audio"}
        </span>
      </div>
    </div>
  );
}
