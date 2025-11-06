# Architecture Documentation

This document describes the architecture and design decisions of Memo-rable.

## Overview

Memo-rable is a mobile-first note-taking application built with:

- **React 18** with TypeScript
- **Capacitor 5** for cross-platform mobile support
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Vitest** for testing

## Architecture Principles

1. **Modular Design**: Large components are split into smaller, focused modules
2. **Separation of Concerns**: UI, business logic, and utilities are separated
3. **Centralized Organization**: Hooks, utilities, and tests are in central locations
4. **Platform Agnostic**: Core logic works across web, iOS, and Android
5. **Type Safety**: TypeScript strict mode ensures type safety
6. **Testability**: Code is structured to be easily testable

## Project Structure

```
src/
├── __tests__/              # All tests centralized
│   ├── setup.ts            # Test setup and mocks
│   ├── hooks/              # Hook tests
│   ├── lib/                # Library tests
│   └── utils/              # Utility tests
├── components/             # React UI components only
│   ├── audio/
│   │   └── AudioPlayerUI.tsx
│   ├── recorder/
│   │   ├── AudioPreview.tsx
│   │   └── RecordingControls.tsx
│   ├── AudioPlayer.tsx     # Main audio player component
│   ├── Recorder.tsx        # Main recorder component
│   ├── NoteCard.tsx
│   └── SplashScreen.tsx
├── hooks/                  # All custom React hooks centralized
│   ├── useAudioPlayer.ts   # Audio playback logic
│   ├── useNotes.ts         # Note management (CRUD, search)
│   ├── useRecorder.ts      # Audio recording functionality
│   └── useStorage.ts       # Storage operations hook
├── pages/                  # Page components (routes)
│   ├── Home.tsx            # Main list view with search
│   ├── NoteView.tsx        # Single note view/editor
│   └── NewNote.tsx         # Create new note (text or audio)
├── lib/                    # Core type definitions
│   └── types.ts            # TypeScript type definitions
└── utils/                  # All utilities centralized
    ├── id.ts               # ID generation utilities
    └── audio/              # Audio-related utilities
        ├── audioUtils.ts           # Formatting, waveform generation
        ├── audioUrlLoader.ts      # Audio URL creation from base64
        ├── formatUtils.ts         # Duration formatting
        ├── html5AudioLoader.ts    # Web platform audio loading
        └── nativeAudioLoader.ts   # Native platform audio loading
```

## Component Architecture

### Audio Player Module

The audio player follows a modular architecture:

```
components/
├── AudioPlayer.tsx              # Main component (orchestration)
└── audio/
    └── AudioPlayerUI.tsx        # UI component (presentation)

hooks/
└── useAudioPlayer.ts            # Core playback logic hook

utils/audio/
├── html5AudioLoader.ts         # Web platform audio loading
├── nativeAudioLoader.ts        # Native platform audio loading
└── audioUtils.ts               # Formatting, waveform utilities
```

**Benefits:**

- Easy to test each piece independently
- Clear separation between UI and logic
- Platform-specific code is isolated
- Reusable utilities
- Centralized hooks and utils

### Recorder Module

The recorder component is similarly modular:

```
components/
├── Recorder.tsx                 # Main component (orchestration)
└── recorder/
    ├── AudioPreview.tsx         # Audio preview component
    └── RecordingControls.tsx     # Recording controls UI

hooks/
└── useRecorder.ts               # Recording logic hook

utils/audio/
├── audioUrlLoader.ts           # Audio URL creation
└── formatUtils.ts              # Duration formatting
```

### Note Management

Notes are managed through hooks:

- **`useStorage`**: Provides storage operations (`loadNotes`, `saveNotes`)
- **`useNotes`**: Provides CRUD operations and search functionality

The hooks abstract away storage details, making it easy to swap storage backends in the future.

## State Management

Currently using React hooks and local state. No global state management library is used because:

- The app is relatively small
- State is mostly local to components
- No complex state synchronization needed

**Future considerations:**

- If the app grows, consider Zustand or Jotai for global state
- React Query for server-side state (if adding API)

## Storage Strategy

### Current: Capacitor Preferences via `useStorage` Hook

- Storage operations are provided through a React hook (`useStorage`)
- Simple key-value storage with JSON serialization
- Works across all platforms
- Suitable for small to medium datasets

**Implementation:**

- `useStorage` hook provides `loadNotes()` and `saveNotes()` functions
- Uses Capacitor Preferences API under the hood
- Functions are memoized with `useCallback` for stable references

### Future Considerations

- **SQLite**: For better performance with large datasets
- **IndexedDB**: For web platform with large storage needs
- **Cloud Sync**: Firebase/iCloud for cross-device sync

## Platform Handling

### Audio Recording

- **Native (iOS/Android)**: Uses `capacitor-voice-recorder` plugin
- **Web**: Falls back to MediaRecorder API

Platform detection is done via `Capacitor.isNativePlatform()`.

### Audio Playback

- **Native**: Uses `@capacitor-community/native-audio` plugin
- **Web**: Uses HTML5 Audio API

The audio player module abstracts platform differences through:

- `useAudioPlayer` hook for playback logic
- Platform-specific loaders (`html5AudioLoader`, `nativeAudioLoader`)

## Code Organization Principles

### Centralization

1. **Hooks**: All custom hooks in `src/hooks/`
2. **Utils**: All utility functions in `src/utils/`
3. **Tests**: All tests in `src/__tests__/` organized by feature area

### Component Structure

1. **Single Responsibility**: Each module/function has one clear purpose
2. **DRY (Don't Repeat Yourself)**: Extract common logic into utilities
3. **Composition over Inheritance**: Use composition and hooks
4. **Explicit over Implicit**: Clear naming and documentation
5. **Small Functions**: Functions should be small and focused

### File Naming

- **Components**: PascalCase (e.g., `AudioPlayer.tsx`)
- **Hooks**: camelCase starting with `use` (e.g., `useAudioPlayer.ts`)
- **Utilities**: camelCase (e.g., `audioUtils.ts`)
- **Types/Interfaces**: PascalCase (e.g., `AudioPlayerProps`)

## Testing Strategy

- **Unit Tests**: Test utilities and hooks in isolation
- **Component Tests**: Test component rendering and interactions
- **Integration Tests**: Test feature workflows

**Test Organization:**

- All tests in `src/__tests__/` directory
- Tests organized by feature area (hooks, lib, utils)
- Test setup file: `src/__tests__/setup.ts`

**Test Coverage:**

- Storage hook (`useStorage`)
- Notes hook (`useNotes`)
- ID generation utilities
- Type definitions

## Performance Considerations

- **Code Splitting**: Vite automatically splits code by route
- **Lazy Loading**: Consider lazy loading for large components
- **Memoization**: Use `useMemo` and `useCallback` appropriately
- **Virtual Lists**: Consider for large note lists (future)

## Security

- All data is stored locally (no server-side concerns currently)
- Input validation on user inputs
- Sanitize file paths and names
- Handle permissions properly (microphone, storage)

## Development Workflow

### Adding a New Feature

1. **Create hook** (if needed) in `src/hooks/`
2. **Create utilities** (if needed) in `src/utils/`
3. **Create component** in `src/components/`
4. **Add tests** in `src/__tests__/`
5. **Update documentation**

### Code Quality

- **Linting**: ESLint with TypeScript rules
- **Formatting**: Prettier (run `npm run format`)
- **Type Checking**: TypeScript strict mode
- **Testing**: Vitest with React Testing Library

## Future Enhancements

See `README.md` for planned features. Architecture should support:

- Cloud sync
- Rich text editing
- Audio transcription
- Note sharing
- Categories/tags
