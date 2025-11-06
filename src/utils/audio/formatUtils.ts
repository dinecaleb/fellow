/**
 * Formatting utilities for recorder
 */

/**
 * Formats seconds into MM:SS format
 *
 * @param seconds - Time in seconds
 * @returns Formatted time string (e.g., "1:23")
 */
export function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
}

