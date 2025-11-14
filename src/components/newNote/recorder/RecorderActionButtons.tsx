/**
 * RecorderActionButtons - Save and Cancel buttons for recording
 */

interface RecorderActionButtonsProps {
  onSave: () => void;
  onCancel: () => void;
  disabled?: boolean;
}

export function RecorderActionButtons({
  onSave,
  onCancel,
  disabled = false,
}: RecorderActionButtonsProps) {
  return (
    <div className="border-t border-gray-200 bg-white p-4 flex gap-3 animate-fade-in-up">
      <button
        onClick={onCancel}
        className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 active:scale-95 transition-all duration-200"
      >
        Cancel
      </button>
      <button
        onClick={onSave}
        disabled={disabled}
        className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Save
      </button>
    </div>
  );
}
