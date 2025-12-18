// ==================== OPTIMIZED TYPE STRUCTURE ====================
// Export all types from the new consolidated, functional programming structure

// Core fundamental types
export * from './core';

// Questions data types
export * from './questionsData';

// UI component types
export * from './ui';

// Navigation types (shared)
export * from './navigation';

// Feature-specific types
export * from '../welcome/types';
export * from '../test/types';
export * from '../settings/types';

// Explicitly re-export TestQuestion from welcome/types to avoid ambiguity
export type { TestQuestion } from '../welcome/types';
