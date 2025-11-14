/**
 * NoteDetailsHeader component - header section with title, edit controls, and actions
 */

import { Note } from "../../lib/types";
import { ArrowLeftIcon, EditIcon, DeleteIcon } from "../shared/icons";

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
          className="text-indigo-600 hover:text-indigo-700 active:scale-90 transition-all duration-200"
        >
          <ArrowLeftIcon />
        </button>
        <div className="flex gap-2">
          {!isEditing && (
            <>
              <button
                onClick={onEdit}
                className="p-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg active:scale-90 transition-all duration-200 animate-fade-in-scale"
                aria-label="Edit note"
              >
                <EditIcon />
              </button>
              <button
                onClick={onDelete}
                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg active:scale-90 transition-all duration-200 animate-fade-in-scale"
                style={{ animationDelay: "50ms" }}
                aria-label="Delete note"
              >
                <DeleteIcon />
              </button>
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-3 animate-fade-in-down">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => onEditTitleChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
            placeholder="Title"
          />
          {note.type === "text" && (
            <textarea
              value={editBody}
              onChange={(e) => onEditBodyChange(e.target.value)}
              rows={10}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
              placeholder="Note content..."
            />
          )}
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 active:scale-95 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 active:scale-95 transition-all duration-200"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <div className="animate-fade-in">
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
