/**
 * NoteDetailsHeader component - header section with title, edit controls, and actions
 */

import { Note } from "../../lib/types";

interface NoteDetailsHeaderProps {
  note: Note;
  isEditing: boolean;
  editTitle: string;
  editBody: string;
  onEditTitleChange: (title: string) => void;
  onEditBodyChange: (body: string) => void;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onDelete: () => void;
  onBack: () => void;
}

export function NoteDetailsHeader({
  note,
  isEditing,
  editTitle,
  editBody,
  onEditTitleChange,
  onEditBodyChange,
  onEdit,
  onCancel,
  onSave,
  onDelete,
  onBack,
}: NoteDetailsHeaderProps) {
  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="bg-white border-b border-gray-200 pt-safe px-4 py-4">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
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
                onClick={onEdit}
                className="p-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
                aria-label="Edit note"
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
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
              <button
                onClick={onDelete}
                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                aria-label="Delete note"
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
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
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
            onChange={(e) => onEditTitleChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Title"
          />
          {note.type === "text" && (
            <textarea
              value={editBody}
              onChange={(e) => onEditBodyChange(e.target.value)}
              rows={10}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Note content..."
            />
          )}
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
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
  );
}
