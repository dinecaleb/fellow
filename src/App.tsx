import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home";
import { NoteView } from "./pages/NoteView";
import { NewNote } from "./pages/NewNote";
import { SplashScreen } from "./components/SplashScreen";
import { Capacitor } from "@capacitor/core";
import { VoiceRecorder } from "capacitor-voice-recorder";

function App() {
  const [showSplash, setShowSplash] = useState(true);

  // Add platform class to body for conditional styling
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      document.body.classList.add("is-native");
      document.body.classList.remove("is-web");
    } else {
      document.body.classList.add("is-web");
      document.body.classList.remove("is-native");
    }
  }, []);

  // Request microphone permission automatically when app loads
  useEffect(() => {
    const requestMicrophonePermission = async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          const canRecord = await VoiceRecorder.canDeviceVoiceRecord();
          if (!canRecord.value) {
            return; // Device doesn't support recording
          }
          const hasPermission =
            await VoiceRecorder.hasAudioRecordingPermission();
          if (!hasPermission.value) {
            // Request permission automatically
            await VoiceRecorder.requestAudioRecordingPermission();
          }
        } catch (err) {
          console.warn("Error requesting microphone permission:", err);
        }
      } else {
        // Web platform - request permission automatically
        try {
          if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            // Request permission by getting a media stream
            const stream = await navigator.mediaDevices.getUserMedia({
              audio: true,
            });
            // Immediately stop the stream - we just needed permission
            stream.getTracks().forEach((track) => track.stop());
          }
        } catch (err) {
          console.warn("Error requesting microphone permission:", err);
        }
      }
    };

    // Request permission after splash screen finishes
    if (!showSplash) {
      requestMicrophonePermission();
    }
  }, [showSplash]);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/note/:id" element={<NoteView />} />
        <Route path="/new/:type" element={<NewNote />} />
      </Routes>
    </div>
  );
}

export default App;
