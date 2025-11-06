/**
 * Hook for audio recording functionality
 * Uses capacitor-voice-recorder plugin following official documentation
 */

import { useState, useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { VoiceRecorder } from 'capacitor-voice-recorder';
import { Filesystem, Directory } from '@capacitor/filesystem';

interface UseRecorderReturn {
    isRecording: boolean;
    isPaused: boolean;
    duration: number;
    error: string | null;
    recordingFileName: string | null; // Store just the filename, not full path
    recordingMimeType: string | null; // MIME type from recording
    recordingBase64: string | null; // Base64 data from recording (for immediate playback)
    startRecording: () => Promise<void>;
    stopRecording: () => Promise<{ fileName: string; duration: number; mimeType: string; base64: string } | null>;
    pauseRecording: () => Promise<void>;
    resumeRecording: () => Promise<void>;
    requestPermission: () => Promise<boolean>;
    hasPermission: boolean | null;
}

export function useRecorder(): UseRecorderReturn {
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [duration, setDuration] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [recordingFileName, setRecordingFileName] = useState<string | null>(null);
    const [recordingMimeType, setRecordingMimeType] = useState<string | null>(null);
    const [recordingBase64, setRecordingBase64] = useState<string | null>(null);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const recordingStartTimeRef = useRef<number | null>(null);
    const pauseStartTimeRef = useRef<number | null>(null);
    const totalPausedTimeRef = useRef<number>(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    // Check permission on mount
    useEffect(() => {
        checkPermission();
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
            }
        };
    }, []);

    const checkPermission = async () => {
        if (Capacitor.isNativePlatform()) {
            try {
                const canRecord = await VoiceRecorder.canDeviceVoiceRecord();
                if (!canRecord.value) {
                    setHasPermission(false);
                    return;
                }
                const hasPermission = await VoiceRecorder.hasAudioRecordingPermission();
                setHasPermission(hasPermission.value);
            } catch (err) {
                console.error('Error checking permission:', err);
                setHasPermission(false);
            }
        } else {
            // Web platform
            try {
                if (navigator.permissions && navigator.permissions.query) {
                    const result = await navigator.permissions.query({
                        name: 'microphone' as PermissionName,
                    });
                    setHasPermission(result.state === 'granted');
                } else {
                    // Fallback
                    try {
                        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                        stream.getTracks().forEach((track) => track.stop());
                        setHasPermission(true);
                    } catch {
                        setHasPermission(false);
                    }
                }
            } catch {
                setHasPermission(null);
            }
        }
    };

    const requestPermission = async (): Promise<boolean> => {
        try {
            if (Capacitor.isNativePlatform()) {
                const result = await VoiceRecorder.requestAudioRecordingPermission();
                const granted = result.value === true;
                setHasPermission(granted);
                return granted;
            } else {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                stream.getTracks().forEach((track) => track.stop());
                setHasPermission(true);
                return true;
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Permission denied');
            setHasPermission(false);
            return false;
        }
    };

    const startRecording = async (): Promise<void> => {
        try {
            // Prevent multiple starts
            if (isRecording) {
                console.warn('Recording already in progress');
                return;
            }

            setError(null);
            setDuration(0);
            setRecordingFileName(null);
            recordingStartTimeRef.current = Date.now();
            pauseStartTimeRef.current = null;
            totalPausedTimeRef.current = 0;
            chunksRef.current = [];

            if (Capacitor.isNativePlatform()) {
                // Native: Check device and permissions
                const canRecord = await VoiceRecorder.canDeviceVoiceRecord();
                if (!canRecord.value) {
                    throw new Error('This device cannot record audio');
                }

                const hasPermission = await VoiceRecorder.hasAudioRecordingPermission();
                if (!hasPermission.value) {
                    const permission = await VoiceRecorder.requestAudioRecordingPermission();
                    if (!permission.value) {
                        throw new Error('Microphone permission denied');
                    }
                    setHasPermission(true);
                }

                // Try to start recording - handle ALREADY_RECORDING error
                try {
                    const result = await VoiceRecorder.startRecording();
                    if (!result.value) {
                        throw new Error('Failed to start recording');
                    }
                } catch (startErr) {
                    // If ALREADY_RECORDING error, try to stop and restart
                    const error = startErr as { errorMessage?: string; message?: string };
                    if (error?.errorMessage === 'ALREADY_RECORDING' || error?.message === 'ALREADY_RECORDING') {
                        console.warn('Recording already in progress, attempting to stop and restart...');
                        try {
                            await VoiceRecorder.stopRecording();
                            // Wait a bit before retrying
                            await new Promise(resolve => setTimeout(resolve, 100));
                            const result = await VoiceRecorder.startRecording();
                            if (!result.value) {
                                throw new Error('Failed to start recording after recovery');
                            }
                        } catch (recoveryErr) {
                            throw new Error('Unable to start recording. Please try stopping any existing recording first.');
                        }
                    } else {
                        throw startErr;
                    }
                }

                setIsRecording(true);
                setIsPaused(false);

                // Start timer
                timerRef.current = setInterval(() => {
                    if (recordingStartTimeRef.current) {
                        let elapsed = Date.now() - recordingStartTimeRef.current - totalPausedTimeRef.current;
                        if (pauseStartTimeRef.current) {
                            elapsed -= (Date.now() - pauseStartTimeRef.current);
                        }
                        setDuration(Math.max(0, Math.floor(elapsed / 1000)));
                    }
                }, 100);
            } else {
                // Web: Use MediaRecorder
                if (!navigator.mediaDevices?.getUserMedia) {
                    throw new Error('MediaRecorder API not available');
                }

                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                streamRef.current = stream;

                const mimeType = MediaRecorder.isTypeSupported('audio/webm')
                    ? 'audio/webm'
                    : MediaRecorder.isTypeSupported('audio/mp4')
                        ? 'audio/mp4'
                        : 'audio/ogg';

                const mediaRecorder = new MediaRecorder(stream, { mimeType });
                mediaRecorderRef.current = mediaRecorder;
                chunksRef.current = [];

                mediaRecorder.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        chunksRef.current.push(event.data);
                    }
                };

                mediaRecorder.start();
                setIsRecording(true);
                setIsPaused(false);

                // Start timer
                timerRef.current = setInterval(() => {
                    if (recordingStartTimeRef.current) {
                        let elapsed = Date.now() - recordingStartTimeRef.current - totalPausedTimeRef.current;
                        if (pauseStartTimeRef.current) {
                            elapsed -= (Date.now() - pauseStartTimeRef.current);
                        }
                        setDuration(Math.max(0, Math.floor(elapsed / 1000)));
                    }
                }, 100);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to start recording';
            setError(errorMessage);

            // Cleanup on error
            setIsRecording(false);
            setIsPaused(false);

            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }

            // Try to stop any ongoing recording on native (in case plugin is in bad state)
            if (Capacitor.isNativePlatform()) {
                try {
                    await VoiceRecorder.stopRecording().catch(() => {
                        // Ignore errors when stopping - it might not be recording
                    });
                } catch {
                    // Ignore
                }
            }
        }
    };

    const stopRecording = async (): Promise<{ fileName: string; duration: number; mimeType: string; base64: string } | null> => {
        try {
            // Prevent stopping if not recording
            if (!isRecording) {
                console.warn('No recording in progress');
                return null;
            }

            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }

            const finalDuration = duration;

            if (Capacitor.isNativePlatform()) {
                // Native: Stop and save
                // Set state first to prevent race conditions
                setIsRecording(false);
                setIsPaused(false);

                try {
                    console.log('[RECORDER] Stopping native recording...');
                    const result = await VoiceRecorder.stopRecording();
                    console.log('[RECORDER] Stop result:', result);

                    if (result.value?.recordDataBase64) {
                        // Save to filesystem - store just the filename
                        const mimeType = result.value.mimeType || 'audio/aac';
                        const ext = mimeType.includes('aac') ? 'm4a' : mimeType.includes('webm') ? 'webm' : mimeType.includes('mp4') ? 'm4a' : 'm4a';
                        const fileName = `recording-${Date.now()}.${ext}`;
                        const base64Length = result.value.recordDataBase64.length;
                        console.log('[RECORDER] Saving native file:', fileName, 'MIME type:', mimeType, 'Base64 length:', base64Length);

                        const writeResult = await Filesystem.writeFile({
                            path: fileName,
                            data: result.value.recordDataBase64,
                            directory: Directory.Data,
                        });
                        console.log('[RECORDER] Native file saved:', writeResult.uri);

                        // Verify file was saved
                        try {
                            const stat = await Filesystem.stat({
                                path: fileName,
                                directory: Directory.Data,
                            });
                            console.log('[RECORDER] Native file verified, size:', stat.size, 'bytes');
                        } catch (statErr) {
                            console.error('[RECORDER] Native file verification failed:', statErr);
                        }

                        setRecordingFileName(fileName);
                        setRecordingMimeType(mimeType);
                        // Store base64 for immediate playback (per plugin documentation)
                        const cleanBase64 = result.value.recordDataBase64.replace(/^\/+/, "").trim();
                        setRecordingBase64(cleanBase64);
                        return { fileName, duration: finalDuration, mimeType, base64: cleanBase64 };
                    } else {
                        console.warn('[RECORDER] No recording data returned from stopRecording');
                        // No data returned, but recording was stopped
                        return null;
                    }
                } catch (stopErr) {
                    // If stopping fails, still reset state
                    console.error('[RECORDER] Error stopping recording:', stopErr);
                    setError(`Failed to stop recording: ${stopErr instanceof Error ? stopErr.message : 'Unknown error'}`);
                    return null;
                }
            } else {
                // Web: Stop MediaRecorder and save
                if (!mediaRecorderRef.current) {
                    setIsRecording(false);
                    setIsPaused(false);
                    return null;
                }

                // Wait for MediaRecorder to finish
                const recordingResult = await new Promise<{ fileName: string; mimeType: string; base64: string }>((resolve, reject) => {
                    if (!mediaRecorderRef.current) {
                        reject(new Error('MediaRecorder not available'));
                        return;
                    }

                    const mediaRecorder = mediaRecorderRef.current;
                    const mimeType = mediaRecorder.mimeType || 'audio/webm';
                    const ext = mimeType.includes('webm') ? 'webm' : mimeType.includes('mp4') ? 'mp4' : 'ogg';

                    mediaRecorder.onstop = async () => {
                        try {
                            console.log('[RECORDER] MediaRecorder stopped, chunks:', chunksRef.current.length);
                            const blob = new Blob(chunksRef.current, { type: mimeType });
                            console.log('[RECORDER] Blob created, size:', blob.size, 'bytes');
                            const base64 = await blobToBase64(blob);
                            const fileName = `recording-${Date.now()}.${ext}`;
                            console.log('[RECORDER] Saving web file:', fileName, 'Base64 length:', base64.length);

                            const writeResult = await Filesystem.writeFile({
                                path: fileName,
                                data: base64,
                                directory: Directory.Data,
                            });
                            console.log('[RECORDER] Web file saved:', writeResult.uri);

                            // Verify file was saved
                            try {
                                const stat = await Filesystem.stat({
                                    path: fileName,
                                    directory: Directory.Data,
                                });
                                console.log('[RECORDER] Web file verified, size:', stat.size, 'bytes');
                            } catch (statErr) {
                                console.error('[RECORDER] Web file verification failed:', statErr);
                            }

                            // Clean base64 for playback (remove data URL prefix if present)
                            const cleanBase64 = base64.includes(",") ? base64.split(",")[1] : base64;
                            resolve({ fileName, mimeType, base64: cleanBase64.replace(/^\/+/, "").trim() });
                        } catch (err) {
                            console.error('[RECORDER] Error saving web recording:', err);
                            reject(err);
                        }
                    };

                    if (mediaRecorder.state !== 'inactive') {
                        mediaRecorder.stop();
                    } else {
                        // Already stopped, create file from existing chunks
                        const blob = new Blob(chunksRef.current, { type: mimeType });
                        blobToBase64(blob).then((base64) => {
                            const fileName = `recording-${Date.now()}.${ext}`;
                            const cleanBase64 = base64.includes(",") ? base64.split(",")[1] : base64;
                            Filesystem.writeFile({
                                path: fileName,
                                data: base64,
                                directory: Directory.Data,
                            }).then(() => resolve({ fileName, mimeType, base64: cleanBase64.replace(/^\/+/, "").trim() })).catch(reject);
                        }).catch(reject);
                    }
                });

                // Stop stream
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach((track) => track.stop());
                    streamRef.current = null;
                }

                setIsRecording(false);
                setIsPaused(false);
                setRecordingFileName(recordingResult.fileName);
                setRecordingMimeType(recordingResult.mimeType);
                setRecordingBase64(recordingResult.base64);
                return { fileName: recordingResult.fileName, duration: finalDuration, mimeType: recordingResult.mimeType, base64: recordingResult.base64 };
            }

            return null;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to stop recording';
            setError(errorMessage);
            return null;
        }
    };

    const pauseRecording = async (): Promise<void> => {
        try {
            if (!isRecording || isPaused) {
                return;
            }

            if (Capacitor.isNativePlatform()) {
                await VoiceRecorder.pauseRecording();
                setIsPaused(true);
                pauseStartTimeRef.current = Date.now();
            } else {
                if (mediaRecorderRef.current?.state === 'recording') {
                    mediaRecorderRef.current.pause();
                    setIsPaused(true);
                    pauseStartTimeRef.current = Date.now();
                }
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to pause recording');
        }
    };

    const resumeRecording = async (): Promise<void> => {
        try {
            if (!isRecording || !isPaused) {
                return;
            }

            if (Capacitor.isNativePlatform()) {
                await VoiceRecorder.resumeRecording();
                setIsPaused(false);
                if (pauseStartTimeRef.current) {
                    totalPausedTimeRef.current += Date.now() - pauseStartTimeRef.current;
                    pauseStartTimeRef.current = null;
                }
            } else {
                if (mediaRecorderRef.current?.state === 'paused') {
                    mediaRecorderRef.current.resume();
                    setIsPaused(false);
                    if (pauseStartTimeRef.current) {
                        totalPausedTimeRef.current += Date.now() - pauseStartTimeRef.current;
                        pauseStartTimeRef.current = null;
                    }
                }
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to resume recording');
        }
    };

    // Helper: Convert blob to base64
    const blobToBase64 = (blob: Blob): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                // Remove data URL prefix
                const base64Data = base64.split(',')[1] || base64;
                resolve(base64Data);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };

    return {
        isRecording,
        isPaused,
        duration,
        error,
        recordingFileName,
        recordingMimeType,
        recordingBase64,
        startRecording,
        stopRecording,
        pauseRecording,
        resumeRecording,
        requestPermission,
        hasPermission,
    };
}
