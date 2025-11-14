/**
 * Audio Player UI Component
 * Renders the visual interface for the audio player
 */

import {
  formatTime,
  generateWaveform,
  calculateProgress,
  calculateFilledBars,
} from "../../../utils/audio/audioUtils";

export interface AudioPlayerUIProps {
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  onTogglePlayPause: () => Promise<void>;
}

/**
 * Audio player UI component
 * Displays play/pause button, waveform visualization, and time display
 *
 * @param props - UI configuration
 */
export function AudioPlayerUI({
  isPlaying,
  isLoading,
  currentTime,
  duration,
  onTogglePlayPause,
}: AudioPlayerUIProps) {
  const waveformHeights = generateWaveform();
  const progress = calculateProgress(currentTime, duration);
  const filledBars = calculateFilledBars(progress, waveformHeights.length);

  return (
    <div className="flex items-center gap-2 py-3 w-full min-w-0 overflow-hidden">
      {/* Play Button */}
      <button
        onClick={onTogglePlayPause}
        disabled={isLoading}
        className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 flex-shrink-0"
        aria-label={isPlaying ? "Pause audio" : "Play audio"}
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : isPlaying ? (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          <svg
            className="w-5 h-5 ml-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </button>

      {/* Waveform */}
      <div className="flex-1 flex items-center gap-1 h-12 min-w-0 overflow-hidden">
        {waveformHeights.map((height, index) => {
          const isFilled = index < filledBars;
          return (
            <div
              key={index}
              className={`w-1 rounded-full transition-colors flex-shrink-0 ${
                isFilled ? "bg-indigo-600" : "bg-gray-300"
              }`}
              style={{ height: `${height}%` }}
            />
          );
        })}
      </div>

      {/* Time Display */}
      <div className="text-sm font-bold text-gray-600 flex-shrink-0 min-w-[3rem] text-right">
        {formatTime(duration)}
      </div>
    </div>
  );
}
