/**
 * Unit tests for ID utility functions
 * 
 * Purpose: Tests critical ID extraction and validation logic used throughout the app.
 * These utilities handle converting various ID formats (numeric, string with numbers)
 * into normalized numeric IDs, which is essential for question identification,
 * data processing, and preventing ID-related bugs.
 */
import { extractNumericId, isValidId } from '../idUtils';

describe('idUtils', () => {
  describe('extractNumericId', () => {
    it('should extract numeric ID from number', () => {
      expect(extractNumericId(42)).toBe(42);
      expect(extractNumericId(0)).toBe(0);
      expect(extractNumericId(1000)).toBe(1000);
    });

    it('should extract numeric ID from string with number', () => {
      expect(extractNumericId('formation_1')).toBe(1);
      expect(extractNumericId('livret_42')).toBe(42);
      expect(extractNumericId('question123')).toBe(123);
    });

    it('should return undefined for invalid inputs', () => {
      expect(extractNumericId('no-number')).toBeUndefined();
      expect(extractNumericId(null)).toBeUndefined();
      expect(extractNumericId(undefined)).toBeUndefined();
      expect(extractNumericId({})).toBeUndefined();
    });
  });

  describe('isValidId', () => {
    it('should validate positive finite numbers', () => {
      expect(isValidId(1)).toBe(true);
      expect(isValidId(100)).toBe(true);
      expect(isValidId(999)).toBe(true);
    });

    it('should reject invalid IDs', () => {
      expect(isValidId(0)).toBe(false);
      expect(isValidId(-1)).toBe(false);
      expect(isValidId(NaN)).toBe(false);
      expect(isValidId(Infinity)).toBe(false);
      expect(isValidId('1')).toBe(false);
      expect(isValidId(null)).toBe(false);
    });
  });
});

