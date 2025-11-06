/**
 * WhatsApp-style Audio Player Component
 * Simple, clean audio player with waveform visualization
 * Uses @capacitor-community/native-audio for reliable cross-platform playback
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { Capacitor } from "@capacitor/core";
import { NativeAudio } from "@capacitor-community/native-audio";
import { Filesystem, Directory } from "@capacitor/filesystem";

interface AudioPlayerProps {
  src: string;
  duration?: number;
  onError?: (error: string) => void;
  fileName?: string;
}

export function AudioPlayer({
  src,
  duration: initialDuration,
  onError,
  fileName,
}: AudioPlayerProps) {
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
  const useHTML5ForWeb = !isNative; // Use HTML5 audio for web platform

  const cleanup = useCallback(async () => {
    // Stop progress tracking
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

    // Remove complete listener
    if (completeListenerRef.current) {
      await completeListenerRef.current.remove().catch(() => {});
      completeListenerRef.current = null;
    }

    // Stop and unload NativeAudio
    if (assetIdRef.current) {
      try {
        await NativeAudio.stop({ assetId: assetIdRef.current }).catch(() => {});
        await NativeAudio.unload({ assetId: assetIdRef.current }).catch(
          () => {}
        );
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

  const loadHTML5Audio = useCallback(
    (audioSrc: string) => {
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
    },
    [initialDuration, onError]
  );

  const loadNativeAudio = useCallback(
    async (audioSrc: string, filePath?: string) => {
      setIsLoading(true);

      // Cleanup previous audio first
      await cleanup();

      // Use HTML5 audio for web platform
      if (useHTML5ForWeb) {
        loadHTML5Audio(audioSrc);
        return;
      }

      try {
        // Generate unique assetId
        const assetId = `audio-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`;
        assetIdRef.current = assetId;

        // Native platform: get file:// URL
        if (!filePath) {
          throw new Error("fileName is required for native platforms");
        }

        const { uri } = await Filesystem.getUri({
          path: filePath,
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
              setIsPlaying(false);
              setCurrentTime(0);
              if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
                progressIntervalRef.current = null;
              }
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
    },
    [useHTML5ForWeb, initialDuration, onError, cleanup, loadHTML5Audio]
  );

  useEffect(() => {
    // Load audio when src or fileName changes
    loadNativeAudio(src, fileName);

    return () => {
      cleanup();
    };
  }, [src, fileName, loadNativeAudio, cleanup]);

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

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Generate waveform bars (fixed number for all audio)
  const generateWaveform = () => {
    const heights = [
      20, 35, 25, 40, 30, 45, 35, 50, 40, 45, 35, 40, 30, 35, 25, 30, 20, 25,
      15, 20, 25, 30, 35, 40, 45, 50, 45, 40, 35, 30,
    ];
    return heights;
  };

  const waveformHeights = generateWaveform();
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const filledBars = Math.floor((progress / 100) * waveformHeights.length);

  return (
    <div className="flex items-center gap-2  py-3 w-full min-w-0 overflow-hidden">
      {/* Play Button */}
      <button
        onClick={togglePlayPause}
        disabled={isLoading}
        className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 flex-shrink-0"
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : isPlaying ? (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          <svg
            className="w-5 h-5 ml-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </button>

      {/* Waveform */}
      <div className=" flex-1 flex items-center gap-1 h-8 min-w-0 overflow-hidden">
        {waveformHeights.map((height, index) => {
          const isFilled = index < filledBars;
          return (
            <div
              key={index}
              className={`w-1 rounded-full transition-colors flex-shrink-0 ${
                isFilled ? "bg-indigo-600" : "bg-gray-300"
              }`}
              style={{ height: `${height}%` }}
            />
          );
        })}
      </div>

      {/* Time Display */}
      <div className="text-sm font-bold text-gray-600 flex-shrink-0 min-w-[3rem] text-right">
        {formatTime(duration)}
      </div>
    </div>
  );
}
