/**
 * NoteViewContent component - displays note content (text or audio)
 */

import { Note } from "../../lib/types";
import { AudioPlayer } from "../AudioPlayer";

interface NoteViewContentProps {
  note: Note;
  audioUrl: string | null;
  audioError: string | null;
  duration?: number;
  audioPath?: string;
  onAudioError: (error: string) => void;
}

export function NoteViewContent({
  note,
  audioUrl,
  audioError,
  duration,
  audioPath,
  onAudioError,
}: NoteViewContentProps) {
  return (
    <div className="px-4 py-6">
      {note.type === "text" ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="prose max-w-none whitespace-pre-wrap text-gray-700">
            {note.body || (
              <span className="italic text-gray-400">No content</span>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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
              fileName={audioPath}
            />
          ) : !audioError ? (
            <div className="text-center py-8 text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
              <div className="text-sm">Loading audio...</div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
