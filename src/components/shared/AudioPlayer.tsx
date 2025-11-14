/**
 * WhatsApp-style Audio Player Component
 * Simple, clean audio player with waveform visualization
 * Uses @capacitor-community/native-audio for reliable cross-platform playback
 *
 * @module AudioPlayer
 */

import { useAudioPlayer } from "../../hooks/useAudioPlayer";
import { AudioPlayerUI } from "./audio/AudioPlayerUI";

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
  title,
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
    title,
  });

  return (
    <AudioPlayerUI
      isPlaying={isPlaying}
      isLoading={isLoading}
      currentTime={currentTime}
      duration={actualDuration}
      onTogglePlayPause={togglePlayPause}
    />
  );
}
