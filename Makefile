.PHONY: help setup install android ios web start dev \
       test clean clean-android clean-ios clean-all \
       devices lint

# ------------------------------------------------------------------
# Setup & Install
# ------------------------------------------------------------------

help: ## Show available commands
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

setup: ## First-time project setup (install + env file)
	@[ -f .env ] || (cp .env.example .env && echo "Created .env from .env.example – fill in your credentials")
	npm install

install: ## Install dependencies
	npm install

# ------------------------------------------------------------------
# Run
# ------------------------------------------------------------------

android: ## Build & run on connected Android device
	@adb devices | grep -q 'device$$' || (echo "No Android device found. Connect via USB or adb pair." && exit 1)
	npx expo run:android

ios: ## Build & run on iOS simulator
	npx expo run:ios

web: ## Start the web version
	npx expo start --web

start: ## Start Expo dev server (development build)
	npx expo start

dev: ## Start Expo dev server (alias for start)
	npx expo start

start-go: ## Start Expo with Expo Go support
	npx expo start --go

# ------------------------------------------------------------------
# Test
# ------------------------------------------------------------------

test: ## Run all tests
	npx jest

# ------------------------------------------------------------------
# Code Quality
# ------------------------------------------------------------------

format: ## Format all source files with Prettier
	npx prettier --write "**/*.{json,js,ts,tsx,md}"

lint: ## Run type checking (alias for typecheck)
	npx tsc --noEmit

# ------------------------------------------------------------------
# Device Helpers
# ------------------------------------------------------------------

devices: ## List connected Android devices
	adb devices

# ------------------------------------------------------------------
# Clean
# ------------------------------------------------------------------

clean-android: ## Clean Android build artifacts
	cd android && ./gradlew clean

clean-ios: ## Clean iOS build artifacts
	cd ios && xcodebuild clean 2>/dev/null; rm -rf ios/build

clean: ## Remove node_modules and lock file
	rm -rf node_modules package-lock.json

clean-all: clean clean-android ## Full clean (node_modules + Android build)
	@echo "Cleaned. Run 'make setup' to reinstall."
