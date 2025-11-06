# Memo-rable

A minimal but clean note-taking app for mobile and web.

Memo-rable is a mobile-first Capacitor application built with React, TypeScript, and Vite. It supports both text notes and audio memos, with offline-first behavior and full search capabilities.

## Features

- **Text Notes**: Create and edit text notes with titles and bodies
- **Audio Memos**: Record and save audio memos with titles and playback support
- **Unified List View**: View all notes (text + audio) in one chronological list
- **Search**: Client-side filtering by title or body content
- **Offline-First**: All data stored locally using Capacitor Preferences
- **Background Recording**: Audio recording continues when device is locked (native platforms)
- **Cross-Platform**: Works on iOS, Android, and Web

## Tech Stack

- **Framework**: React 18 with TypeScript (strict mode)
- **Build Tool**: Vite
- **Mobile Wrapper**: Capacitor 5
- **UI**: Tailwind CSS (mobile-friendly defaults)
- **State Management**: React Hooks + Context (no Redux)
- **Storage**: Capacitor Preferences API (JSON-based local persistence)
- **Audio Recording**: `capacitor-voice-recorder` for native platforms, MediaRecorder API for web
- **Navigation**: React Router v6
- **Testing**: Vitest + React Testing Library
- **Linting**: ESLint + Prettier

## Project Structure

```
src/
├── components/          # React components
│   ├── NoteCard.tsx    # Note preview card for list view
│   └── Recorder.tsx    # Audio recording component
├── hooks/              # Custom React hooks
│   ├── useNotes.ts     # Note management (CRUD, search)
│   └── useRecorder.ts  # Audio recording functionality
├── pages/              # Page components
│   ├── Home.tsx        # Main list view with search
│   ├── NoteView.tsx    # Single note view/editor
│   └── NewNote.tsx     # Create new note (text or audio)
├── lib/                # Core utilities
│   ├── types.ts        # TypeScript type definitions
│   └── storage.ts      # Local storage persistence
├── App.tsx             # Main app with routing
└── main.tsx            # Entry point
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- For mobile development:
  - **iOS**: Xcode 14+ with iOS 13+ SDK
  - **Android**: Android Studio with Android SDK 22+

### Installation

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

3. Build for production:

```bash
npm run build
```

### Mobile Development

#### iOS

1. Build and sync with Capacitor:

```bash
npm run cap:ios
```

This will:

- Build the web app
- Sync to iOS project
- Open Xcode

2. In Xcode, select your target device/simulator and run the app.

3. For live reload during development:

```bash
# Get your local IP address
npm run ip

# Update capacitor.config.ts with the IP
# Then run:
npm run dev:ios
```

#### Android

1. Build and sync with Capacitor:

```bash
npm run cap:android
```

This will:

- Build the web app
- Sync to Android project
- Open Android Studio

2. In Android Studio, select your target device/emulator and run the app.

## Testing

Run tests:

```bash
npm test
```

Run tests with UI:

```bash
npm run test:ui
```

Run tests with coverage:

```bash
npm run test:coverage
```

### Test Coverage

The project includes basic Vitest tests for:

- Storage utilities (load/save notes, generate IDs)
- useNotes hook (create, search, delete operations)

## Architecture & Trade-offs

### Storage Strategy

**Current**: Capacitor Preferences API (key-value storage with JSON serialization)

**Pros**:

- Simple API
- Works across all platforms
- No additional dependencies

**Cons**:

- Limited query capabilities
- All notes loaded into memory
- Performance may degrade with very large datasets (1000+ notes)

**Future Considerations**:

- Migrate to SQLite for better performance with large datasets
- Add pagination for note lists
- Implement incremental loading

### Audio Recording

**Native Platforms** (iOS/Android):

- Uses `capacitor-voice-recorder` plugin
- Supports background recording
- Audio saved as M4A files

**Web Platform**:

- Falls back to MediaRecorder API
- Limited browser support
- Audio saved as WebM/MP4 files

**Trade-offs**:

- Different audio formats across platforms
- Web platform has limited background recording support
- File paths differ between native and web

### State Management

**Current**: React Hooks + Context (no Redux)

**Rationale**:

- Simpler for small to medium apps
- Less boilerplate
- Easier to understand and maintain
- No external dependencies

**Future Considerations**:

- If app grows, consider Zustand or Jotai for global state
- Add React Query for async state management if adding API calls

### UI Framework

**Current**: Tailwind CSS (no Ionic React components)

**Rationale**:

- More flexible styling
- Smaller bundle size
- Better performance
- Easier to customize

**Note**: Ionic React was considered but has dependency conflicts with React Router v6. The app uses mobile-friendly Tailwind utilities and safe area insets for iOS.

## Development Tips

### Audio File Paths

Audio files are stored in Capacitor's Data directory:

- **Native**: `file://` URLs pointing to app's data directory
- **Web**: Data URLs (base64 encoded)

When loading audio for playback, the app handles both formats automatically.

### Background Recording

Background recording is enabled via Capacitor config:

- iOS: Requires `UIBackgroundModes` with `audio` in `Info.plist` (handled by plugin)
- Android: Handled by the voice recorder plugin

### Safe Area Support

The app includes safe area utilities for iOS devices with notches:

- `.pt-safe` - Top safe area padding
- `.pb-safe` - Bottom safe area padding
- Defined in `src/index.css`

## Known Limitations

1. **Audio Format**: Different formats on different platforms (M4A on native, WebM/MP4 on web)
2. **iOS Audio Playback**: Uses `@capacitor-community/native-audio` plugin for reliable playback on iOS. HTML5 audio has limitations on iOS Safari WebView, so native audio is used instead.
3. **Search**: Currently only searches text notes (not audio note titles)
4. **No pagination**: All notes loaded at once (fine for small datasets)
5. **Large Datasets**: All notes loaded into memory (may be slow with 1000+ notes)
6. **No Cloud Sync**: All data is local-only
7. **No Rich Text**: Text notes are plain text only
8. **Web Audio**: Limited browser support for MediaRecorder API

## Future Enhancements

- [ ] Note editing (currently only text notes can be edited after creation)
- [ ] Note categories/tags
- [ ] Export notes (JSON, PDF, etc.)
- [ ] Cloud sync (Firebase, iCloud, etc.)
- [ ] Rich text editing for text notes
- [ ] Audio transcription for voice memos
- [ ] Dark mode
- [ ] Note sharing
- [ ] SQLite migration for better performance
- [ ] Pagination for large note lists

## License

MIT
