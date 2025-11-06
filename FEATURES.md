# Memo-rable Feature Checklist

## ✅ All Features Implemented

### 1. ✅ Create text notes (title + body)

- **Location**: `src/pages/NewNote.tsx`
- **Implementation**: Simple form with title input and body textarea
- **Storage**: Saves to Capacitor Preferences (offline-first)

### 2. ✅ Record and save audio memos (title + playback support)

- **Location**: `src/components/Recorder.tsx` + `src/hooks/useRecorder.ts`
- **Features**:
  - Record audio with title input
  - Pause/resume recording
  - Preview playback after recording
  - Save audio note with title and duration
- **Storage**: Audio files saved to Capacitor Filesystem, metadata in Preferences

### 3. ✅ List all notes (text + audio) in one view

- **Location**: `src/pages/Home.tsx`
- **Implementation**: Unified list showing both text and audio notes
- **Display**: NoteCard component shows type, title, preview, and timestamp

### 4. ✅ Search box filters notes locally

- **Location**: `src/pages/Home.tsx` + `src/hooks/useNotes.ts`
- **Implementation**: Client-side filtering by title and body (text notes only)
- **Performance**: Uses useMemo for efficient filtering

### 5. ✅ View a single note (text or audio)

- **Location**: `src/pages/NoteView.tsx`
- **Features**:
  - Display text note body
  - Play audio note with HTML5 audio controls
  - Edit title and body (text notes)
  - Delete note

### 6. ✅ Offline-first behavior

- **Storage**: Capacitor Preferences (JSON) for note metadata
- **Files**: Capacitor Filesystem for audio files
- **No network**: All data stored locally, no API calls required

### 7. ✅ Audio recording continues while device is locked

- **Configuration**:
  - `capacitor.config.ts`: `enableBackgroundRecording: true` in Media plugin
  - `ios/App/App/Info.plist`: `UIBackgroundModes` with `audio` key
- **Plugin**: `capacitor-voice-recorder` handles background recording on native platforms

## Architecture Summary

### Simple & Clean Design

- **No Redux**: React hooks + local state only
- **No Context**: Direct hook usage (no global state complexity)
- **Minimal dependencies**: Core React, Capacitor, Tailwind CSS
- **Clear separation**: Hooks for logic, Components for UI, Pages for routes

### Key Files

- `src/hooks/useNotes.ts` - Note CRUD operations
- `src/hooks/useRecorder.ts` - Audio recording logic
- `src/lib/storage.ts` - Storage abstraction (Preferences)
- `src/lib/types.ts` - TypeScript types
- `src/pages/` - 3 main pages (Home, NewNote, NoteView)
- `src/components/` - Reusable components (NoteCard, Recorder)

### Interview Talking Points

1. **Offline-first**: All data stored locally, no backend required
2. **Cross-platform**: Same codebase for iOS, Android, and Web
3. **Simple state management**: Hooks pattern, easy to understand
4. **Type safety**: Full TypeScript coverage
5. **Clean architecture**: Separation of concerns (hooks/components/pages)
6. **Background recording**: Native plugin handles device lock scenarios
