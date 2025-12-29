# Error Handling Strategy

## Overview

This document defines the error handling patterns used across the shared codebase to ensure consistency and maintainability.

## Module-Specific Patterns

### Services (`src/shared/services/`)

**Pattern:** Graceful degradation with fallbacks
- **Do:** Return `null` or fallback values on errors
- **Do:** Log errors using `logger.error()`
- **Do:** Implement retry logic for transient failures
- **Do:** Use local fallbacks when remote fails
- **Don't:** Throw errors (let callers handle gracefully)

**Rationale:** Services should be resilient and provide fallbacks. Callers can check for null/undefined and handle accordingly.

**Example:**
```typescript
export const loadJsonResource = async (...): Promise<Data | null> => {
    try {
        // Try remote
        const remote = await fetchFirebaseJson(dataPath);
        if (remote) return remote;
    } catch (error: unknown) {
        logger.error('Failed to load remote data', error);
    }
    
    // Fallback to local
    const local = await getLocalJsonData(dataPath);
    return local ?? null;
};
```

### Utilities (`src/shared/utils/`)

**Pattern:** Return null/undefined/safe defaults with warnings
- **Do:** Return `null`, `undefined`, empty objects, or safe defaults
- **Do:** Use `logger.warn()` for recoverable issues
- **Do:** Use `logger.error()` for critical failures
- **Don't:** Throw errors (utilities should be safe to call)

**Rationale:** Utilities are used throughout the app and should never crash. Invalid input should result in safe defaults that callers can check.

**Example:**
```typescript
// Return safe default
export const processQuestionData = (...): TestQuestion => {
    if (invalid) {
        logger.warn('Invalid question data');
        return fallbackQuestion;
    }
    return processedQuestion;
};

// Return empty object for data loading
export const preloadAllData = async () => {
    try {
        return { subcategoryData: await loadData() };
    } catch (error: unknown) {
        logger.error('Preload failed', error);
        return { subcategoryData: {} }; // Safe default
    }
};
```

### Components (`src/shared/components/`)

**Pattern:** User-friendly error messages
- **Do:** Show user-friendly error messages
- **Do:** Use error boundaries for React errors
- **Do:** Log errors for debugging
- **Don't:** Expose technical error details to users

**Rationale:** Components interact with users. Errors should be presented clearly without technical jargon.

## Error Type Handling

All caught errors should be typed as `unknown`:

```typescript
try {
    // ...
} catch (error: unknown) {
    const message = getErrorMessage(error);
    logger.error('Operation failed', error);
}
```

Use `getErrorMessage()` from `errorUtils.ts` to extract error messages safely.

## Error Utilities

Use utilities from `src/shared/utils/errorUtils.ts`:
- `getErrorMessage(error: unknown): string` - Extract error message
- `getErrorStack(error: unknown): string | undefined` - Extract stack trace
- `normalizeError(error: unknown)` - Create standardized error object

## Summary

| Module Type | Error Handling | Logging | Return Value |
|------------|----------------|---------|--------------|
| Services | Graceful degradation | `logger.error()` | `null` or fallback |
| Utils | Safe defaults | `logger.warn()` / `logger.error()` | `null` / `undefined` / default |
| Components | User messages | `logger.error()` | Show UI error |

