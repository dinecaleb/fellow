/**
 * Tests for ID generation utilities
 */

import { describe, it, expect } from 'vitest';
import { generateId, generateNoteId } from '../../utils/id';

describe('ID Generation Utilities', () => {
    describe('generateId', () => {
        it('should generate unique IDs', () => {
            const id1 = generateId();
            const id2 = generateId();

            expect(id1).toBeTruthy();
            expect(id2).toBeTruthy();
            expect(id1).not.toBe(id2);
        });

        it('should generate IDs with timestamp', () => {
            const id = generateId();
            const parts = id.split('-');

            expect(parts.length).toBeGreaterThan(1);
            expect(Number(parts[0])).toBeGreaterThan(0);
        });

        it('should generate IDs that are strings', () => {
            const id = generateId();
            expect(typeof id).toBe('string');
            expect(id.length).toBeGreaterThan(0);
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

        it('should be an alias for generateId', () => {
            const id1 = generateId();
            const id2 = generateNoteId();

            // Both should have same format
            expect(id1.split('-').length).toBe(id2.split('-').length);
            expect(typeof id1).toBe(typeof id2);
        });
    });
});

