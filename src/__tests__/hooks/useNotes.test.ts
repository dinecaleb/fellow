/**
 * Tests for useNotes hook
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useNotes } from '../../hooks/useNotes';
import { useStorage } from '../../hooks/useStorage';
import { TextNote } from '../../lib/types';

// Mock useStorage hook
vi.mock('../../hooks/useStorage', () => ({
    useStorage: vi.fn(),
}));

// Mock ID generation
vi.mock('../../utils/id', () => ({
    generateId: vi.fn(() => `test-id-${Date.now()}`),
    generateNoteId: vi.fn(() => `test-id-${Date.now()}`),
}));

describe('useNotes', () => {
    const mockLoadNotes = vi.fn();
    const mockSaveNotes = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useStorage).mockReturnValue({
            loadNotes: mockLoadNotes,
            saveNotes: mockSaveNotes,
        });
        mockLoadNotes.mockResolvedValue([]);
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

        mockLoadNotes.mockResolvedValue(mockNotes);

        const { result } = renderHook(() => useNotes());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.notes).toEqual(mockNotes);
        expect(mockLoadNotes).toHaveBeenCalled();
    });

    it('should create text note', async () => {
        const { result } = renderHook(() => useNotes());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        mockSaveNotes.mockResolvedValue(undefined);

        await act(async () => {
            await result.current.createTextNote('New Note', 'Note body');
        });

        expect(mockSaveNotes).toHaveBeenCalled();
        expect(result.current.notes.length).toBe(1);
        expect(result.current.notes[0].type).toBe('text');
        expect(result.current.notes[0].title).toBe('New Note');
    });

    it('should create audio note', async () => {
        const { result } = renderHook(() => useNotes());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        mockSaveNotes.mockResolvedValue(undefined);

        await act(async () => {
            await result.current.createAudioNote('Audio Note', '/path/to/audio.m4a', 120);
        });

        expect(mockSaveNotes).toHaveBeenCalled();
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

        mockLoadNotes.mockResolvedValue(mockNotes);

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

        mockLoadNotes.mockResolvedValue(mockNotes);

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

        mockLoadNotes.mockResolvedValue(mockNotes);
        mockSaveNotes.mockResolvedValue(undefined);

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

    it('should update note', async () => {
        const mockNotes: TextNote[] = [
            {
                id: '1',
                type: 'text',
                title: 'Original Title',
                body: 'Original body',
                createdAt: 1000,
                updatedAt: 1000,
            },
        ];

        mockLoadNotes.mockResolvedValue(mockNotes);
        mockSaveNotes.mockResolvedValue(undefined);

        const { result } = renderHook(() => useNotes());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        await act(async () => {
            await result.current.updateNote('1', {
                title: 'Updated Title',
                body: 'Updated body',
            });
        });

        expect(result.current.notes[0].title).toBe('Updated Title');
        expect((result.current.notes[0] as TextNote).body).toBe('Updated body');
        expect(result.current.notes[0].updatedAt).toBeGreaterThan(1000);
        expect(result.current.notes[0].createdAt).toBe(1000); // createdAt should not change
    });

    it('should handle update of non-existent note', async () => {
        mockLoadNotes.mockResolvedValue([]);
        mockSaveNotes.mockResolvedValue(undefined);

        const { result } = renderHook(() => useNotes());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        await act(async () => {
            await result.current.updateNote('non-existent', { title: 'New Title' });
        });

        expect(result.current.notes.length).toBe(0);
    });

    it('should handle empty title for text note', async () => {
        const { result } = renderHook(() => useNotes());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        mockSaveNotes.mockResolvedValue(undefined);

        await act(async () => {
            await result.current.createTextNote('   ', 'Body content');
        });

        expect(result.current.notes[0].title).toBe('Untitled');
        expect((result.current.notes[0] as TextNote).body).toBe('Body content');
    });

    it('should handle empty title for audio note', async () => {
        const { result } = renderHook(() => useNotes());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        mockSaveNotes.mockResolvedValue(undefined);

        await act(async () => {
            await result.current.createAudioNote('   ', '/path/to/audio.m4a', 120);
        });

        expect(result.current.notes[0].title).toBe('Untitled Audio');
    });

    it('should handle search with empty query', async () => {
        const mockNotes: TextNote[] = [
            {
                id: '1',
                type: 'text',
                title: 'Note 1',
                body: 'Body 1',
                createdAt: Date.now(),
                updatedAt: Date.now(),
            },
        ];

        mockLoadNotes.mockResolvedValue(mockNotes);

        const { result } = renderHook(() => useNotes());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        const filtered = result.current.searchNotes('');
        expect(filtered.length).toBe(1);

        const filteredWhitespace = result.current.searchNotes('   ');
        expect(filteredWhitespace.length).toBe(1);
    });

    it('should handle case-insensitive search', async () => {
        const mockNotes: TextNote[] = [
            {
                id: '1',
                type: 'text',
                title: 'React Tutorial',
                body: 'Body',
                createdAt: Date.now(),
                updatedAt: Date.now(),
            },
        ];

        mockLoadNotes.mockResolvedValue(mockNotes);

        const { result } = renderHook(() => useNotes());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.searchNotes('react').length).toBe(1);
        expect(result.current.searchNotes('REACT').length).toBe(1);
        expect(result.current.searchNotes('ReAcT').length).toBe(1);
    });

    it('should handle search in audio notes (title only)', async () => {
        const mockNotes = [
            {
                id: '1',
                type: 'audio' as const,
                title: 'Audio Recording',
                audioPath: '/path/to/audio.m4a',
                createdAt: Date.now(),
                updatedAt: Date.now(),
            },
        ];

        mockLoadNotes.mockResolvedValue(mockNotes);

        const { result } = renderHook(() => useNotes());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        const filtered = result.current.searchNotes('Recording');
        expect(filtered.length).toBe(1);
    });

    it('should handle storage load error', async () => {
        mockLoadNotes.mockRejectedValue(new Error('Storage error'));

        const { result } = renderHook(() => useNotes());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.error).toBe('Storage error');
        expect(result.current.notes).toEqual([]);
    });

    it('should handle storage save error on create', async () => {
        const { result } = renderHook(() => useNotes());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        mockSaveNotes.mockRejectedValue(new Error('Save failed'));

        await act(async () => {
            await expect(
                result.current.createTextNote('Test', 'Body')
            ).rejects.toThrow('Save failed');
        });

        expect(result.current.error).toBe('Save failed');
    });

    it('should handle storage save error on update', async () => {
        const mockNotes: TextNote[] = [
            {
                id: '1',
                type: 'text',
                title: 'Original',
                body: 'Body',
                createdAt: Date.now(),
                updatedAt: Date.now(),
            },
        ];

        mockLoadNotes.mockResolvedValue(mockNotes);
        mockSaveNotes.mockRejectedValue(new Error('Update failed'));

        const { result } = renderHook(() => useNotes());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        await act(async () => {
            await expect(
                result.current.updateNote('1', { title: 'Updated' })
            ).rejects.toThrow('Update failed');
        });

        expect(result.current.error).toBe('Update failed');
    });

    it('should handle storage save error on delete', async () => {
        const mockNotes: TextNote[] = [
            {
                id: '1',
                type: 'text',
                title: 'Note',
                body: 'Body',
                createdAt: Date.now(),
                updatedAt: Date.now(),
            },
        ];

        mockLoadNotes.mockResolvedValue(mockNotes);
        mockSaveNotes.mockRejectedValue(new Error('Delete failed'));

        const { result } = renderHook(() => useNotes());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        await act(async () => {
            await expect(result.current.deleteNote('1')).rejects.toThrow('Delete failed');
        });

        expect(result.current.error).toBe('Delete failed');
    });

    it('should preserve note type when updating', async () => {
        const mockNotes = [
            {
                id: '1',
                type: 'text' as const,
                title: 'Text Note',
                body: 'Body',
                createdAt: Date.now(),
                updatedAt: Date.now(),
            },
            {
                id: '2',
                type: 'audio' as const,
                title: 'Audio Note',
                audioPath: '/path/to/audio.m4a',
                createdAt: Date.now(),
                updatedAt: Date.now(),
            },
        ];

        mockLoadNotes.mockResolvedValue(mockNotes);
        mockSaveNotes.mockResolvedValue(undefined);

        const { result } = renderHook(() => useNotes());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        await act(async () => {
            await result.current.updateNote('1', { title: 'Updated Text' });
            await result.current.updateNote('2', { title: 'Updated Audio' });
        });

        expect(result.current.notes[0].type).toBe('text');
        expect(result.current.notes[1].type).toBe('audio');
    });

    it('should sort notes by updatedAt descending', async () => {
        const now = Date.now();
        const mockNotes: TextNote[] = [
            {
                id: '1',
                type: 'text',
                title: 'Old Note',
                body: 'Body',
                createdAt: now - 10000,
                updatedAt: now - 10000,
            },
            {
                id: '2',
                type: 'text',
                title: 'New Note',
                body: 'Body',
                createdAt: now - 5000,
                updatedAt: now,
            },
        ];

        mockLoadNotes.mockResolvedValue(mockNotes);

        const { result } = renderHook(() => useNotes());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.notes[0].id).toBe('2'); // Newest first
        expect(result.current.notes[1].id).toBe('1');
    });
});

