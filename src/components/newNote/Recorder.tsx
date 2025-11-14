/**
 * Recorder component - handles audio recording with playback preview
 */

import { useState, useEffect } from "react";
import { useRecorder } from "../../hooks/useRecorder";
import { AudioNote } from "../../lib/types";
import { createAudioUrlFromBase64 } from "../../utils/audio/audioUrlLoader";
import { RecordingControlsSection } from "./recorder/RecordingControlsSection";
import { AudioPreviewSection } from "./recorder/AudioPreviewSection";
import { RecorderActionButtons } from "./recorder/RecorderActionButtons";
import { RecorderTitleInput } from "./recorder/RecorderTitleInput";
import { RecorderErrorDisplay } from "./recorder/RecorderErrorDisplay";

interface RecorderProps {
  /** Callback when recording is saved */
  onSave: (note: AudioNote) => void;
  /** Callback when recording is cancelled */
  onCancel: () => void;
}

/**
 * Recorder Component - Provides audio recording with preview and save
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
          <RecorderTitleInput value={title} onChange={setTitle} />
          <RecorderErrorDisplay error={error} />
          <RecordingControlsSection
            isRecording={isRecording}
            isPaused={isPaused}
            duration={duration}
            hasPermission={hasPermission}
            onStart={handleStart}
            onStop={handleStop}
            onPause={pauseRecording}
            onResume={resumeRecording}
          />
          {recordingFileName && !isRecording && (
            <div className="w-full animate-fade-in-up">
              <AudioPreviewSection
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
      {recordingFileName && !isRecording && (
        <RecorderActionButtons
          onSave={handleSave}
          onCancel={onCancel}
          disabled={!recordingFileName}
        />
      )}
    </div>
  );
}
