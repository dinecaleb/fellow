/**
 * WhatsApp-style Audio Player Component
 * Simple, clean audio player with waveform visualization
 * Uses @capacitor-community/native-audio for reliable cross-platform playback
 *
 * @module AudioPlayer
 */

import { useAudioPlayer } from "../../hooks/useAudioPlayer";
import {
  formatTime,
  generateWaveform,
  calculateProgress,
  calculateFilledBars,
} from "../../utils/audio/audioUtils";
import { PlayIcon, PauseIcon } from "./icons";

export interface AudioPlayerProps {
  /** Audio source URL (data URL, blob URL, or file path) */
  src: string;
  /** Initial duration in seconds (optional, will be detected if not provided) */
  duration?: number;
  /** Error callback function */
  onError?: (error: string) => void;
  /** File name for native platforms (required for iOS/Android) */
  fileName?: string;
  /** Title for lock screen controls */
  title?: string;
}

/**
 * Audio Player Component
 * Provides a WhatsApp-style audio player interface with play/pause controls,
 * waveform visualization, and time display.
 *
 * Supports both web (HTML5 audio) and native platforms (NativeAudio plugin).
 *
 * @param props - Audio player configuration
 * @example
 * ```tsx
 * <AudioPlayer
 *   src="data:audio/mp4;base64,..."
 *   duration={120}
 *   onError={(error) => console.error(error)}
 * />
 * ```
 */
export function AudioPlayer({
  src,
  duration,
  onError,
  fileName,
}: AudioPlayerProps) {
  const {
    isPlaying,
    currentTime,
    duration: actualDuration,
    isLoading,
    togglePlayPause,
  } = useAudioPlayer({
    src,
    duration,
    onError,
    fileName,
  });

  const waveformHeights = generateWaveform();
  const progress = calculateProgress(currentTime, actualDuration);
  const filledBars = calculateFilledBars(progress, waveformHeights.length);

  return (
    <div className="flex items-center gap-2 py-3 w-full min-w-0 overflow-hidden">
      {/* Play Button */}
      <button
        onClick={togglePlayPause}
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
        {formatTime(actualDuration)}
      </div>
    </div>
  );
}
