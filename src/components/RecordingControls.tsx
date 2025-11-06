/**
 * RecordingControls component - displays recording UI and controls
 */

import { AudioPlayer } from "./AudioPlayer";

interface RecordingControlsProps {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  hasPermission: boolean | null;
  recordingFileName: string | null;
  audioUrl: string | null;
  audioError: string | null;
  onStart: () => void;
  onStop: () => void;
  onPause: () => void;
  onResume: () => void;
  onRequestPermission: () => void;
  onAudioError: (error: string) => void;
}

export function RecordingControls({
  isRecording,
  isPaused,
  duration,
  hasPermission,
  recordingFileName,
  audioUrl,
  audioError,
  onStart,
  onStop,
  onPause,
  onResume,
  onRequestPermission,
  onAudioError,
}: RecordingControlsProps) {
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center gap-4 mb-6">
      {isRecording && (
        <div className="text-center mb-6">
          <div className="text-4xl font-mono font-bold text-indigo-600 mb-2">
            {formatDuration(duration)}
          </div>
          <div className="text-sm text-gray-600">
            {isPaused ? "Paused" : "Recording..."}
          </div>
        </div>
      )}

      {!isRecording && !recordingFileName && (
        <button
          onClick={onStart}
          disabled={hasPermission === false}
          className="w-20 h-20 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:bg-red-600 active:scale-95 transition-all disabled:opacity-50"
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
        <div className="flex items-center gap-4">
          {isPaused ? (
            <button
              onClick={onResume}
              className="w-16 h-16 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg hover:bg-green-600 active:scale-95 transition-all"
            >
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
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
            >
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
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
          >
            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      )}

      {recordingFileName && !isRecording && (
        <div className="w-full">
          {audioError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {audioError}
            </div>
          )}
          {audioUrl ? (
            <AudioPlayer
              src={audioUrl}
              duration={duration}
              onError={onAudioError}
            />
          ) : !audioError ? (
            <div className="text-center py-4 text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
              <div className="text-sm">Loading audio...</div>
            </div>
          ) : null}
        </div>
      )}

      {hasPermission === false && (
        <button
          onClick={onRequestPermission}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Grant Microphone Permission
        </button>
      )}
    </div>
  );
}
