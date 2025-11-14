/**
 * RecordingControlsSection - Recording controls UI (start, pause, resume, stop, duration)
 */

import { formatDuration } from "../../../utils/audio/formatUtils";
import { RecordIcon, PlayIcon, PauseIcon, StopIcon } from "../../shared/icons";

interface RecordingControlsSectionProps {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  hasPermission: boolean | null;
  onStart: () => Promise<void>;
  onStop: () => void;
  onPause: () => void;
  onResume: () => void;
}

export function RecordingControlsSection({
  isRecording,
  isPaused,
  duration,
  hasPermission,
  onStart,
  onStop,
  onPause,
  onResume,
}: RecordingControlsSectionProps) {
  return (
    <div className="flex flex-col items-center gap-4 mb-6">
      {!isRecording && (
        <button
          onClick={onStart}
          className="w-20 h-20 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:bg-red-600 active:scale-90 transition-all duration-200 animate-fade-in-scale"
          disabled={hasPermission === false}
          aria-label="Start recording"
        >
          <RecordIcon />
        </button>
      )}

      {isRecording && (
        <div className="animate-fade-in-up w-full">
          {/* Duration Display */}
          <div
            className="text-center mb-4 animate-fade-in"
            style={{ animationDelay: "100ms" }}
          >
            <div className="text-4xl font-mono font-bold text-indigo-600 mb-2">
              {formatDuration(duration)}
            </div>
            <div className="text-sm text-gray-600">
              {isPaused ? "Paused" : "Recording..."}
            </div>
          </div>

          {/* Control Buttons */}
          <div
            className="flex items-center gap-4 justify-center animate-fade-in"
            style={{ animationDelay: "200ms" }}
          >
            {isPaused ? (
              <button
                onClick={onResume}
                className="w-16 h-16 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg hover:bg-green-600 active:scale-90 transition-all duration-200"
                aria-label="Resume recording"
              >
                <PlayIcon className="w-8 h-8" />
              </button>
            ) : (
              <button
                onClick={onPause}
                className="w-16 h-16 rounded-full bg-yellow-500 text-white flex items-center justify-center shadow-lg hover:bg-yellow-600 active:scale-90 transition-all duration-200"
                aria-label="Pause recording"
              >
                <PauseIcon className="w-8 h-8" />
              </button>
            )}

            <button
              onClick={onStop}
              className="w-20 h-20 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:bg-red-600 active:scale-90 transition-all duration-200"
              aria-label="Stop recording"
            >
              <StopIcon />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
