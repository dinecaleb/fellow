# Contributing Guide

Thank you for your interest in contributing to Memo-rable! This guide will help you get started.

## Development Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd fellow
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

## Code Style

- We use **ESLint** and **Prettier** for code formatting
- Run `npm run lint` to check for linting errors
- Code is automatically formatted on save (if your editor is configured)
- Use TypeScript strict mode
- Follow React best practices (hooks, functional components)

## Project Structure

```
src/
├── components/          # React components
│   ├── audio/         # Audio player module (split into hooks/utils/UI)
│   ├── NoteCard.tsx   # Note preview card
│   └── Recorder.tsx   # Audio recording component
├── hooks/              # Custom React hooks
│   ├── useNotes.ts    # Note management
│   └── useRecorder.ts # Audio recording logic
├── pages/              # Page components
│   ├── Home.tsx       # Main list view
│   ├── NoteView.tsx   # Single note view
│   └── NewNote.tsx    # Create note page
├── lib/                # Core utilities
│   ├── types.ts       # TypeScript types
│   └── storage.ts     # Storage utilities
└── utils/              # Shared utilities
```

## Making Changes

1. **Create a branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**

   - Write clear, self-documenting code
   - Add JSDoc comments for public APIs
   - Keep functions small and focused
   - Split large files into smaller modules

3. **Test your changes**

   ```bash
   npm test              # Run tests
   npm run test:coverage # Check coverage
   ```

4. **Check linting**

   ```bash
   npm run lint
   ```

5. **Commit your changes**
   - Use clear, descriptive commit messages
   - Follow conventional commits format when possible

## Testing

- Write tests for new features
- Maintain or improve test coverage
- Test on multiple platforms (web, iOS, Android) when possible

## Code Review Process

1. Push your branch and create a pull request
2. Ensure all CI checks pass
3. Address review feedback
4. Once approved, your changes will be merged

## Architecture Guidelines

### Component Structure

- **Keep components small**: Split large components into smaller, focused ones
- **Separate concerns**: Split UI, logic, and utilities into separate files
- **Use hooks**: Extract reusable logic into custom hooks
- **Document public APIs**: Add JSDoc comments for exported functions/components

### File Organization

- Group related files in directories
- Use index files for clean imports when appropriate
- Keep test files next to source files (`.test.ts`, `.test.tsx`)

### Naming Conventions

- **Components**: PascalCase (e.g., `AudioPlayer`)
- **Hooks**: camelCase starting with `use` (e.g., `useAudioPlayer`)
- **Utilities**: camelCase (e.g., `formatTime`)
- **Types/Interfaces**: PascalCase (e.g., `AudioPlayerProps`)

## Questions?

If you have questions or need help, please open an issue or reach out to the maintainers.
