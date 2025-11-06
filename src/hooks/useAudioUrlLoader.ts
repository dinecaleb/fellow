/**
 * Hook for loading audio URLs from Capacitor filesystem
 * Handles platform-specific audio loading (iOS, Android, Web)
 */

import { useState, useCallback } from "react";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Capacitor } from "@capacitor/core";

export interface UseAudioUrlLoaderReturn {
    audioUrl: string | null;
    audioError: string | null;
    loadAudioUrl: (fileName: string, mimeType?: string) => Promise<void>;
}

/**
 * Hook for loading audio files from Capacitor filesystem
 * Returns a data URL or blob URL depending on platform
 */
export function useAudioUrlLoader(): UseAudioUrlLoaderReturn {
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [audioError, setAudioError] = useState<string | null>(null);

    const loadAudioUrl = useCallback(
        async (fileName: string, mimeTypeFromNote?: string) => {
            try {
                setAudioError(null);

                if (Capacitor.isNativePlatform()) {
                    // Native: Read file and create data URL
                    const result = await Filesystem.readFile({
                        path: fileName,
                        directory: Directory.Data,
                    });

                    // Get base64 data
                    let base64Data = typeof result.data === "string" ? result.data : "";
                    if (base64Data.includes(",")) {
                        base64Data = base64Data.split(",")[1];
                    }

                    // Clean and validate base64
                    base64Data = base64Data.replace(/^\/+/, "").trim();
                    if (!/^[A-Za-z0-9+/]*={0,2}$/.test(base64Data)) {
                        throw new Error("Invalid base64 audio data");
                    }

                    // Determine MIME type
                    const mimeType = determineMimeType(fileName, mimeTypeFromNote);

                    // iOS: use data URLs directly (more reliable in WebView)
                    const isIOS = Capacitor.getPlatform() === "ios";
                    if (isIOS) {
                        setAudioUrl(`data:${mimeType};base64,${base64Data}`);
                    } else {
                        // Android: try blob URL, fallback to data URL
                        try {
                            const blob = createBlobFromBase64(base64Data, mimeType);
                            setAudioUrl(URL.createObjectURL(blob));
                        } catch {
                            setAudioUrl(`data:${mimeType};base64,${base64Data}`);
                        }
                    }
                } else {
                    // Web platform
                    const result = await Filesystem.readFile({
                        path: fileName,
                        directory: Directory.Data,
                    });

                    if (result.data instanceof Blob) {
                        setAudioUrl(URL.createObjectURL(result.data));
                    } else {
                        const base64Data =
                            typeof result.data === "string" ? result.data : "";
                        const cleanBase64 = base64Data.includes(",")
                            ? base64Data.split(",")[1]
                            : base64Data;
                        const mimeType = determineMimeType(fileName);
                        setAudioUrl(`data:${mimeType};base64,${cleanBase64}`);
                    }
                }
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : String(err);
                setAudioError(`Failed to load audio file: ${errorMessage}`);
                setAudioUrl(null);
            }
        },
        []
    );

    return { audioUrl, audioError, loadAudioUrl };
}

/**
 * Determines MIME type from filename or provided MIME type
 */
function determineMimeType(
    fileName: string,
    mimeTypeFromNote?: string
): string {
    if (mimeTypeFromNote) {
        // Convert plugin MIME types to HTML5-compatible types
        if (
            mimeTypeFromNote === "audio/aac" ||
            mimeTypeFromNote.includes("aac") ||
            fileName.endsWith(".m4a")
        ) {
            return "audio/mp4";
        }
        if (mimeTypeFromNote.includes("webm")) return "audio/webm";
        if (mimeTypeFromNote.includes("ogg")) return "audio/ogg";
        return mimeTypeFromNote;
    }

    // Fallback: guess from filename
    if (fileName.endsWith(".m4a") || fileName.endsWith(".mp4"))
        return "audio/mp4";
    if (fileName.endsWith(".webm")) return "audio/webm";
    if (fileName.endsWith(".ogg")) return "audio/ogg";
    return "audio/mp4";
}

/**
 * Creates a Blob from base64 string
 */
function createBlobFromBase64(base64Data: string, mimeType: string): Blob {
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return new Blob([bytes], { type: mimeType });
}

