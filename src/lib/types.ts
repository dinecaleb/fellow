/**
 * Type definitions for Memo-rable app
 */

export type NoteType = 'text' | 'audio';

export interface BaseNote {
    id: string;
    type: NoteType;
    title: string;
    createdAt: number;
    updatedAt: number;
}

export interface TextNote extends BaseNote {
    type: 'text';
    body: string;
}

export interface AudioNote extends BaseNote {
    type: 'audio';
    audioPath: string; // Path to the audio file
    duration?: number; // Duration in seconds
    mimeType?: string; // MIME type from recording (e.g., 'audio/aac', 'audio/webm', 'audio/mp4')
}

export type Note = TextNote | AudioNote;

export interface NotesStorage {
    notes: Note[];
}

