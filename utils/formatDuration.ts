// utils/formatDuration.ts

/**
 * Formats a duration in seconds to a time string in the format "MM:SS"
 * @param seconds - The number of seconds to format
 * @returns A string in the format "MM:SS" with leading zeros
 */
export default function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  