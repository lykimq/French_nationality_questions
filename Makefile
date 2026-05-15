.PHONY: help setup install android android-fast android-run ios web run start dev \
       test clean clean-android clean-ios clean-all \
       devices lint format

# Firebase project id from .env (single source of truth)
PROJECT_ID := $(shell grep -E '^EXPO_PUBLIC_FIREBASE_PROJECT_ID=' .env 2>/dev/null | cut -d= -f2- | tr -d '"' | tr -d "'" | xargs)
PROJECT_NUMBER := $(shell gcloud projects describe "$(PROJECT_ID)" --format='value(projectNumber)' 2>/dev/null)
COMPUTE_SA := $(PROJECT_NUMBER)-compute@developer.gserviceaccount.com

# ------------------------------------------------------------------
# Setup & Install
# ------------------------------------------------------------------

help: ## Show available commands
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

setup: ## First-time setup (.env, dependencies, Cloud Functions)
	@[ -f .env ] || (cp .env.example .env && echo "Created .env – fill in your Firebase credentials")
	npm install
	@$(MAKE) functions-install

install: ## Install app and Cloud Functions dependencies
	npm install
	@$(MAKE) functions-install

# ------------------------------------------------------------------
# Android (includes Cloud TTS deploy on `make android`)
# ------------------------------------------------------------------

android: cloud-tts android-run ## Prepare GCP, deploy Cloud TTS, build and run on Android

android-fast: android-run ## Build and run on Android (skip Cloud TTS deploy)

android-run: ## Run on connected Android device
	@adb devices | grep -q 'device$$' || (echo "No Android device found. Connect via USB or adb pair." && exit 1)
	npx expo run:android

# ------------------------------------------------------------------
# Cloud TTS (internal — used by `make android`)
# ------------------------------------------------------------------

functions-install:
	cd functions && npm install

functions-build: functions-install
	cd functions && npm run build

cloud-env-check:
	@test -f .env || (echo "Missing .env – run: make setup" && exit 1)
	@test -n "$(PROJECT_ID)" || (echo "Set EXPO_PUBLIC_FIREBASE_PROJECT_ID in .env" && exit 1)
	@if grep -qE '^EXPO_PUBLIC_USE_FUNCTIONS_EMULATOR=true' .env 2>/dev/null; then \
		echo "Set EXPO_PUBLIC_USE_FUNCTIONS_EMULATOR=false in .env for cloud voices."; \
		exit 1; \
	fi

firebase-auth:
	@command -v firebase >/dev/null 2>&1 || ( \
		echo "Install Firebase CLI: npm install -g firebase-tools"; exit 1; \
	)
	@firebase projects:list --json >/dev/null 2>&1 || ( \
		echo "Run: firebase login"; exit 1; \
	)

firebase-use: cloud-env-check firebase-auth
	firebase use "$(PROJECT_ID)"

gcloud-check:
	@command -v gcloud >/dev/null 2>&1 || ( \
		echo "Install Google Cloud SDK: https://cloud.google.com/sdk/docs/install"; exit 1; \
	)

gcp-apis: cloud-env-check gcloud-check firebase-auth
	gcloud services enable texttospeech.googleapis.com \
		cloudfunctions.googleapis.com cloudbuild.googleapis.com \
		run.googleapis.com artifactregistry.googleapis.com \
		--project="$(PROJECT_ID)"

gcp-iam: cloud-env-check gcloud-check
	@test -n "$(PROJECT_NUMBER)" || ( \
		echo "Run: gcloud auth login"; exit 1; \
	)
	@gcloud projects add-iam-policy-binding "$(PROJECT_ID)" \
		--member="serviceAccount:$(COMPUTE_SA)" \
		--role="roles/cloudbuild.builds.builder" \
		--condition=None >/dev/null 2>&1 || true
	@gcloud projects add-iam-policy-binding "$(PROJECT_ID)" \
		--member="serviceAccount:$(COMPUTE_SA)" \
		--role="roles/logging.logWriter" \
		--condition=None >/dev/null 2>&1 || true
	@gcloud projects add-iam-policy-binding "$(PROJECT_ID)" \
		--member="serviceAccount:$(COMPUTE_SA)" \
		--role="roles/storage.objectViewer" \
		--condition=None >/dev/null 2>&1 || true
	@gcloud projects add-iam-policy-binding "$(PROJECT_ID)" \
		--member="serviceAccount:$(COMPUTE_SA)" \
		--role="roles/artifactregistry.writer" \
		--condition=None >/dev/null 2>&1 || true

gcp-invoker: cloud-env-check gcloud-check
	@gcloud run services add-iam-policy-binding synthesizefrenchspeech \
		--region=europe-west1 \
		--project="$(PROJECT_ID)" \
		--member="allUsers" \
		--role="roles/run.invoker" \
		--quiet >/dev/null 2>&1 || true

cloud-tts: functions-build firebase-use gcp-apis gcp-iam
	firebase deploy --only functions:synthesizeFrenchSpeech
	@$(MAKE) gcp-invoker

# ------------------------------------------------------------------
# Run
# ------------------------------------------------------------------

run: ## Start Expo dev server
	npx expo start

start: ## Start Expo dev server (development build)
	npx expo start

dev: ## Start Expo dev server
	npx expo start

start-go: ## Start Expo with Expo Go support
	npx expo start --go

ios: ## Build and run on iOS simulator
	npx expo run:ios

web: ## Start the web version
	npx expo start --web

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

lint: ## Run type checking
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
