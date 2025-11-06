/**
 * NoteViewHeader component - header section with title, edit controls, and actions
 */

import { Note } from "../../lib/types";

interface NoteViewHeaderProps {
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

export function NoteViewHeader({
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
}: NoteViewHeaderProps) {
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
                className="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-700"
              >
                Edit
              </button>
              <button
                onClick={onDelete}
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
