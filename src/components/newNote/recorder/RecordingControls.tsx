/**
 * Recording Controls Component
 * Displays recording controls (start, pause, resume, stop)
 */

import { formatDuration } from "../../../utils/audio/formatUtils";
import { RecordIcon, PlayIcon, PauseIcon, StopIcon } from "../../shared/icons";

interface RecordingControlsProps {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  hasPermission: boolean | null;
  onStart: () => Promise<void>;
  onStop: () => Promise<void>;
  onPause: () => Promise<void>;
  onResume: () => Promise<void>;
}

/**
 * Recording controls UI component
 * Shows start/stop/pause/resume buttons and duration display
 *
 * @param props - Recording control configuration
 */
export function RecordingControls({
  isRecording,
  isPaused,
  duration,
  hasPermission,
  onStart,
  onStop,
  onPause,
  onResume,
}: RecordingControlsProps) {
  return (
    <div className="flex flex-col items-center gap-4 mb-6">
      {!isRecording && (
        <button
          onClick={onStart}
          className="w-20 h-20 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:bg-red-600 active:scale-95 transition-all"
          disabled={hasPermission === false}
          aria-label="Start recording"
        >
          <RecordIcon />
        </button>
      )}

      {isRecording && (
        <>
          {/* Duration Display */}
          <div className="text-center mb-4">
            <div className="text-4xl font-mono font-bold text-indigo-600 mb-2">
              {formatDuration(duration)}
            </div>
            <div className="text-sm text-gray-600">
              {isPaused ? "Paused" : "Recording..."}
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center gap-4">
            {isPaused ? (
              <button
                onClick={onResume}
                className="w-16 h-16 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg hover:bg-green-600 active:scale-95 transition-all"
                aria-label="Resume recording"
              >
                <PlayIcon className="w-8 h-8" />
              </button>
            ) : (
              <button
                onClick={onPause}
                className="w-16 h-16 rounded-full bg-yellow-500 text-white flex items-center justify-center shadow-lg hover:bg-yellow-600 active:scale-95 transition-all"
                aria-label="Pause recording"
              >
                <PauseIcon className="w-8 h-8" />
              </button>
            )}

            <button
              onClick={onStop}
              className="w-20 h-20 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:bg-red-600 active:scale-95 transition-all"
              aria-label="Stop recording"
            >
              <StopIcon />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
