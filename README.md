# 🇫🇷 Naturalisation Test Civique

A modern React Native / Expo mobile application designed to help you prepare for the French citizenship test (_test civique de naturalisation_). Study smarter, practice harder, and track your progress toward becoming a French citizen.

---

## ✨ Features

### 📖 Learning & Discovery

- **Category Browsing**: Explore questions by theme: history, geography, culture, politics, and more.
- **Flash Card Mode**: Interactive study cards with smooth flip animations for active recall.
- **Detailed Explanations**: Understand the "why" behind every answer with context-rich explanations.

### ✍️ Exam Simulation

- **Practice Mode**: Tailor your study sessions with specific categories and question counts.
- **Naturalization Mode**: Simulate the real thing—40 questions in 45 minutes, matching official exam distribution.
- **Answer Review**: Review all your answers before finalizing your test.

### 🛠️ Advanced Tools

- **Smart Search**: Find questions quickly with real-time suggestions, history, and advanced filters (category, images, etc.).
- **Progress Tracking**: Visualize your performance with detailed statistics and pass-rate history.
- **Customization**: Personalize your experience with multiple color themes, 3D icons, and text formatting options.

### 🌐 Technical Excellence

- **Offline First**: Works seamlessly offline with local caching and Firebase integration.
- **Cross-Platform**: Optimized for iOS, Android, and the Web.
- **Modern Stack**: Built with React Native 0.81, Expo 54, and TypeScript.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v20 or higher
- **npm**: v10 or higher
- **Expo CLI**: Installed via `npm install -g expo-cli`

### Installation

1. **Clone and Setup**:

    ```bash
    make setup
    ```

    _This will install dependencies and create your `.env` file from the template._

2. **Configure Firebase**:
   Open `.env` and fill in your Firebase credentials.

3. **Run the App**:
    ```bash
    make run
    ```
    _Alternatively, use `make android`, `make ios`, or `make web` for platform-specific targets._

---

## 📂 Project Structure

```text
.
├── assets              # Static assets (images, icons, splash screen)
├── docs                # Technical documentation and architecture
├── src                 # Application source code
│   ├── config          # Global configurations (Firebase, Sentry, Icons)
│   ├── data            # Static question data and knowledge base
│   ├── flashcard       # Flash card study feature
│   ├── navigation      # Tab and Stack navigation definitions
│   ├── search          # Advanced search feature
│   ├── settings        # User preferences and app info
│   ├── shared          # Reusable components, hooks, contexts, and utils
│   ├── test_civic      # Core exam simulation engine
│   ├── theme           # Design system and color palettes
│   └── welcome         # Landing and category browsing screens
├── Makefile            # Project automation commands
├── App.tsx             # Application entry point
└── package.json        # Dependencies and scripts
```

For a deeper dive into the system design, check out [Project Architecture](docs/project-architecture.md).

---

## 🧪 Development

| Command       | Description                         |
| :------------ | :---------------------------------- |
| `make test`   | Run all unit and integration tests  |
| `make lint`   | Run TypeScript type checking        |
| `make format` | Format source code with Prettier    |
| `make clean`  | Wipe `node_modules` and start fresh |

---

## ⚖️ License

Private — All Rights Reserved.
