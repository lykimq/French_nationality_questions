// ==================== OPTIMIZED TYPE STRUCTURE ====================
// Export all types from the new consolidated, functional programming structure

// Core fundamental types
export * from './core';

// Language-specific types
export * from './language';

// UI component types
export * from './ui';

// Navigation types (shared)
export * from './navigation';

// Feature-specific types
export * from '../features/welcome/types';
export * from '../features/test/types';
export * from '../features/settings/types';

// Explicitly re-export TestQuestion from welcome/types to avoid ambiguity
export type { TestQuestion } from '../features/welcome/types';
