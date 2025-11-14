/**
 * Splash Screen Component
 * Shows a branded loading screen when the app first loads
 */

import { useEffect, useState } from "react";
import { DocumentIcon } from "./icons";

interface SplashScreenProps {
  onFinish: () => void;
}

export function SplashScreen({ onFinish }: SplashScreenProps) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Show splash for at least 1.5 seconds, then fade out
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => {
        onFinish();
      }, 300); // Fade out duration
    }, 1500);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center transition-opacity duration-300 z-50 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="text-center px-6 max-w-md mx-auto">
        {/* App Icon */}
        <div className="mb-6 flex justify-center">
          <div className="w-24 h-24 bg-white rounded-2xl shadow-2xl flex items-center justify-center transform hover:scale-105 transition-transform">
            <DocumentIcon className="w-16 h-16 text-indigo-600" />
          </div>
        </div>

        {/* App Name */}
        <h1 className="text-4xl font-bold text-white mb-3">Memo-rable</h1>
        <p className="text-indigo-100 text-base leading-relaxed">
          The note-taking application you didn't know you needed
        </p>

        {/* Loading Indicator */}
        <div className="mt-8 flex justify-center">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    </div>
  );
}
