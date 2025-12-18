# French Nationality Questions App

A comprehensive React Native mobile application built with Expo for studying French citizenship questions. The app features bilingual support (French and Vietnamese) with customizable themes, interactive testing functionality, and detailed progress tracking.

## 📱 Overview

This is a cross-platform mobile application that helps users prepare for French nationality/citizenship tests. It provides:
- **Bilingual interface** (French 🇫🇷 / Vietnamese 🇻🇳)
- **Interactive question practice** with multiple test modes
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
  - Creates bottom tab navigation with 4 tabs: Home, Search, Test, Settings
  - Implements stack navigators for each tab
  - Handles theme-based styling and multilingual tab labels
  - **Dependencies**: All screen components, theme/language contexts

### 3. Context Management (`src/contexts/`)
**Context Provider Hierarchy** (from App.tsx):
```
LanguageProvider (outermost)
├── IconProvider
    ├── ThemeProvider
        ├── TextFormattingProvider
            ├── DisplaySettingsProvider
                └── TestProvider (innermost)
```

- **`LanguageContext.tsx`**: Manages bilingual content (French/Vietnamese)
- **`IconContext.tsx`**: Icon theme management
- **`ThemeContext.tsx`**: Color themes and visual styling
- **`TextFormattingContext.tsx`**: Text display customization
- **`TestContext.tsx`**: Test state management and progress tracking

### 4. Screen Components (`src/screens/`)
Screens are organized into logical folders for better navigation:

**Welcome Screens** (`src/screens/welcome/`):
- **`HomeScreen.tsx`**: Landing page with category navigation
- **`CategoryQuestionsScreen.tsx`**: Category-based question browsing
- **`CategoryBasedQuestionsScreen.tsx`**: Specific category question sets

**Search Screens** (`src/screens/search/`):
- **`SearchScreen.tsx`**: Advanced question search and filtering (largest file: 1018 lines)

**Test Screens** (`src/screens/test/`):
- **`TestScreen.tsx`**: Test mode selection and configuration
- **`ConversationTestScreen.tsx`**: Part 1 conversation tests (personal info, opinions, daily life)
- **`SubcategoryTestScreen.tsx`**: Subcategory-specific tests
- **`TestQuestionScreen.tsx`**: Individual question display during tests
- **`TestResultScreen.tsx`**: Test completion and results
- **`ProgressScreen.tsx`**: Detailed progress analytics
- **`ReviewScreen.tsx`**: Question review and study mode

**Settings Screens** (`src/screens/settings/`):
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
- **JSON files**: Structured question data by category
  - `geography_fr_vi.json`: Geography questions
  - `personal_fr_vi.json`: Personal/citizenship questions
  - `history_categories.json`: Historical categories
- **`subcategories/`**: Detailed subcategory data
- **`tests/`**: Pre-configured test sets

### 8. Utility Functions (`src/utils/`)
**Core Utilities**:
- **`dataUtils.ts`**: Data processing and question management (largest: 480 lines)
- **`testDatabaseIntegration.ts`**: Database connectivity
- **`colorThemes.ts`**: Theme definitions and calculations
- **`testCalculationUtils.ts`**: Test scoring and analytics

**Specialized Utilities**:
- **`firebaseUtils.ts`**: Firebase integration
- **`imageUtils.ts`**: Image processing
- **`testStorageUtils.ts`**: Local storage management
- **`sharedStyles.ts`**: Common styling utilities

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
- **Data Source**: Static JSON files with bilingual questions
- **Categories**: History, geography, culture, arts, sports, etc.
- **Format**: Each question has French and Vietnamese translations
- **IDs**: Questions numbered 36-200 (168 total questions)

### Test Modes
1. **Category-based**: Practice specific topics
2. **Full tests**: Complete citizenship simulation
3. **Subcategory tests**: Focused topic areas
4. **Review mode**: Study previous attempts

### Multilingual Support
- **Primary languages**: French (fr) and Vietnamese (vi)
- **Context-driven**: Language selection affects entire app
- **Consistent**: All UI elements, questions, and responses translated

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
              Firebase Storage ← testStorageUtils ← Test Results
```

## 🔧 Key Features

- **Cross-platform compatibility** (iOS, Android, Web)
- **Offline functionality** with local storage
- **Customizable user interface** (themes, fonts, icons)
- **Comprehensive test analytics** and progress tracking
- **Bilingual content** with seamless language switching
- **Responsive design** adapting to different screen sizes
- **Firebase integration** for data synchronization

---

This application demonstrates modern React Native development practices with
functional programming principles, comprehensive type safety, and user-centric
design for French citizenship exam preparation.