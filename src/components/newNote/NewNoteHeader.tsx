/**
 * NewNoteHeader component - header with back button and title
 */

interface NewNoteHeaderProps {
  title: string;
  onCancel: () => void;
  rightElement?: React.ReactNode;
}

export function NewNoteHeader({
  title,
  onCancel,
  rightElement,
}: NewNoteHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 pt-safe px-4 py-4">
      <div className="flex items-center justify-between">
        <button
          onClick={onCancel}
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
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        {rightElement || <div className="w-6"></div>}
      </div>
    </div>
  );
}
