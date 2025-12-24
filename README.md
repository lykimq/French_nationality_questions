# French Nationality Questions App

A comprehensive React Native mobile application built with Expo for studying French citizenship questions. The app features customizable themes, interactive testing functionality, and detailed progress tracking.

## 📱 Overview

This is a cross-platform mobile application that helps users prepare for French nationality/citizenship tests. It provides:
- **Interactive question practice** with civic exam functionality
- **Progress tracking** and detailed analytics
- **Customizable themes** and display settings
- **Offline-capable** with Firebase integration
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
    ├── components/           # Reusable UI components
    ├── contexts/             # React Context providers
    ├── data/                 # Static data and JSON files
    ├── hooks/                # Custom React hooks
    ├── navigation/           # Navigation configuration
    ├── screens/              # Screen components
    ├── types/                # TypeScript type definitions
    └── utils/                # Utility functions
```

## 📋 File Relationships & Dependencies

### 1. Entry Point & Configuration
- **`index.ts`**: Expo root component registration, imports `App.tsx`
- **`App.tsx`**: Main application wrapper with:
  - Font loading (Kalam, PatrickHand, DancingScript)
  - Context providers hierarchy
  - Navigation setup
- **`app.json`**: Expo configuration for iOS, Android, and web builds
- **`package.json`**: Dependencies, scripts, and project metadata

### 2. Navigation System (`src/navigation/`)
- **`AppNavigator.tsx`**: Main navigation controller
  - Creates bottom tab navigation with 5 tabs: Home, Search, Civic Exam, Flash Cards, Settings
  - Implements stack navigators for each tab
  - Handles theme-based styling
  - **Dependencies**: All screen components, theme contexts

### 3. Context Management (`src/shared/contexts/` and `src/test_civic/contexts/`)
**Context Provider Hierarchy** (from App.tsx):
```
DataProvider (outermost)
├── IconProvider
    ├── ThemeProvider
        ├── TextFormattingProvider
            └── CivicExamProvider (innermost)
```

- **`DataContext.tsx`**: Manages data loading and question data
- **`IconContext.tsx`**: Icon theme management
- **`ThemeContext.tsx`**: Color themes and visual styling
- **`TextFormattingContext.tsx`**: Text display customization
- **`CivicExamContext.tsx`**: Civic exam state management and progress tracking
- **`CivicExamSessionContext.tsx`**: Civic exam session state management
- **`CivicExamProgressContext.tsx`**: Civic exam progress and statistics tracking

### 4. Screen Components

**Welcome Screens** (`src/welcome/`):
- **`HomeScreen.tsx`**: Landing page with category navigation
- **`CategoryQuestionsScreen.tsx`**: Category-based question browsing
- **`CategoryBasedQuestionsScreen.tsx`**: Specific category question sets

**Search Screens** (`src/search/`):
- **`SearchScreen.tsx`**: Advanced question search and filtering

**Civic Exam Screens** (`src/test_civic/screens/`):
- **`CivicExamHomeScreen.tsx`**: Civic exam home and mode selection
- **`CivicExamInfoScreen.tsx`**: Information about the civic exam
- **`CivicExamPracticeScreen.tsx`**: Practice mode configuration
- **`CivicExamQuestionScreen.tsx`**: Individual question display during exam
- **`CivicExamReviewScreen.tsx`**: Review answers before submission
- **`CivicExamResultScreen.tsx`**: Exam completion and results

**Flash Card Screens** (`src/flashcard/screens/`):
- **`CategorySelectionScreen.tsx`**: Select category for flash cards
- **`FlashCardScreen.tsx`**: Flash card study interface

**Settings Screens** (`src/settings/`):
- **`SettingsScreen.tsx`**: App configuration and preferences

### 5. Reusable Components (`src/components/`)
**Core Components**:
- **`QuestionCard.tsx`**: Individual question display component
- **`CategoryCard.tsx`**: Category navigation cards
- **`DataLoadingScreen.tsx`**: Loading state management
- **`ImageModal.tsx`**: Image viewing modal

**Setting Components**:
- **`IconSelector.tsx`**: Icon theme selection
- **`FontSelector.tsx`**: Font customization
- **`ColorThemeSelector.tsx`**: Color theme picker
- **`SliderSetting.tsx`**: Numeric setting controls

**View Components**:
- **`CategorySlideView.tsx`**: Category carousel view
- **`QuestionSlideView.tsx`**: Question pagination view
- **`FormattedText.tsx`**: Theme-aware text rendering

### 6. Type Definitions (`src/types/`)
**Modular Type System**:
- **`index.ts`**: Central type exports
- **`core.ts`**: Fundamental data types
- **`questionsData.ts`**: Question data structure types
- **`ui.ts`**: UI component interfaces
- **`navigation.ts`**: Navigation parameter types

### 7. Data Management (`src/data/`)
- **`knowledge/new_livret/`**: Detailed subcategory data from Livret du Citoyen
- **`knowledge/formation/`**: Formation data for civic exam preparation
- **`test_civic/`**: Civic exam test questions organized by themes

### 8. Utility Functions (`src/shared/utils/`)
**Core Utilities**:
- **`dataUtils.ts`**: Data loading and processing
- **`dataValidation.ts`**: Data structure validation
- **`questionUtils.ts`**: Question processing and transformation
- **`searchIndex.ts`**: Search indexing and querying
- **`stringUtils.ts`**: String manipulation utilities
- **`textNormalization.ts`**: Text normalization for search
- **`idUtils.ts`**: ID extraction and processing
- **`imageUtils.ts`**: Image loading and caching
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

### 9. Theme System (`src/theme/`)
- **`colorThemes.ts`**: Color theme definitions and configurations

## 🔗 Key Dependencies & Integrations

### React Native & Expo Stack
```json
{
  "expo": "~53.0.9",
  "react": "19.0.0",
  "react-native": "0.79.2"
}
```

### Navigation & UI
```json
{
  "@react-navigation/native": "^6.1.9",
  "@react-navigation/bottom-tabs": "^6.5.11",
  "@react-navigation/native-stack": "^6.9.17",
  "react-native-gesture-handler": "^2.25.0"
}
```

### Data & Storage
```json
{
  "firebase": "^11.8.1",
  "@react-native-async-storage/async-storage": "^1.24.0"
}
```

### Styling & Fonts
```json
{
  "@expo-google-fonts/kalam": "^0.4.0",
  "@expo-google-fonts/patrick-hand": "^0.4.0",
  "@expo-google-fonts/dancing-script": "^0.4.0",
  "expo-linear-gradient": "^14.1.4"
}
```

## 🎯 Core Functionality

### Question Management
- **Data Source**: Static JSON files with French questions
- **Categories**: History, geography, culture, arts, sports, etc.
- **Format**: Questions in French with explanations
- **Data Structure**: Organized by themes and subcategories

### Civic Exam Functionality
- **Practice Mode**: Practice with customizable question sets
- **Naturalization Mode**: Full 40-question exam simulation
- **Theme Selection**: Focus on specific civic exam themes
- **Progress Tracking**: Detailed statistics and performance analytics

### Theme System
- **Multiple color schemes**: Various theme options
- **Icon customization**: Different icon sets
- **Font options**: Multiple font families
- **Responsive**: Adapts to device and platform

### Progress Tracking
- **Test history**: Complete test attempt records
- **Analytics**: Performance metrics and trends
- **Category progress**: Topic-specific improvement tracking
- **Firebase sync**: Cloud-based progress backup

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
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
npx expo start
```

4. **Platform-specific builds**
```bash
npx expo run:android    # Android
npx expo run:ios        # iOS
npx expo start --web    # Web
```

## 🏃‍♂️ Development Workflow

1. **Context Providers**: All global state managed through React Context
2. **Type Safety**: Comprehensive TypeScript coverage
3. **Modular Design**: Separated concerns with clear file organization
4. **Platform Optimization**: Conditional rendering for mobile/web
5. **Performance**: Lazy loading and optimized rendering

## 📊 Data Flow

```
Questions Data (JSON) → dataUtils → Context Providers → Screens → Components
                    ↓
              Firebase Storage ← dataService ← Civic Exam Questions
```

## 🔧 Key Features

- **Cross-platform compatibility** (iOS, Android, Web)
- **Offline functionality** with local storage
- **Customizable user interface** (themes, fonts, icons)
- **Comprehensive test analytics** and progress tracking
- **Comprehensive question database** with detailed explanations
- **Responsive design** adapting to different screen sizes
- **Firebase integration** for data synchronization

---

This application demonstrates modern React Native development practices with
functional programming principles, comprehensive type safety, and user-centric
design for French citizenship exam preparation.