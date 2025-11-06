/**
 * Storage hook for managing notes persistence
 * Provides load and save operations for notes using Capacitor Preferences
 *
 * @module useStorage
 */

import { useCallback } from 'react';
import { Preferences } from '@capacitor/preferences';
import { Note, NotesStorage } from '../lib/types';

const STORAGE_KEY = 'memorable_notes';

export interface UseStorageReturn {
    /**
     * Load all notes from local storage
     * @returns Promise resolving to array of notes
     */
    loadNotes: () => Promise<Note[]>;
    /**
     * Save notes to local storage
     * @param notes - Array of notes to save
     * @returns Promise that resolves when save is complete
     * @throws Error if save fails
     */
    saveNotes: (notes: Note[]) => Promise<void>;
}

/**
 * Hook for managing notes storage operations
 * Provides load and save functions for persisting notes locally
 *
 * @returns Storage operations (loadNotes, saveNotes)
 * @example
 * ```tsx
 * const { loadNotes, saveNotes } = useStorage();
 * const notes = await loadNotes();
 * await saveNotes(updatedNotes);
 * ```
 */
export function useStorage(): UseStorageReturn {
    const loadNotes = useCallback(async (): Promise<Note[]> => {
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
    }, []);

    const saveNotes = useCallback(async (notes: Note[]): Promise<void> => {
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
    }, []);

    return {
        loadNotes,
        saveNotes,
    };
}

