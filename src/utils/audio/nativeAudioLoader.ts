/**
 * Native Audio loader utilities
 * Handles loading and managing NativeAudio for iOS/Android platforms
 */

import { MutableRefObject } from "react";
import { NativeAudio } from "@capacitor-community/native-audio";
import { Filesystem, Directory } from "@capacitor/filesystem";

export interface NativeAudioLoaderProps {
    audioSrc?: string; // Not used but kept for API consistency
    fileName?: string;
    assetIdRef: MutableRefObject<string | null>;
    completeListenerRef: MutableRefObject<{ remove: () => Promise<void> } | null>;
    setIsLoading: (loading: boolean) => void;
    setDuration: (duration: number) => void;
    initialDuration?: number;
    onError?: (error: string) => void;
    cleanup: () => Promise<void>;
}

/**
 * Loads audio using NativeAudio plugin for native platforms
 * Preloads audio and sets up completion listeners
 *
 * @param props - Configuration for native audio loading
 */
export async function loadNativeAudio({
    fileName,
    assetIdRef,
    completeListenerRef,
    setIsLoading,
    setDuration,
    initialDuration,
    onError,
    cleanup,
}: NativeAudioLoaderProps): Promise<void> {
    setIsLoading(true);

    // Cleanup previous audio first
    await cleanup();

    try {
        // Generate unique assetId
        const assetId = `audio-${Date.now()}-${Math.random()
            .toString(36)
            .substr(2, 9)}`;
        assetIdRef.current = assetId;

        // Native platform: get file:// URL
        if (!fileName) {
            throw new Error("fileName is required for native platforms");
        }

        const { uri } = await Filesystem.getUri({
            path: fileName,
            directory: Directory.Data,
        });

        // Preload audio
        await NativeAudio.preload({
            assetId,
            assetPath: uri,
            volume: 1.0,
            audioChannelNum: 1,
            isUrl: true,
        });

        // Get duration if not provided
        if (!initialDuration) {
            try {
                const durationResult = await NativeAudio.getDuration({ assetId });
                if (durationResult.duration > 0) {
                    setDuration(durationResult.duration);
                }
            } catch (durErr) {
                // Duration unavailable, use provided duration or 0
            }
        } else {
            setDuration(initialDuration);
        }

        // Listen for completion event
        completeListenerRef.current = await NativeAudio.addListener(
            "complete",
            (event) => {
                if (event.assetId === assetId) {
                    // Completion handled by progress tracking
                }
            }
        );

        setIsLoading(false);
    } catch (err) {
        const errorMsg =
            err instanceof Error ? err.message : "Failed to load audio";
        onError?.(errorMsg);
        setIsLoading(false);
        assetIdRef.current = null;
    }
}

