/**
 * NoteDetailsContent component - displays note content (text or audio)
 */

import { memo } from "react";
import { AudioPlayer } from "../shared/AudioPlayer";

interface NoteDetailsContentProps {
  noteType: "text" | "audio";
  noteBody?: string;
  audioUrl: string | null;
  audioError: string | null;
  duration?: number;
  audioPath?: string;
  title?: string;
  onAudioError: (error: string) => void;
}

function NoteDetailsContentComponent({
  noteType,
  noteBody,
  audioUrl,
  audioError,
  duration,
  audioPath,
  title,
  onAudioError,
}: NoteDetailsContentProps) {
  return (
    <div className="px-4 py-6">
      {noteType === "text" ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-fade-in-up">
          <div className="prose max-w-none whitespace-pre-wrap text-gray-700">
            {noteBody || (
              <span className="italic text-gray-400">No content</span>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-fade-in-up">
          {audioError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm animate-fade-in">
              {audioError}
            </div>
          )}
          {audioUrl ? (
            <div className="animate-fade-in">
              <AudioPlayer
                src={audioUrl}
                duration={duration}
                onError={onAudioError}
                fileName={audioPath}
                title={title}
              />
            </div>
          ) : !audioError ? (
            <div className="text-center py-8 text-gray-500 animate-fade-in">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
              <div className="text-sm">Loading audio...</div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

// Memoize to prevent re-renders when audio props haven't changed
export const NoteDetailsContent = memo(NoteDetailsContentComponent);
