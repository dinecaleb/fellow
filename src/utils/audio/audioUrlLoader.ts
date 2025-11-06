/**
 * Audio URL loader utilities for recorder
 * Handles creating audio URLs from base64 data for playback preview
 */

import { Capacitor } from "@capacitor/core";

export interface AudioUrlLoaderOptions {
    base64: string;
    mimeType: string;
}

/**
 * Creates an audio URL from base64 data
 * Uses data URLs for iOS and blob URLs for other platforms
 *
 * @param options - Base64 data and MIME type
 * @returns Audio URL (data URL or blob URL)
 */
export function createAudioUrlFromBase64({
    base64,
    mimeType,
}: AudioUrlLoaderOptions): string {
    const cleanBase64 = base64.replace(/^\/+/, "").trim();

    // Convert audio/aac to audio/mp4 for iOS compatibility (M4A files are MP4 containers)
    let html5MimeType = mimeType;
    if (mimeType === "audio/aac" || mimeType.includes("aac")) {
        html5MimeType = "audio/mp4"; // M4A files are MP4 containers with AAC codec
    }

    // For iOS, use data URLs directly (more reliable than blob URLs in WebView)
    const isIOS = Capacitor.getPlatform() === "ios";
    if (isIOS) {
        const dataUrl = `data:${html5MimeType};base64,${cleanBase64}`;
        return dataUrl;
    }

    // For Android and web, try blob URL first, fallback to data URL
    try {
        // Convert base64 to binary
        const binaryString = atob(cleanBase64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        // Create Blob with correct MIME type
        const blob = new Blob([bytes], { type: html5MimeType });
        const blobUrl = URL.createObjectURL(blob);
        return blobUrl;
    } catch (blobErr) {
        console.error("[RECORDER] Error creating blob URL:", blobErr);
        // Fallback to data URL
        const dataUrl = `data:${html5MimeType};base64,${cleanBase64}`;
        return dataUrl;
    }
}

