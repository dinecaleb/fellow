/**
 * Splash Screen Component
 * Shows a branded loading screen when the app first loads
 */

import { useEffect, useState } from "react";

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
            <svg
              className="w-16 h-16 text-indigo-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
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
