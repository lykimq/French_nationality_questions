# Cloud Text-to-Speech

Google Cloud French voices are served by a Firebase Callable Function (`synthesizeFrenchSpeech`, region `europe-west1`).

## Prerequisites

- Firebase project (same as `EXPO_PUBLIC_FIREBASE_PROJECT_ID` in `.env`)
- Billing enabled on that GCP project
- [Firebase CLI](https://firebase.google.com/docs/cli): `npm install -g firebase-tools`
- [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) (`gcloud`)
- Once per machine: `firebase login` and `gcloud auth login`

## Commands

From the **repository root**:

| Command | Purpose |
|--------|---------|
| `make setup` | Create `.env` from example, install dependencies |
| `make android` | Enable APIs, configure deploy IAM, deploy the function, build and run on Android |
| `make android-fast` | Build and run on Android only (skip function deploy) |

Fill in `.env` before the first `make android`. Keep `EXPO_PUBLIC_USE_FUNCTIONS_EMULATOR` unset or `false`.

In the app, turn on **Voix naturelle (Google Cloud)** under audio settings.

## Function code

- Entry point: `functions/src/index.ts`
- Build: `functions/package.json` (`npm run build` runs automatically via `make android`)
