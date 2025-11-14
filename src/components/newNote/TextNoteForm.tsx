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
    <div className="px-4 py-6 space-y-4 animate-fade-in">
      <div className="animate-fade-in-up" style={{ animationDelay: "50ms" }}>
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Title"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg font-medium transition-all duration-200"
        />
      </div>
      <div className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
        <textarea
          value={body}
          onChange={(e) => onBodyChange(e.target.value)}
          placeholder="Start writing..."
          rows={15}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition-all duration-200"
        />
      </div>
    </div>
  );
}
