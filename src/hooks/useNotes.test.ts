/**
 * Tests for useNotes hook
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useNotes } from './useNotes';
import * as storage from '../lib/storage';
import { TextNote } from '../lib/types';

// Mock storage module
vi.mock('../lib/storage', () => ({
    loadNotes: vi.fn(),
    saveNotes: vi.fn(),
    generateNoteId: vi.fn(() => `test-id-${Date.now()}`),
}));

describe('useNotes', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(storage.loadNotes).mockResolvedValue([]);
    });

    it('should load notes on mount', async () => {
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

        vi.mocked(storage.loadNotes).mockResolvedValue(mockNotes);

        const { result } = renderHook(() => useNotes());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.notes).toEqual(mockNotes);
        expect(storage.loadNotes).toHaveBeenCalled();
    });

    it('should create text note', async () => {
        const { result } = renderHook(() => useNotes());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        vi.mocked(storage.saveNotes).mockResolvedValue();

        await act(async () => {
            await result.current.createTextNote('New Note', 'Note body');
        });

        expect(storage.saveNotes).toHaveBeenCalled();
        expect(result.current.notes.length).toBe(1);
        expect(result.current.notes[0].type).toBe('text');
        expect(result.current.notes[0].title).toBe('New Note');
    });

    it('should create audio note', async () => {
        const { result } = renderHook(() => useNotes());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        vi.mocked(storage.saveNotes).mockResolvedValue();

        await act(async () => {
            await result.current.createAudioNote('Audio Note', '/path/to/audio.m4a', 120);
        });

        expect(storage.saveNotes).toHaveBeenCalled();
        expect(result.current.notes.length).toBe(1);
        expect(result.current.notes[0].type).toBe('audio');
        expect(result.current.notes[0].title).toBe('Audio Note');
    });

    it('should search notes by title', async () => {
        const mockNotes: TextNote[] = [
            {
                id: '1',
                type: 'text',
                title: 'React Tutorial',
                body: 'Body',
                createdAt: Date.now(),
                updatedAt: Date.now(),
            },
            {
                id: '2',
                type: 'text',
                title: 'Vue Tutorial',
                body: 'Body',
                createdAt: Date.now(),
                updatedAt: Date.now(),
            },
        ];

        vi.mocked(storage.loadNotes).mockResolvedValue(mockNotes);

        const { result } = renderHook(() => useNotes());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        const filtered = result.current.searchNotes('React');

        expect(filtered.length).toBe(1);
        expect(filtered[0].title).toBe('React Tutorial');
    });

    it('should search notes by body content', async () => {
        const mockNotes: TextNote[] = [
            {
                id: '1',
                type: 'text',
                title: 'Note 1',
                body: 'This is about React',
                createdAt: Date.now(),
                updatedAt: Date.now(),
            },
            {
                id: '2',
                type: 'text',
                title: 'Note 2',
                body: 'This is about Vue',
                createdAt: Date.now(),
                updatedAt: Date.now(),
            },
        ];

        vi.mocked(storage.loadNotes).mockResolvedValue(mockNotes);

        const { result } = renderHook(() => useNotes());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        const filtered = result.current.searchNotes('React');

        expect(filtered.length).toBe(1);
        expect(filtered[0].id).toBe('1');
    });

    it('should delete note', async () => {
        const mockNotes: TextNote[] = [
            {
                id: '1',
                type: 'text',
                title: 'Note 1',
                body: 'Body 1',
                createdAt: Date.now(),
                updatedAt: Date.now(),
            },
            {
                id: '2',
                type: 'text',
                title: 'Note 2',
                body: 'Body 2',
                createdAt: Date.now(),
                updatedAt: Date.now(),
            },
        ];

        vi.mocked(storage.loadNotes).mockResolvedValue(mockNotes);
        vi.mocked(storage.saveNotes).mockResolvedValue();

        const { result } = renderHook(() => useNotes());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        await act(async () => {
            await result.current.deleteNote('1');
        });

        expect(result.current.notes.length).toBe(1);
        expect(result.current.notes[0].id).toBe('2');
    });
});

