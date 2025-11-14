/**
 * ActionButtons component - floating action buttons for creating new notes
 */

import { MicrophoneIcon, PlusIcon } from "../shared/icons";

interface ActionButtonsProps {
  onNewAudioNote: () => void;
  onNewTextNote: () => void;
}

export function ActionButtons({
  onNewAudioNote,
  onNewTextNote,
}: ActionButtonsProps) {
  return (
    <div className="fixed bottom-6 right-6 pb-safe flex flex-col gap-3 animate-fade-in-up">
      <button
        onClick={onNewAudioNote}
        className="w-14 h-14 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 active:scale-90 transition-all duration-200 flex items-center justify-center animate-scale-in"
        style={{ animationDelay: "100ms" }}
        title="New Audio Note"
      >
        <MicrophoneIcon />
      </button>
      <button
        onClick={onNewTextNote}
        className="w-14 h-14 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 active:scale-90 transition-all duration-200 flex items-center justify-center animate-scale-in"
        style={{ animationDelay: "200ms" }}
        title="New Text Note"
      >
        <PlusIcon />
      </button>
    </div>
  );
}
