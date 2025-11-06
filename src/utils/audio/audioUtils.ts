/**
 * Audio utility functions
 * Helper functions for audio formatting and waveform generation
 */

/**
 * Formats seconds into MM:SS format
 *
 * @param seconds - Time in seconds
 * @returns Formatted time string (e.g., "1:23")
 */
export function formatTime(seconds: number): string {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Generates waveform bar heights for visualization
 * Returns a fixed array of heights representing audio waveform
 *
 * @returns Array of bar heights (percentages)
 */
export function generateWaveform(): number[] {
    const heights = [
        20, 35, 25, 40, 30, 45, 35, 50, 40, 45, 35, 40, 30, 35, 25, 30, 20, 25,
        15, 20, 25, 30, 35, 40, 45, 50, 45, 40, 35, 30,
    ];
    return heights;
}

/**
 * Calculates progress percentage based on current time and duration
 *
 * @param currentTime - Current playback time in seconds
 * @param duration - Total duration in seconds
 * @returns Progress percentage (0-100)
 */
export function calculateProgress(
    currentTime: number,
    duration: number
): number {
    return duration > 0 ? (currentTime / duration) * 100 : 0;
}

/**
 * Calculates number of filled waveform bars based on progress
 *
 * @param progress - Progress percentage (0-100)
 * @param totalBars - Total number of waveform bars
 * @returns Number of bars that should be filled
 */
export function calculateFilledBars(
    progress: number,
    totalBars: number
): number {
    return Math.floor((progress / 100) * totalBars);
}

