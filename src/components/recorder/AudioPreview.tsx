/**
 * Audio Preview Component
 * Displays audio player preview after recording
 */

import { AudioPlayer } from "../AudioPlayer";

interface AudioPreviewProps {
  audioUrl: string | null;
  duration: number;
  fileName: string | null;
  error: string | null;
  isLoading: boolean;
  onError: (error: string) => void;
}

/**
 * Audio preview component
 * Shows audio player or loading/error states
 *
 * @param props - Audio preview configuration
 */
export function AudioPreview({
  audioUrl,
  duration,
  fileName,
  error,
  isLoading,
  onError,
}: AudioPreviewProps) {
  if (error) {
    return (
      <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
        {error}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-4 text-gray-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
        <div className="text-sm">Loading audio...</div>
      </div>
    );
  }

  if (!audioUrl) {
    return null;
  }

  return (
    <AudioPlayer
      src={audioUrl}
      duration={duration}
      onError={onError}
      fileName={fileName || undefined}
    />
  );
}
