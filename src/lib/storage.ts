/**
 * Storage utilities for persisting notes locally
 * Uses Capacitor Preferences for key-value storage
 */

import { Preferences } from '@capacitor/preferences';
import { Note, NotesStorage } from './types';

const STORAGE_KEY = 'memorable_notes';

/**
 * Load all notes from local storage
 */
export async function loadNotes(): Promise<Note[]> {
    try {
        const { value } = await Preferences.get({ key: STORAGE_KEY });
        if (!value) {
            return [];
        }
        const storage: NotesStorage = JSON.parse(value);
        return storage.notes || [];
    } catch (error) {
        console.error('Error loading notes:', error);
        return [];
    }
}

/**
 * Save all notes to local storage
 */
export async function saveNotes(notes: Note[]): Promise<void> {
    try {
        const storage: NotesStorage = { notes };
        await Preferences.set({
            key: STORAGE_KEY,
            value: JSON.stringify(storage),
        });
    } catch (error) {
        console.error('Error saving notes:', error);
        throw new Error('Failed to save notes');
    }
}

/**
 * Generate a unique ID for a new note
 */
export function generateNoteId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

