# Naturalisation Test Civique

A React Native / Expo mobile app for preparing the French citizenship test (test civique de naturalisation).

## Features

- Browse questions by category (history, geography, culture, etc.)
- Civic exam simulation -- practice mode and full naturalization mode (40 questions, 45 min)
- Flash card study mode with flip animation
- Advanced search with filters, suggestions, and history
- Progress tracking with detailed statistics
- Customizable themes, icons, and text formatting
- Offline-capable with Firebase integration and local caching
- Cross-platform: iOS, Android, and Web

## Tech Stack

- React Native 0.81 / Expo 54
- TypeScript
- React Navigation (bottom tabs + stack)
- Firebase (Storage)
- AsyncStorage for local persistence

## Getting Started

### Prerequisites

- Node.js v20+
- npm or yarn
- Expo CLI

### Install and Run

```bash
npm install

cp .env.example .env   # then fill in Firebase credentials

npm start              # or: npx expo start
```

Platform-specific:

```bash
npm run android
npm run ios
npm run web
```

### Firebase Setup

1. Create a Firebase project with Storage enabled.
2. Copy your config values from the Firebase Console into `.env`.

## Testing

```bash
npm test               # run all tests
npm run test:watch     # watch mode
npm run test:coverage  # with coverage report
```

## Project Structure

```
src/
+-- config/          # Firebase and icon configuration
+-- navigation/      # AppNavigator, tabs, stacks
+-- shared/          # Reusable components, contexts, hooks, services, utils
+-- welcome/         # Home and category screens
+-- search/          # Search feature
+-- test_civic/      # Civic exam feature
+-- flashcard/       # Flash card feature
+-- settings/        # Settings screens
+-- theme/           # Color theme definitions
+-- types/           # TypeScript type definitions
+-- data/            # Static question data (JSON) and knowledge base
```

See [docs/project-architecture.md](docs/project-architecture.md) for the full architecture reference.


## License

Private -- all rights reserved.
