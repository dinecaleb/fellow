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
    });
});

