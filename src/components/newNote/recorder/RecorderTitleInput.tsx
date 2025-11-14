/**
 * RecorderTitleInput - Title input field for recording
 */

interface RecorderTitleInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function RecorderTitleInput({
  value,
  onChange,
}: RecorderTitleInputProps) {
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Title
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter note title..."
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
      />
    </div>
  );
}
