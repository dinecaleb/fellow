/**
 * HTML5 Audio loader utilities
 * Handles loading and managing HTML5 audio elements for web platform
 */

import { MutableRefObject } from "react";

export interface HTML5AudioLoaderProps {
    audioSrc: string;
    audioRef: MutableRefObject<HTMLAudioElement | null>;
    html5CleanupRef: MutableRefObject<(() => void) | null>;
    setIsLoading: (loading: boolean) => void;
    setIsPlaying: (playing: boolean) => void;
    setCurrentTime: (time: number) => void;
    setDuration: (duration: number) => void;
    initialDuration?: number;
    onError?: (error: string) => void;
    errorShownRef: MutableRefObject<boolean>;
}

/**
 * Loads and configures an HTML5 audio element
 * Sets up event listeners for playback control and progress tracking
 *
 * @param props - Configuration for HTML5 audio loading
 */
export function loadHTML5Audio({
    audioSrc,
    audioRef,
    html5CleanupRef,
    setIsLoading,
    setIsPlaying,
    setCurrentTime,
    setDuration,
    initialDuration,
    onError,
    errorShownRef,
}: HTML5AudioLoaderProps): void {
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current.load();
    }

    setIsLoading(true);
    const audio = new Audio(audioSrc);
    audioRef.current = audio;
    audio.volume = 1.0;
    audio.preload = "auto";

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => {
        if (audio.duration && isFinite(audio.duration)) {
            setDuration(audio.duration);
        }
        setIsLoading(false);
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
    };
    const handleError = (e: Event) => {
        const audioEl = e.target as HTMLAudioElement;
        const error = audioEl.error;

        // Completely suppress error code 4 (MEDIA_ERR_SRC_NOT_SUPPORTED)
        // Browsers often fire this falsely when audio actually works
        if (error?.code === 4) {
            setIsLoading(false);
            return;
        }

        // Don't show error if audio is actually playable
        if (audioEl.readyState >= 2 || audioEl.duration > 0) {
            setIsLoading(false);
            return;
        }

        // Don't show error if we've already shown one for this audio
        if (errorShownRef.current) {
            setIsLoading(false);
            return;
        }

        setIsLoading(false);
        let errorMsg = "Failed to load audio";

        if (error) {
            const errorMessages: { [key: number]: string } = {
                1: "MEDIA_ERR_ABORTED - The user aborted the audio",
                2: "MEDIA_ERR_NETWORK - A network error occurred",
                3: "MEDIA_ERR_DECODE - The audio is corrupted or not supported",
            };
            errorMsg =
                errorMessages[error.code] ||
                `Audio error ${error.code}: ${error.message || "Unknown error"}`;
        }

        // Only show error if it's a real problem
        errorShownRef.current = true;
        onError?.(errorMsg);
    };
    const handleLoadedData = () => {
        setIsLoading(false);
        errorShownRef.current = false; // Reset error flag on successful load
        if (!initialDuration && audio.duration && isFinite(audio.duration)) {
            setDuration(audio.duration);
        }
    };
    const handleCanPlay = () => {
        setIsLoading(false);
        errorShownRef.current = false; // Reset error flag on successful load
        if (!initialDuration && audio.duration && isFinite(audio.duration)) {
            setDuration(audio.duration);
        }
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("loadeddata", handleLoadedData);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    html5CleanupRef.current = () => {
        audio.removeEventListener("timeupdate", updateTime);
        audio.removeEventListener("loadedmetadata", updateDuration);
        audio.removeEventListener("canplay", handleCanPlay);
        audio.removeEventListener("loadeddata", handleLoadedData);
        audio.removeEventListener("play", handlePlay);
        audio.removeEventListener("pause", handlePause);
        audio.removeEventListener("ended", handleEnded);
        audio.removeEventListener("error", handleError);
    };
}

