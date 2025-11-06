/**
 * Core audio player hook
 * Manages audio playback state and controls
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { Capacitor } from "@capacitor/core";
import { NativeAudio } from "@capacitor-community/native-audio";
import { loadHTML5Audio } from "../utils/audio/html5AudioLoader.js";
import { loadNativeAudio } from "../utils/audio/nativeAudioLoader.js";

export interface UseAudioPlayerProps {
    src: string;
    duration?: number;
    onError?: (error: string) => void;
    fileName?: string;
}

export interface UseAudioPlayerReturn {
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    isLoading: boolean;
    togglePlayPause: () => Promise<void>;
}

/**
 * Hook for managing audio playback
 * Handles both HTML5 audio (web) and NativeAudio (native platforms)
 *
 * @param props - Audio player configuration
 * @returns Audio player state and controls
 */
export function useAudioPlayer({
    src,
    duration: initialDuration,
    onError,
    fileName,
}: UseAudioPlayerProps): UseAudioPlayerReturn {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(initialDuration || 0);
    const [isLoading, setIsLoading] = useState(true);

    const assetIdRef = useRef<string | null>(null);
    const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const completeListenerRef = useRef<{ remove: () => Promise<void> } | null>(
        null
    );
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const html5CleanupRef = useRef<(() => void) | null>(null);
    const errorShownRef = useRef<boolean>(false);
    const isNative = Capacitor.isNativePlatform();
    const useHTML5ForWeb = !isNative;

    const cleanup = useCallback(async () => {
        // Stop progress tracking
        if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
        }

        // Remove complete listener
        if (completeListenerRef.current) {
            await completeListenerRef.current.remove().catch(() => { });
            completeListenerRef.current = null;
        }

        // Stop and unload NativeAudio
        if (assetIdRef.current) {
            try {
                await NativeAudio.stop({ assetId: assetIdRef.current }).catch(() => { });
                await NativeAudio.unload({ assetId: assetIdRef.current }).catch(() => { });
            } catch (err) {
                // Ignore cleanup errors
            }
            assetIdRef.current = null;
        }

        // Cleanup HTML5 audio
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = "";
            audioRef.current.load();
            audioRef.current = null;
        }

        if (html5CleanupRef.current) {
            html5CleanupRef.current();
            html5CleanupRef.current = null;
        }

        setIsPlaying(false);
        setCurrentTime(0);
        errorShownRef.current = false;
    }, []);

    const startProgressTracking = useCallback(() => {
        if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
        }

        progressIntervalRef.current = setInterval(async () => {
            if (assetIdRef.current) {
                try {
                    const result = await NativeAudio.getCurrentTime({
                        assetId: assetIdRef.current,
                    });
                    setCurrentTime(result.currentTime);

                    // Check if audio finished
                    if (result.currentTime >= duration && duration > 0) {
                        setIsPlaying(false);
                        setCurrentTime(0);
                        if (progressIntervalRef.current) {
                            clearInterval(progressIntervalRef.current);
                            progressIntervalRef.current = null;
                        }
                    }
                } catch (err) {
                    // Ignore errors getting current time
                }
            }
        }, 100); // Update every 100ms
    }, [duration]);

    // Load audio when src or fileName changes
    useEffect(() => {
        const loadAudio = async () => {
            if (useHTML5ForWeb) {
                loadHTML5Audio({
                    audioSrc: src,
                    audioRef,
                    html5CleanupRef,
                    setIsLoading,
                    setIsPlaying,
                    setCurrentTime,
                    setDuration,
                    initialDuration,
                    onError,
                    errorShownRef,
                });
            } else {
                await loadNativeAudio({
                    audioSrc: src,
                    fileName,
                    assetIdRef,
                    completeListenerRef,
                    setIsLoading,
                    setDuration,
                    initialDuration,
                    onError,
                    cleanup,
                });
            }
        };

        loadAudio();

        return () => {
            cleanup();
        };
    }, [src, fileName, useHTML5ForWeb, initialDuration, onError, cleanup]);

    // Handle completion for native audio
    useEffect(() => {
        if (!useHTML5ForWeb && completeListenerRef.current) {
            // Completion is handled by progress tracking
            return;
        }
    }, [useHTML5ForWeb]);

    const togglePlayPause = async () => {
        if (isLoading) return;

        // Handle HTML5 audio for web
        if (useHTML5ForWeb && audioRef.current) {
            try {
                if (isPlaying) {
                    audioRef.current.pause();
                } else {
                    await audioRef.current.play();
                }
            } catch (err) {
                const errorMsg =
                    err instanceof Error ? err.message : "Failed to play audio";
                onError?.(errorMsg);
            }
            return;
        }

        // Handle NativeAudio for native platforms
        if (!assetIdRef.current) return;

        try {
            if (isPlaying) {
                // Pause audio
                await NativeAudio.pause({ assetId: assetIdRef.current });
                setIsPlaying(false);
                if (progressIntervalRef.current) {
                    clearInterval(progressIntervalRef.current);
                    progressIntervalRef.current = null;
                }
            } else {
                // Check if audio is paused (use resume) or stopped (use play)
                const playingResult = await NativeAudio.isPlaying({
                    assetId: assetIdRef.current,
                });

                if (playingResult.isPlaying) {
                    // Already playing, just update state
                    setIsPlaying(true);
                    startProgressTracking();
                } else {
                    // Not playing - check if paused or stopped
                    // Try resume first (in case it was paused), then play if that fails
                    try {
                        await NativeAudio.resume({ assetId: assetIdRef.current });
                    } catch (resumeErr) {
                        // If resume fails, try play (audio might be stopped)
                        await NativeAudio.play({ assetId: assetIdRef.current });
                    }
                    setIsPlaying(true);
                    startProgressTracking();
                }
            }
        } catch (err) {
            const errorMsg =
                err instanceof Error ? err.message : "Failed to play audio";
            onError?.(errorMsg);
        }
    };

    return {
        isPlaying,
        currentTime,
        duration,
        isLoading,
        togglePlayPause,
    };
}

