# French Nationality Questions App

A comprehensive React Native mobile application built with Expo for studying French citizenship questions. The app features customizable themes, interactive testing functionality, flash card study mode, advanced search capabilities, and detailed progress tracking.

## 📱 Overview

This is a cross-platform mobile application that helps users prepare for French nationality/citizenship tests. It provides:
- **Interactive question practice** with category-based browsing
- **Advanced search functionality** with filters and suggestions
- **Civic exam simulation** with practice and naturalization modes
- **Flash card study mode** for active learning
- **Progress tracking** and detailed analytics
- **Customizable themes** and display settings
- **Offline-capable** with Firebase integration and local caching
- **Responsive design** for mobile and web platforms

## 🏗️ Project Architecture

### Core Structure
```
French_nationality_questions/
├── App.tsx                   # Main application entry point
├── index.ts                  # Expo root component registration
├── package.json              # Dependencies and scripts
├── app.json                  # Expo configuration
├── tsconfig.json             # TypeScript configuration
└── src/                      # Main source code
    ├── config/               # Configuration files
    │   ├── firebaseConfig.ts # Firebase configuration
    │   └── iconConfig.ts     # Icon theme configuration
    ├── navigation/           # Navigation configuration
    │   ├── AppNavigator.tsx  # Main navigation container
    │   ├── AppTabs.tsx       # Bottom tab navigator
    │   └── HomeStack.tsx     # Home stack navigator
    ├── shared/               # Shared utilities and components
    │   ├── components/       # Reusable UI components
    │   ├── contexts/         # React Context providers
    │   ├── hooks/            # Custom React hooks
    │   ├── providers/       # Context provider composition
    │   ├── services/        # Data and service layer
    │   ├── types/           # Shared type definitions
    │   └── utils/           # Utility functions
    ├── welcome/              # Home and category screens
    ├── search/               # Search functionality
    ├── test_civic/           # Civic exam feature
    ├── flashcard/            # Flash card feature
    ├── settings/             # Settings screens
    ├── theme/                # Theme definitions
    ├── types/                # TypeScript type definitions
    └── data/                 # Static data and JSON files
```

## 📋 File Relationships & Dependencies

### 1. Entry Point & Configuration
- **`index.ts`**: Expo root component registration, imports `App.tsx`
- **`App.tsx`**: Main application wrapper with:
  - Font loading (Kalam, PatrickHand, DancingScript)
  - SafeAreaProvider and GestureHandlerRootView setup
  - AppProviders wrapper
  - AppNavigator integration
- **`app.json`**: Expo configuration for iOS, Android, and web builds
- **`package.json`**: Dependencies, scripts, and project metadata

### 2. Navigation System (`src/navigation/`)
- **`AppNavigator.tsx`**: Main navigation container with NavigationContainer
- **`AppTabs.tsx`**: Bottom tab navigator with 5 tabs:
  - Home (Accueil)
  - Search (Rechercher)
  - Civic Exam (Examen Civique)
  - Flash Cards (Cartes Flash)
  - Settings (Paramètres)
- **`HomeStack.tsx`**: Stack navigator for home screens
  - Home screen
  - CategoryQuestions screen
  - CategoryBasedQuestions screen

### 3. Context Management (`src/shared/contexts/` and `src/test_civic/contexts/`)
**Context Provider Hierarchy** (from AppProviders.tsx):
```
DataProvider (outermost)
├── IconProvider
    ├── ThemeProvider
        ├── TextFormattingProvider
            └── CivicExamProvider (innermost)
```

**Shared Contexts**:
- **`DataContext.tsx`**: Manages data loading and question data
- **`IconContext.tsx`**: Icon theme management
- **`ThemeContext.tsx`**: Color themes and visual styling
- **`TextFormattingContext.tsx`**: Text display customization

**Civic Exam Contexts**:
- **`CivicExamContext.tsx`**: Main civic exam state management
  - Wraps CivicExamSessionProvider and CivicExamProgressProvider
  - Provides exam session control and progress tracking
- **`CivicExamSessionContext.tsx`**: Civic exam session state management
- **`CivicExamProgressContext.tsx`**: Civic exam progress and statistics tracking

### 4. Screen Components

**Home Screens** (`src/welcome/`):
- **`HomeScreen.tsx`**: Landing page with category navigation
- **`CategoryQuestionsScreen.tsx`**: Category-based question browsing
- **`CategoryBasedQuestionsScreen.tsx`**: Specific category question sets
- **`CategoryCard.tsx`**: Category navigation cards
- **`CategorySlideView.tsx`**: Category carousel view
- **`QuestionSlideView.tsx`**: Question pagination view

**Search Screens** (`src/search/`):
- **`SearchScreen.tsx`**: Advanced question search and filtering
- **`useSearch.ts`**: Search hook with query management
- **`components/`**:
  - `SearchBar.tsx`: Search input with advanced toggle
  - `SearchSuggestions.tsx`: Auto-complete suggestions
  - `SearchResults.tsx`: Search results display
  - `SearchHistory.tsx`: Recent search queries
  - `AdvancedSearchPanel.tsx`: Filter panel
  - `SearchStats.tsx`: Search statistics display

**Civic Exam Screens** (`src/test_civic/screens/`):
- **`CivicExamHomeScreen.tsx`**: Civic exam home and mode selection
- **`CivicExamInfoScreen.tsx`**: Information about the civic exam
- **`CivicExamPracticeScreen.tsx`**: Practice mode configuration with theme selection
- **`CivicExamQuestionScreen.tsx`**: Individual question display during exam
- **`CivicExamReviewScreen.tsx`**: Review answers before submission
- **`CivicExamResultScreen.tsx`**: Exam completion and results

**Flash Card Screens** (`src/flashcard/screens/`):
- **`CategorySelectionScreen.tsx`**: Select category for flash cards
- **`FlashCardScreen.tsx`**: Flash card study interface with flip animation

**Settings Screens** (`src/settings/`):
- **`SettingsScreen.tsx`**: App configuration and preferences
- **`components/`**:
  - `ThemeSettings.tsx`: Theme customization
  - `TextFormattingSettings.tsx`: Text formatting options
  - `CivicExamSettings.tsx`: Civic exam statistics and settings
  - `AppInfoSettings.tsx`: App information and rating
  - `ColorThemeSelector.tsx`: Color theme picker
  - `SliderSetting.tsx`: Numeric setting controls
  - `CollapsibleSection.tsx`: Collapsible settings sections
  - `RatingModal.tsx`: App rating modal

### 5. Reusable Components (`src/shared/components/`)
**Core Components**:
- **`QuestionCard.tsx`**: Individual question display component
- **`DataLoadingScreen.tsx`**: Loading state management
- **`ImageModal.tsx`**: Image viewing modal
- **`FormattedText.tsx`**: Theme-aware text rendering
- **`Icon3D.tsx`**: 3D icon component with variants
- **`BackButton.tsx`**: Navigation back button
- **`SlideQuestionView.tsx`**: Question slide view component

### 6. Type Definitions (`src/types/`)
**Modular Type System**:
- **`index.ts`**: Central type exports
- **`core.ts`**: Fundamental data types
- **`questionsData.ts`**: Question data structure types
- **`ui.ts`**: UI component interfaces
- **`navigation.ts`**: Navigation parameter types

**Feature-Specific Types**:
- **`src/test_civic/types.ts`**: Civic exam types
- **`src/flashcard/types.ts`**: Flash card types
- **`src/settings/types.ts`**: Settings types
- **`src/shared/types/`**: Shared type definitions

### 7. Data Management (`src/data/`)
- **`knowledge/`**: Knowledge base data
  - `formation/`: Formation data for civic exam preparation
  - `formation_content/`: Detailed formation content
  - `formation_split/`: Split formation markdown files
  - `livret/`: Livret du Citoyen data
  - `new_livret/`: Updated livret data
  - `pics/`: Image assets
  - `geography_fr_vi.json`: Geography questions (French-Vietnamese)
  - `personal_fr_vi.json`: Personal questions (French-Vietnamese)
  - `history_categories.json`: History categories
- **`test_civic/`**: Civic exam test questions organized by themes
  - `principes_et_valeurs.json`: Principles and values
  - `system_et_politique.json`: System and politics
  - `droits_et_devoirs.json`: Rights and duties
  - `histoire_geographie_et_culture.json`: History, geography, and culture
  - `vivre_dans_la_societe_francaise.json`: Living in French society
  - `hist_geo_part1.json` & `hist_geo_part2.json`: History/geography parts

### 8. Utility Functions (`src/shared/utils/`)
**Core Utilities**:
- **`dataUtils.ts`**: Data loading and processing
- **`dataValidation.ts`**: Data structure validation
- **`questionUtils.ts`**: Question processing and transformation
- **`searchIndex.ts`**: Search indexing and querying
- **`stringUtils.ts`**: String manipulation utilities
- **`textNormalization.ts`**: Text normalization for search
- **`idUtils.ts`**: ID extraction and processing
- **`imageUtils.ts`**: Image loading and caching utilities
- **`logger.ts`**: Logging utilities
- **`alertUtils.ts`**: Alert dialog utilities
- **`sharedStyles.ts`**: Shared style definitions

**Civic Exam Utilities** (`src/test_civic/utils/`):
- **`civicExamDataLoader.ts`**: Loads civic exam questions from JSON files
- **`civicExamGeneration.ts`**: Generates exam questions based on configuration
- **`civicExamScoring.ts`**: Calculates exam scores and pass/fail status
- **`civicExamStorage.ts`**: Manages exam progress and statistics persistence
- **`civicExamSessionStorage.ts`**: Manages exam session state persistence
- **`civicExamSerialization.ts`**: Serializes/deserializes exam results
- **`civicExamHelpers.ts`**: Helper functions for exam logic
- **`civicExamQuestionUtils.ts`**: Question text and answer processing
- **`civicExamUtils.ts`**: General civic exam utilities
- **`civicExamDefaults.ts`**: Default values and configurations

**Flash Card Utilities** (`src/flashcard/utils/`):
- **`flashcardDataUtils.ts`**: Flash card data loading and processing

### 9. Custom Hooks (`src/shared/hooks/`)
- **`useFirebaseImage.ts`**: Firebase image loading with caching
- **`useIcon3D.ts`**: Icon 3D variant management
- **`useCountdownTimer.ts`**: Countdown timer functionality
- **`usePanZoom.ts`**: Pan and zoom gesture handling

**Feature-Specific Hooks**:
- **`src/flashcard/hooks/useFlashCard.ts`**: Flash card state management
- **`src/search/useSearch.ts`**: Search functionality hook

### 10. Services (`src/shared/services/`)
- **`dataService.ts`**: Data and image loading service with:
  - Firebase Storage integration
  - Local data fallback
  - Caching with TTL
  - Retry logic with exponential backoff
  - Image caching

### 11. Theme System (`src/theme/`)
- **`colorThemes.ts`**: Color theme definitions and configurations

## 🔗 Key Dependencies & Integrations

### React Native & Expo Stack
```json
{
  "expo": "^54.0.29",
  "react": "19.1.0",
  "react-native": "0.81.5"
}
```

### Navigation & UI
```json
{
  "@react-navigation/native": "^6.1.9",
  "@react-navigation/bottom-tabs": "^6.5.11",
  "@react-navigation/native-stack": "^6.9.17",
  "react-native-gesture-handler": "~2.28.0",
  "react-native-safe-area-context": "^5.4.0",
  "react-native-screens": "~4.16.0"
}
```

### Data & Storage
```json
{
  "firebase": "^11.8.1",
  "@react-native-async-storage/async-storage": "2.2.0"
}
```

### Styling & Fonts
```json
{
  "@expo-google-fonts/kalam": "^0.4.0",
  "@expo-google-fonts/patrick-hand": "^0.4.0",
  "@expo-google-fonts/dancing-script": "^0.4.0",
  "expo-linear-gradient": "~15.0.8"
}
```

## 🎯 Core Functionality

### Question Management
- **Data Source**: Static JSON files with French questions
- **Categories**: History, geography, culture, arts, sports, etc.
- **Format**: Questions in French with explanations
- **Data Structure**: Organized by themes and subcategories
- **Image Support**: Firebase Storage integration with local fallback

### Search Functionality
- **Real-time Search**: Search as you type with suggestions
- **Advanced Filters**: Filter by category, image presence, question range
- **Search History**: Track recent searches
- **Search Statistics**: Display search result counts
- **Text Normalization**: Handles French accents and special characters

### Civic Exam Functionality
- **Practice Mode**: Practice with customizable question sets
  - Theme selection (5 themes available)
  - Customizable question count
  - Explanations enabled
- **Naturalization Mode**: Full 40-question exam simulation
  - 45-minute time limit
  - No explanations during exam
  - Official exam format
- **Question Distribution**: Follows official exam distribution across themes
- **Progress Tracking**: Detailed statistics and performance analytics
- **Session Management**: Resume interrupted exams
- **Review Mode**: Review answers before submission

### Flash Card Study Mode
- **Category Selection**: Choose category for flash card study
- **Flip Animation**: Smooth card flip animation
- **Navigation**: Navigate between cards with swipe gestures
- **Image Support**: Display images on flash cards
- **Scroll Support**: Handle long content with scrollable cards

### Theme System
- **Multiple Color Schemes**: Various theme options
- **Icon Customization**: Different icon sets with 3D variants
- **Font Options**: Multiple font families (Kalam, PatrickHand, DancingScript)
- **Text Formatting**: Customizable text size and formatting
- **Dark/Light Mode**: Theme mode support
- **Responsive**: Adapts to device and platform

### Progress Tracking
- **Test History**: Complete test attempt records
- **Analytics**: Performance metrics and trends
- **Category Progress**: Topic-specific improvement tracking
- **Statistics**: Pass rate, average score, total attempts
- **AsyncStorage**: Local progress persistence

## 🚀 Getting Started

### Prerequisites
- Node.js (v20.x)
- npm or yarn
- Expo CLI
- Firebase project with Storage enabled

### Setup

1. **Install dependencies**
```bash
npm install
```

2. **Configure Firebase**
   - Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   - Fill in your Firebase credentials in `.env`:
     - Get your Firebase config from [Firebase Console](https://console.firebase.google.com/)
     - Go to Project Settings > General > Your apps
     - Copy the values to your `.env` file
   - **Important**: The `.env` file is gitignored and will not be committed to version control

3. **Start development server**
```bash
npm start
# or
npx expo start
```

4. **Platform-specific builds**
```bash
npm run android    # Android
npm run ios        # iOS
npm run web        # Web
```

## 🏃‍♂️ Development Workflow

1. **Context Providers**: All global state managed through React Context with proper provider hierarchy
2. **Type Safety**: Comprehensive TypeScript coverage with strict type checking
3. **Modular Design**: Separated concerns with clear file organization
4. **Platform Optimization**: Conditional rendering for mobile/web
5. **Performance**: Lazy loading, optimized rendering, and caching strategies
6. **Error Handling**: Comprehensive error handling with logging
7. **Data Caching**: Intelligent caching with TTL and retry logic

## 📊 Data Flow

```
Questions Data (JSON) → dataService → DataContext → Screens → Components
                    ↓
              Firebase Storage ← dataService (with caching)
                    ↓
              Local Fallback (if Firebase fails)
                    ↓
              AsyncStorage (for progress/settings)
```

## 🔧 Key Features

- **Cross-platform compatibility** (iOS, Android, Web)
- **Offline functionality** with local storage and caching
- **Customizable user interface** (themes, fonts, icons)
- **Comprehensive test analytics** and progress tracking
- **Comprehensive question database** with detailed explanations
- **Advanced search** with filters and suggestions
- **Flash card study mode** for active learning
- **Civic exam simulation** with practice and naturalization modes
- **Responsive design** adapting to different screen sizes
- **Firebase integration** for data synchronization and image storage
- **Image caching** for improved performance
- **Session persistence** for exam resumption

## 📱 Navigation Structure

The app uses a bottom tab navigator with 5 main sections:

1. **Home**: Browse questions by category
2. **Search**: Advanced search with filters
3. **Civic Exam**: Practice and naturalization exam modes
4. **Flash Cards**: Study mode with flip cards
5. **Settings**: App customization and preferences

Each section may have its own stack navigator for nested navigation.

---

This application demonstrates modern React Native development practices with functional programming principles, comprehensive type safety, and user-centric design for French citizenship exam preparation.
