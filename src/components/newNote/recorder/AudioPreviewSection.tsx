/**
 * AudioPreviewSection - Audio preview with loading and error states
 */

import { AudioPlayer } from "../../shared/AudioPlayer";

interface AudioPreviewSectionProps {
  audioUrl: string | null;
  duration: number;
  fileName: string | null;
  error: string | null;
  isLoading: boolean;
  onError: (error: string) => void;
}

export function AudioPreviewSection({
  audioUrl,
  duration,
  fileName,
  error,
  isLoading,
  onError,
}: AudioPreviewSectionProps) {
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
