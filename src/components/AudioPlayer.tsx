/**
 * WhatsApp-style Audio Player Component
 * Uses NativeAudio plugin on iOS for reliable playback
 * Falls back to HTML5 audio on web/Android
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

  // Check if NativeAudio plugin is available
  const isNativeAudioAvailable =
    NativeAudio &&
    typeof NativeAudio.preload === "function" &&
    typeof NativeAudio.play === "function";

  useEffect(() => {
    const initializeAudio = async () => {
      // Try NativeAudio on iOS if available, otherwise use HTML5
      if (isIOS && fileName && isNativeAudioAvailable) {
        try {
          await loadNativeAudio(fileName);
        } catch (err) {
          console.warn("[AUDIOPLAYER] NativeAudio failed, using HTML5:", err);
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
    // Cleanup native audio
    if (nativeAudioAssetIdRef.current && isNativeAudioAvailable) {
      try {
        NativeAudio.stop({ assetId: nativeAudioAssetIdRef.current }).catch(
          () => {}
        );
        NativeAudio.unload({ assetId: nativeAudioAssetIdRef.current }).catch(
          () => {}
        );
      } catch (err) {
        // Ignore cleanup errors
      }
      nativeAudioAssetIdRef.current = null;
    }

    // Cleanup HTML5 audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current.load();
      audioRef.current = null;
    }

    // Cleanup HTML5 event listeners
    if (html5CleanupRef.current) {
      html5CleanupRef.current();
      html5CleanupRef.current = null;
    }

    // Clear progress interval
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  const loadNativeAudio = async (filePath: string) => {
    setIsLoading(true);

    const assetId = `audio-${Date.now()}`;
    nativeAudioAssetIdRef.current = assetId;

    const { uri } = await Filesystem.getUri({
      path: filePath,
      directory: Directory.Data,
    });

    // Preload with maximum volume (1.0)
    await NativeAudio.preload({
      assetId,
      assetPath: uri,
      isUrl: true,
      volume: 1.0, // Maximum volume
      audioChannelNum: 1,
    });

    setIsLoading(false);
    if (initialDuration) {
      setDuration(initialDuration);
    }
  };

  const loadHTML5Audio = (audioSrc: string) => {
    // Cleanup previous instance
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current.load();
    }

    const audio = new Audio(audioSrc);
    audioRef.current = audio;
    audio.volume = 1.0; // Maximum volume

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

    // Store cleanup function
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
    // Native audio playback
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
      } catch (err) {
        console.error("[AUDIOPLAYER] Native audio error:", err);
        onError?.("Failed to play audio");
      }
      return;
    }

    // HTML5 audio playback
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch((err) => {
          console.error("[AUDIOPLAYER] Play error:", err);
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

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;

    setCurrentTime(newTime);

    // Only seek HTML5 audio (NativeAudio doesn't support seeking)
    if (audioRef.current && !isIOS) {
      audioRef.current.currentTime = newTime;
    }
  };

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex items-center gap-3 bg-indigo-50 rounded-lg p-3 w-full">
      <button
        onClick={togglePlayPause}
        disabled={isLoading}
        className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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

      <div className="flex-1 flex flex-col gap-1">
        <div
          className="relative h-2 bg-indigo-200 rounded-full cursor-pointer"
          onClick={handleSeek}
        >
          <div
            className="absolute top-0 left-0 h-full bg-indigo-600 rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-indigo-600 rounded-full shadow-md transition-all duration-100"
            style={{ left: `calc(${progress}% - 8px)` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-600">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
}
