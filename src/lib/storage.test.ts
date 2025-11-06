/**
 * Tests for storage utilities
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Preferences } from '@capacitor/preferences';
import { loadNotes, saveNotes, generateNoteId } from './storage';
import { TextNote, AudioNote } from './types';

// Mock Capacitor Preferences
vi.mock('@capacitor/preferences', () => ({
    Preferences: {
        get: vi.fn(),
        set: vi.fn(),
    },
}));

describe('Storage Utilities', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('loadNotes', () => {
        it('should return empty array when no notes exist', async () => {
            vi.mocked(Preferences.get).mockResolvedValue({ value: null });

            const notes = await loadNotes();

            expect(notes).toEqual([]);
            expect(Preferences.get).toHaveBeenCalledWith({ key: 'memorable_notes' });
        });

        it('should load and return notes from storage', async () => {
            const mockNotes: (TextNote | AudioNote)[] = [
                {
                    id: '1',
                    type: 'text',
                    title: 'Test Note',
                    body: 'Test body',
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                },
                {
                    id: '2',
                    type: 'audio',
                    title: 'Audio Note',
                    audioPath: '/path/to/audio.m4a',
                    duration: 120,
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                },
            ];

            vi.mocked(Preferences.get).mockResolvedValue({
                value: JSON.stringify({ notes: mockNotes }),
            });

            const notes = await loadNotes();

            expect(notes).toEqual(mockNotes);
            expect(notes.length).toBe(2);
            expect(notes[0].type).toBe('text');
            expect(notes[1].type).toBe('audio');
        });

        it('should return empty array on parse error', async () => {
            vi.mocked(Preferences.get).mockResolvedValue({
                value: 'invalid json',
            });

            const notes = await loadNotes();

            expect(notes).toEqual([]);
        });
    });

    describe('saveNotes', () => {
        it('should save notes to storage', async () => {
            const mockNotes: (TextNote | AudioNote)[] = [
                {
                    id: '1',
                    type: 'text',
                    title: 'Test Note',
                    body: 'Test body',
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                },
            ];

            vi.mocked(Preferences.set).mockResolvedValue();

            await saveNotes(mockNotes);

            expect(Preferences.set).toHaveBeenCalledWith({
                key: 'memorable_notes',
                value: JSON.stringify({ notes: mockNotes }),
            });
        });

        it('should throw error on save failure', async () => {
            const mockNotes: TextNote[] = [
                {
                    id: '1',
                    type: 'text',
                    title: 'Test Note',
                    body: 'Test body',
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                },
            ];

            vi.mocked(Preferences.set).mockRejectedValue(new Error('Save failed'));

            await expect(saveNotes(mockNotes)).rejects.toThrow('Failed to save notes');
        });
    });

    describe('generateNoteId', () => {
        it('should generate unique IDs', () => {
            const id1 = generateNoteId();
            const id2 = generateNoteId();

            expect(id1).toBeTruthy();
            expect(id2).toBeTruthy();
            expect(id1).not.toBe(id2);
        });

        it('should generate IDs with timestamp', () => {
            const id = generateNoteId();
            const parts = id.split('-');

            expect(parts.length).toBeGreaterThan(1);
            expect(Number(parts[0])).toBeGreaterThan(0);
        });

        it('should generate IDs that are strings', () => {
            const id = generateNoteId();
            expect(typeof id).toBe('string');
            expect(id.length).toBeGreaterThan(0);
        });
    });

    describe('Edge Cases and Error Handling', () => {
        it('should handle corrupted storage data gracefully', async () => {
            vi.mocked(Preferences.get).mockResolvedValue({
                value: '{ invalid json }',
            });

            const notes = await loadNotes();
            expect(notes).toEqual([]);
        });

        it('should handle storage with missing notes array', async () => {
            vi.mocked(Preferences.get).mockResolvedValue({
                value: JSON.stringify({}),
            });

            const notes = await loadNotes();
            expect(notes).toEqual([]);
        });

        it('should handle storage with null notes', async () => {
            vi.mocked(Preferences.get).mockResolvedValue({
                value: JSON.stringify({ notes: null }),
            });

            const notes = await loadNotes();
            expect(notes).toEqual([]);
        });

        it('should handle storage with empty notes array', async () => {
            vi.mocked(Preferences.get).mockResolvedValue({
                value: JSON.stringify({ notes: [] }),
            });

            const notes = await loadNotes();
            expect(notes).toEqual([]);
        });

        it('should handle save with empty array', async () => {
            vi.mocked(Preferences.set).mockResolvedValue();

            await saveNotes([]);

            expect(Preferences.set).toHaveBeenCalledWith({
                key: 'memorable_notes',
                value: JSON.stringify({ notes: [] }),
            });
        });

        it('should handle save with large number of notes', async () => {
            const largeNotesArray: TextNote[] = Array.from({ length: 1000 }, (_, i) => ({
                id: `note-${i}`,
                type: 'text',
                title: `Note ${i}`,
                body: `Body ${i}`,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            }));

            vi.mocked(Preferences.set).mockResolvedValue();

            await saveNotes(largeNotesArray);

            expect(Preferences.set).toHaveBeenCalled();
            const callArgs = vi.mocked(Preferences.set).mock.calls[0][0];
            const savedData = JSON.parse(callArgs.value);
            expect(savedData.notes.length).toBe(1000);
        });

        it('should preserve all note fields when saving', async () => {
            const audioNote: AudioNote = {
                id: '1',
                type: 'audio',
                title: 'Audio Note',
                audioPath: '/path/to/audio.m4a',
                duration: 120,
                mimeType: 'audio/mp4',
                createdAt: 1000,
                updatedAt: 2000,
            };

            vi.mocked(Preferences.set).mockResolvedValue();

            await saveNotes([audioNote]);

            const callArgs = vi.mocked(Preferences.set).mock.calls[0][0];
            const savedData = JSON.parse(callArgs.value);
            expect(savedData.notes[0]).toEqual(audioNote);
            expect(savedData.notes[0].mimeType).toBe('audio/mp4');
            expect(savedData.notes[0].duration).toBe(120);
        });

        it('should handle network error on load', async () => {
            vi.mocked(Preferences.get).mockRejectedValue(new Error('Network error'));

            const notes = await loadNotes();
            expect(notes).toEqual([]);
        });

        it('should throw error with descriptive message on save failure', async () => {
            vi.mocked(Preferences.set).mockRejectedValue(new Error('Disk full'));

            await expect(saveNotes([])).rejects.toThrow('Failed to save notes');
        });
    });
});

