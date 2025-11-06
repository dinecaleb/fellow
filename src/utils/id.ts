/**
 * Utility functions for generating unique IDs
 */

/**
 * Generates a unique ID using timestamp and random string
 * Format: {timestamp}-{random}
 *
 * @returns Unique ID string
 * @example
 * ```ts
 * const id = generateId(); // "1701234567890-abc123xyz"
 * ```
 */
export function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generates a unique note ID
 * Alias for generateId() for backward compatibility
 *
 * @returns Unique note ID string
 */
export function generateNoteId(): string {
    return generateId();
}

