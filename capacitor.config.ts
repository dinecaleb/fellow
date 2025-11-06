import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.memorable.app',
  appName: 'Memo-rable',
  webDir: 'dist',
  // Live reload configuration - uncomment to enable live reload
  // Run: npm run live:ios or npm run live:android
  server: {
    url: 'http://192.168.2.133:5173',
    cleartext: true,
    androidScheme: 'https',
  },
  plugins: {
    Media: {
      enableBackgroundRecording: true,
    },
  },
};

export default config;
