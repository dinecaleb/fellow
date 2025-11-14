/**
 * RecorderErrorDisplay - Error message display for recorder
 */

interface RecorderErrorDisplayProps {
  error: string | null | undefined;
}

export function RecorderErrorDisplay({ error }: RecorderErrorDisplayProps) {
  if (!error) return null;

  return (
    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
      {error}
    </div>
  );
}
