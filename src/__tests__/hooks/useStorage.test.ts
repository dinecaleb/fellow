/**
 * Tests for useStorage hook
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { Preferences } from '@capacitor/preferences';
import { useStorage } from '../../hooks/useStorage';
import { TextNote, AudioNote } from '../../lib/types';

// Mock Capacitor Preferences
vi.mock('@capacitor/preferences', () => ({
    Preferences: {
        get: vi.fn(),
        set: vi.fn(),
    },
}));

describe('useStorage Hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('loadNotes', () => {
        it('should return empty array when no notes exist', async () => {
            vi.mocked(Preferences.get).mockResolvedValue({ value: null });

            const { result } = renderHook(() => useStorage());

            await waitFor(async () => {
                const notes = await result.current.loadNotes();
                expect(notes).toEqual([]);
                expect(Preferences.get).toHaveBeenCalledWith({ key: 'memorable_notes' });
            });
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

            const { result } = renderHook(() => useStorage());

            await waitFor(async () => {
                const notes = await result.current.loadNotes();
                expect(notes).toEqual(mockNotes);
                expect(notes.length).toBe(2);
                expect(notes[0].type).toBe('text');
                expect(notes[1].type).toBe('audio');
            });
        });

        it('should return empty array on parse error', async () => {
            vi.mocked(Preferences.get).mockResolvedValue({
                value: 'invalid json',
            });

            const { result } = renderHook(() => useStorage());

            await waitFor(async () => {
                const notes = await result.current.loadNotes();
                expect(notes).toEqual([]);
            });
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

            const { result } = renderHook(() => useStorage());

            await result.current.saveNotes(mockNotes);

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

            const { result } = renderHook(() => useStorage());

            await expect(result.current.saveNotes(mockNotes)).rejects.toThrow('Failed to save notes');
        });
    });
});

