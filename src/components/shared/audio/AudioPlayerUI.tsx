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
import { PlayIcon, PauseIcon } from "../icons";

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
          <PauseIcon />
        ) : (
          <PlayIcon className="w-5 h-5 ml-0.5" />
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
