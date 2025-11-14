/**
 * TextNoteForm component - form for creating text notes
 */

interface TextNoteFormProps {
  title: string;
  body: string;
  onTitleChange: (value: string) => void;
  onBodyChange: (value: string) => void;
}

export function TextNoteForm({
  title,
  body,
  onTitleChange,
  onBodyChange,
}: TextNoteFormProps) {
  return (
    <div className="px-4 py-6 space-y-4">
      <div>
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Title"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg font-medium"
        />
      </div>
      <div>
        <textarea
          value={body}
          onChange={(e) => onBodyChange(e.target.value)}
          placeholder="Start writing..."
          rows={15}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
        />
      </div>
    </div>
  );
}
