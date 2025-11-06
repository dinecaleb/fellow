/**
 * Tests for type definitions and type guards
 */

import { describe, it, expect } from 'vitest';
import { TextNote, AudioNote, Note } from '../../lib/types';

describe('Type Definitions', () => {
    describe('TextNote', () => {
        it('should have correct structure', () => {
            const note: TextNote = {
                id: '1',
                type: 'text',
                title: 'Test',
                body: 'Body',
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };

            expect(note.type).toBe('text');
            expect(note.body).toBeDefined();
            expect('audioPath' in note).toBe(false);
        });

        it('should allow empty body', () => {
            const note: TextNote = {
                id: '1',
                type: 'text',
                title: 'Test',
                body: '',
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };

            expect(note.body).toBe('');
        });
    });

    describe('AudioNote', () => {
        it('should have correct structure', () => {
            const note: AudioNote = {
                id: '1',
                type: 'audio',
                title: 'Audio',
                audioPath: '/path/to/audio.m4a',
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };

            expect(note.type).toBe('audio');
            expect(note.audioPath).toBeDefined();
            expect('body' in note).toBe(false);
        });

        it('should allow optional duration', () => {
            const noteWithoutDuration: AudioNote = {
                id: '1',
                type: 'audio',
                title: 'Audio',
                audioPath: '/path/to/audio.m4a',
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };

            expect(noteWithoutDuration.duration).toBeUndefined();

            const noteWithDuration: AudioNote = {
                id: '2',
                type: 'audio',
                title: 'Audio',
                audioPath: '/path/to/audio.m4a',
                duration: 120,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };

            expect(noteWithDuration.duration).toBe(120);
        });

        it('should allow optional mimeType', () => {
            const note: AudioNote = {
                id: '1',
                type: 'audio',
                title: 'Audio',
                audioPath: '/path/to/audio.m4a',
                mimeType: 'audio/mp4',
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };

            expect(note.mimeType).toBe('audio/mp4');
        });
    });

    describe('Note union type', () => {
        it('should accept TextNote', () => {
            const textNote: TextNote = {
                id: '1',
                type: 'text',
                title: 'Test',
                body: 'Body',
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };

            const note: Note = textNote;
            expect(note.type).toBe('text');
        });

        it('should accept AudioNote', () => {
            const audioNote: AudioNote = {
                id: '1',
                type: 'audio',
                title: 'Audio',
                audioPath: '/path/to/audio.m4a',
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };

            const note: Note = audioNote;
            expect(note.type).toBe('audio');
        });

        it('should have common BaseNote fields', () => {
            const textNote: Note = {
                id: '1',
                type: 'text',
                title: 'Test',
                body: 'Body',
                createdAt: 1000,
                updatedAt: 2000,
            };

            expect(textNote.id).toBe('1');
            expect(textNote.title).toBe('Test');
            expect(textNote.createdAt).toBe(1000);
            expect(textNote.updatedAt).toBe(2000);
        });
    });
});

