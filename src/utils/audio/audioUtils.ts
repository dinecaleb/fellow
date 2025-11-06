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
 * Creates a simple wave pattern using sine function
 *
 * @param numBars - Number of bars to generate (default: 30)
 * @returns Array of bar heights (percentages)
 */
export function generateWaveform(numBars: number = 30): number[] {
    const heights: number[] = [];
    const minHeight = 30; // Smallest bar height (%)
    const maxHeight = 80; // Largest bar height (%)
    const waveCycles = 8; // How many complete waves across all bars

    for (let i = 0; i < numBars; i++) {
        // Calculate position along the wave (0 to 2π * waveCycles)
        const position = (i / numBars) * Math.PI * 2 * waveCycles;

        // Get sine value (-1 to 1)
        const sineValue = Math.sin(position);

        // Convert sine value (-1 to 1) to height (minHeight to maxHeight)
        // sineValue of -1 becomes minHeight, sineValue of 1 becomes maxHeight
        const height = minHeight + ((sineValue + 1) / 2) * (maxHeight - minHeight);

        heights.push(Math.round(height));
    }

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

