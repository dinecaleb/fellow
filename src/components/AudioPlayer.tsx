/**
 * WhatsApp-style Audio Player Component
 * Simple, clean audio player with waveform visualization
 */

import { useState, useEffect, useRef } from "react";
import { Capacitor } from "@capacitor/core";
import { NativeAudio } from "@capacitor-community/native-audio";
import { Filesystem, Directory } from "@capacitor/filesystem";

interface AudioPlayerProps {
  src: string;
  duration?: number;
  onError?: (error: string) => void;
  platform?: "ios" | "android" | "web";
  fileName?: string;
}

export function AudioPlayer({
  src,
  duration: initialDuration,
  onError,
  platform,
  fileName,
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(initialDuration || 0);
  const [isLoading, setIsLoading] = useState(true);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const nativeAudioAssetIdRef = useRef<string | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const html5CleanupRef = useRef<(() => void) | null>(null);

  const isIOS =
    platform === "ios" ||
    (Capacitor.isNativePlatform() && Capacitor.getPlatform() === "ios");

  const isNativeAudioAvailable =
    NativeAudio &&
    typeof NativeAudio.preload === "function" &&
    typeof NativeAudio.play === "function";

  useEffect(() => {
    // Cleanup previous audio first
    cleanup();

    const initializeAudio = async () => {
      // Small delay to ensure cleanup completes
      await new Promise((resolve) => setTimeout(resolve, 50));

      if (isIOS && fileName && isNativeAudioAvailable) {
        try {
          await loadNativeAudio(fileName);
        } catch (err) {
          console.warn(
            "[AUDIOPLAYER] NativeAudio failed, using HTML5 fallback:",
            err
          );
          loadHTML5Audio(src);
        }
      } else {
        loadHTML5Audio(src);
      }
    };

    initializeAudio();

    return () => {
      cleanup();
    };
  }, [src, fileName, isIOS]);

  const cleanup = () => {
    if (nativeAudioAssetIdRef.current && isNativeAudioAvailable) {
      try {
        // Stop playback first
        NativeAudio.stop({ assetId: nativeAudioAssetIdRef.current }).catch(
          () => {}
        );
        // Small delay to ensure stop completes before unload
        setTimeout(() => {
          NativeAudio.unload({ assetId: nativeAudioAssetIdRef.current! }).catch(
            () => {}
          );
        }, 100);
      } catch (err) {
        // Ignore cleanup errors - plugin may have internal state issues
        console.warn("[AUDIOPLAYER] Cleanup warning:", err);
      }
      nativeAudioAssetIdRef.current = null;
    }

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

    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  const loadNativeAudio = async (filePath: string) => {
    setIsLoading(true);

    // Use a stable assetId based on file path to avoid conflicts
    // Clean up any previous asset first
    if (nativeAudioAssetIdRef.current) {
      try {
        await NativeAudio.unload({
          assetId: nativeAudioAssetIdRef.current,
        }).catch(() => {});
      } catch {
        // Ignore cleanup errors
      }
    }

    // Create assetId from file path (sanitized) to ensure consistency
    const assetId = `audio-${filePath.replace(/[^a-zA-Z0-9]/g, "-")}`;
    nativeAudioAssetIdRef.current = assetId;

    try {
      const { uri } = await Filesystem.getUri({
        path: filePath,
        directory: Directory.Data,
      });

      // Verify URI is valid
      if (!uri || typeof uri !== "string") {
        throw new Error("Invalid file URI");
      }

      await NativeAudio.preload({
        assetId,
        assetPath: uri,
        isUrl: true,
        volume: 1.0,
        audioChannelNum: 1,
      });

      setIsLoading(false);
      if (initialDuration) {
        setDuration(initialDuration);
      }
    } catch (err) {
      console.error("[AUDIOPLAYER] NativeAudio preload error:", err);
      // Fallback to HTML5 audio if NativeAudio fails
      nativeAudioAssetIdRef.current = null;
      throw err; // Re-throw to trigger fallback
    }
  };

  const loadHTML5Audio = (audioSrc: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current.load();
    }

    const audio = new Audio(audioSrc);
    audioRef.current = audio;
    audio.volume = 1.0;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    const handleError = (e: Event) => {
      setIsLoading(false);
      const audioEl = e.target as HTMLAudioElement;
      const errorMsg = audioEl.error
        ? `Audio error ${audioEl.error.code}`
        : "Failed to load audio";
      onError?.(errorMsg);
    };
    const handleLoadedData = () => {
      setIsLoading(false);
      if (!initialDuration && audio.duration) {
        setDuration(audio.duration);
      }
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("canplay", handleLoadedData);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    html5CleanupRef.current = () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("canplay", handleLoadedData);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  };

  const togglePlayPause = async () => {
    if (isIOS && nativeAudioAssetIdRef.current && isNativeAudioAvailable) {
      try {
        if (isPlaying) {
          await NativeAudio.stop({ assetId: nativeAudioAssetIdRef.current });
          setIsPlaying(false);
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
          }
        } else {
          await NativeAudio.play({ assetId: nativeAudioAssetIdRef.current });
          setIsPlaying(true);
          startProgressTimer();
        }
      } catch {
        onError?.("Failed to play audio");
      }
      return;
    }

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(() => {
          onError?.("Failed to play audio");
        });
      }
    }
  };

  const startProgressTimer = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    progressIntervalRef.current = setInterval(() => {
      setCurrentTime((prev) => {
        const newTime = prev + 0.1;
        if (newTime >= duration) {
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
          }
          setIsPlaying(false);
          setCurrentTime(0);
          return 0;
        }
        return newTime;
      });
    }, 100);
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
