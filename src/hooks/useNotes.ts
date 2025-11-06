/**
 * Hook for managing notes (text and audio)
 * Provides CRUD operations and search functionality
 */

import { useState, useEffect, useCallback } from 'react';
import { useStorage } from './useStorage';
import { generateNoteId } from '../utils/id';
import { Note, TextNote, AudioNote } from '../lib/types';

interface UseNotesReturn {
    notes: Note[];
    loading: boolean;
    error: string | null;
    createTextNote: (title: string, body: string) => Promise<TextNote>;
    createAudioNote: (title: string, audioPath: string, duration?: number) => Promise<AudioNote>;
    updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
    deleteNote: (id: string) => Promise<void>;
    searchNotes: (query: string) => Note[];
}

export function useNotes(): UseNotesReturn {
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { loadNotes, saveNotes } = useStorage();

    const loadNotesFromStorage = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const loadedNotes = await loadNotes();
            // Sort by updatedAt descending (newest first)
            loadedNotes.sort((a, b) => b.updatedAt - a.updatedAt);
            setNotes(loadedNotes);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load notes');
        } finally {
            setLoading(false);
        }
    }, [loadNotes]);

    // Load notes on mount
    useEffect(() => {
        loadNotesFromStorage();
    }, [loadNotesFromStorage]);

    const createTextNote = useCallback(
        async (title: string, body: string): Promise<TextNote> => {
            const now = Date.now();
            const newNote: TextNote = {
                id: generateNoteId(),
                type: 'text',
                title: title.trim() || 'Untitled',
                body: body.trim(),
                createdAt: now,
                updatedAt: now,
            };

            try {
                const updatedNotes = [newNote, ...notes];
                await saveNotes(updatedNotes);
                setNotes(updatedNotes);
                return newNote;
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to create note';
                setError(errorMessage);
                throw new Error(errorMessage);
            }
        },
        [notes, saveNotes]
    );

    const createAudioNote = useCallback(
        async (title: string, audioPath: string, duration?: number): Promise<AudioNote> => {
            const now = Date.now();
            const newNote: AudioNote = {
                id: generateNoteId(),
                type: 'audio',
                title: title.trim() || 'Untitled Audio',
                audioPath,
                duration,
                createdAt: now,
                updatedAt: now,
            };

            try {
                const updatedNotes = [newNote, ...notes];
                await saveNotes(updatedNotes);
                setNotes(updatedNotes);
                return newNote;
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to create audio note';
                setError(errorMessage);
                throw new Error(errorMessage);
            }
        },
        [notes, saveNotes]
    );

    const updateNote = useCallback(
        async (id: string, updates: Partial<Note>): Promise<void> => {
            try {
                const updatedNotes = notes.map((note) => {
                    if (note.id === id) {
                        // Preserve the note type and merge updates
                        if (note.type === 'text') {
                            return {
                                ...note,
                                ...(updates as Partial<TextNote>),
                                updatedAt: Date.now(),
                            } as TextNote;
                        } else {
                            return {
                                ...note,
                                ...(updates as Partial<AudioNote>),
                                updatedAt: Date.now(),
                            } as AudioNote;
                        }
                    }
                    return note;
                });
                await saveNotes(updatedNotes);
                setNotes(updatedNotes);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to update note';
                setError(errorMessage);
                throw new Error(errorMessage);
            }
        },
        [notes, saveNotes]
    );

    const deleteNote = useCallback(
        async (id: string): Promise<void> => {
            try {
                const updatedNotes = notes.filter((note) => note.id !== id);
                await saveNotes(updatedNotes);
                setNotes(updatedNotes);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to delete note';
                setError(errorMessage);
                throw new Error(errorMessage);
            }
        },
        [notes, saveNotes]
    );

    const searchNotes = useCallback(
        (query: string): Note[] => {
            if (!query.trim()) {
                return notes;
            }

            const lowerQuery = query.toLowerCase();
            return notes.filter((note) => {
                const titleMatch = note.title.toLowerCase().includes(lowerQuery);
                if (note.type === 'text') {
                    const bodyMatch = note.body.toLowerCase().includes(lowerQuery);
                    return titleMatch || bodyMatch;
                }
                return titleMatch;
            });
        },
        [notes]
    );

    return {
        notes,
        loading,
        error,
        createTextNote,
        createAudioNote,
        updateNote,
        deleteNote,
        searchNotes,
    };
}

