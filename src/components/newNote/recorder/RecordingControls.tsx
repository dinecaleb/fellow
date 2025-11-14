/**
 * Recording Controls Component
 * Displays recording controls (start, pause, resume, stop)
 */

import { formatDuration } from "../../../utils/audio/formatUtils";

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
          <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
              clipRule="evenodd"
            />
          </svg>
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
                <svg
                  className="w-8 h-8"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            ) : (
              <button
                onClick={onPause}
                className="w-16 h-16 rounded-full bg-yellow-500 text-white flex items-center justify-center shadow-lg hover:bg-yellow-600 active:scale-95 transition-all"
                aria-label="Pause recording"
              >
                <svg
                  className="w-8 h-8"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}

            <button
              onClick={onStop}
              className="w-20 h-20 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:bg-red-600 active:scale-95 transition-all"
              aria-label="Stop recording"
            >
              <svg
                className="w-10 h-10"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
