/**
 * Recorder component - handles audio recording with playback preview
 * Uses proper Capacitor file loading methods
 *
 * @module Recorder
 */

import { useState, useEffect } from "react";
import { useRecorder } from "../../hooks/useRecorder";
import { AudioNote } from "../../lib/types";
import { RecordingControls } from "./recorder/RecordingControls";
import { AudioPreview } from "./recorder/AudioPreview";
import { createAudioUrlFromBase64 } from "../../utils/audio/audioUrlLoader";

interface RecorderProps {
  /** Callback when recording is saved */
  onSave: (note: AudioNote) => void;
  /** Callback when recording is cancelled */
  onCancel: () => void;
}

/**
 * Recorder Component
 * Provides audio recording functionality with preview and save capabilities
 *
 * @param props - Recorder configuration
 */
export function Recorder({ onSave, onCancel }: RecorderProps) {
  const {
    isRecording,
    isPaused,
    duration,
    error,
    recordingFileName,
    recordingMimeType,
    recordingBase64,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    requestPermission,
    hasPermission,
  } = useRecorder();

  const [title, setTitle] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);

  // Load audio when recording stops
  useEffect(() => {
    if (recordingBase64 && recordingMimeType && !isRecording) {
      setAudioError(null);
      try {
        const url = createAudioUrlFromBase64({
          base64: recordingBase64,
          mimeType: recordingMimeType,
        });
        setAudioUrl(url);
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Failed to load audio";
        setAudioError(errorMsg);
      }
    }
  }, [recordingBase64, recordingMimeType, isRecording]);

  // Cleanup blob URLs
  useEffect(() => {
    return () => {
      if (audioUrl && audioUrl.startsWith("blob:")) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const handleStart = async () => {
    if (hasPermission === false) {
      const granted = await requestPermission();
      if (!granted) {
        return;
      }
    }
    await startRecording();
  };

  const handleStop = async () => {
    await stopRecording();
  };

  const handleSave = async () => {
    if (!recordingFileName) return;

    const newNote: AudioNote = {
      id: `audio-${Date.now()}`,
      type: "audio",
      title: title.trim() || "Untitled Audio",
      audioPath: recordingFileName,
      duration,
      mimeType: recordingMimeType || undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    onSave(newNote);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="flex-1 p-6">
        <div className="max-w-md mx-auto">
          {/* Title Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter note title..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Recording Controls */}
          <RecordingControls
            isRecording={isRecording}
            isPaused={isPaused}
            duration={duration}
            hasPermission={hasPermission}
            onStart={handleStart}
            onStop={handleStop}
            onPause={pauseRecording}
            onResume={resumeRecording}
          />

          {/* Audio Preview */}
          {recordingFileName && !isRecording && (
            <div className="w-full animate-fade-in-up">
              <AudioPreview
                audioUrl={audioUrl}
                duration={duration}
                fileName={recordingFileName}
                error={audioError}
                isLoading={!audioUrl && !audioError}
                onError={setAudioError}
              />
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      {recordingFileName && !isRecording && (
        <div className="border-t border-gray-200 bg-white p-4 flex gap-3 animate-fade-in-up">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 active:scale-95 transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!recordingFileName}
            className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save
          </button>
        </div>
      )}
    </div>
  );
}
