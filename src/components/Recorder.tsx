/**
 * Recorder component - handles audio recording with playback preview
 * Uses proper Capacitor file loading methods
 */

import { useState, useEffect } from "react";
import { useRecorder } from "../hooks/useRecorder";
import { AudioNote } from "../lib/types";
import { AudioPlayer } from "./AudioPlayer";
import { Capacitor } from "@capacitor/core";

interface RecorderProps {
  onSave: (note: AudioNote) => void;
  onCancel: () => void;
}

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

  // Load audio when recording stops - use base64 directly from plugin (per documentation)
  useEffect(() => {
    if (recordingBase64 && recordingMimeType && !isRecording) {
      setAudioError(null);
      // Use base64 directly from plugin result (per plugin documentation)
      const cleanBase64 = recordingBase64.replace(/^\/+/, "").trim();

      // Convert audio/aac to audio/mp4 for iOS compatibility (M4A files are MP4 containers)
      let mimeType = recordingMimeType;
      if (mimeType === "audio/aac" || mimeType.includes("aac")) {
        mimeType = "audio/mp4"; // M4A files are MP4 containers with AAC codec
      }

      // For iOS, use data URLs directly (more reliable than blob URLs in WebView)
      const isIOS = Capacitor.getPlatform() === "ios";
      if (isIOS) {
        const dataUrl = `data:${mimeType};base64,${cleanBase64}`;
        console.log("[RECORDER] iOS: Using data URL for audio playback");
        setAudioUrl(dataUrl);
      } else {
        // For Android and web, try blob URL first, fallback to data URL
        try {
          // Convert base64 to binary
          const binaryString = atob(cleanBase64);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }

          // Create Blob with correct MIME type
          const blob = new Blob([bytes], { type: mimeType });
          const blobUrl = URL.createObjectURL(blob);

          console.log(
            "[RECORDER] Blob URL created:",
            blobUrl.substring(0, 50) + "..."
          );
          console.log("[RECORDER] Blob size:", blob.size, "bytes");
          console.log("[RECORDER] Plugin MIME type:", recordingMimeType);
          console.log("[RECORDER] Using HTML5-compatible MIME type:", mimeType);

          setAudioUrl(blobUrl);
        } catch (blobErr) {
          console.error("[RECORDER] Error creating blob URL:", blobErr);
          // Fallback to data URL
          const dataUrl = `data:${mimeType};base64,${cleanBase64}`;
          console.log("[RECORDER] Falling back to data URL");
          setAudioUrl(dataUrl);
        }
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

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

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
      audioPath: recordingFileName, // Store just the filename
      duration,
      mimeType: recordingMimeType || undefined, // Store mimeType from plugin
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

          {/* Duration Display */}
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

          {/* Recording Controls */}
          <div className="flex flex-col items-center gap-4 mb-6">
            {!isRecording && !recordingFileName && (
              <button
                onClick={handleStart}
                className="w-20 h-20 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:bg-red-600 active:scale-95 transition-all"
                disabled={hasPermission === false}
              >
                <svg
                  className="w-10 h-10"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
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
                    onClick={resumeRecording}
                    className="w-16 h-16 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg hover:bg-green-600 active:scale-95 transition-all"
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
                    onClick={pauseRecording}
                    className="w-16 h-16 rounded-full bg-yellow-500 text-white flex items-center justify-center shadow-lg hover:bg-yellow-600 active:scale-95 transition-all"
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
                  onClick={handleStop}
                  className="w-20 h-20 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:bg-red-600 active:scale-95 transition-all"
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
            )}

            {/* Audio Preview */}
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
                    onError={(error) => setAudioError(error)}
                    fileName={recordingFileName || undefined}
                  />
                ) : !audioError ? (
                  <div className="text-center py-4 text-gray-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
                    <div className="text-sm">Loading audio...</div>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {recordingFileName && !isRecording && (
        <div className="border-t border-gray-200 bg-white p-4 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!recordingFileName}
            className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save
          </button>
        </div>
      )}
    </div>
  );
}
