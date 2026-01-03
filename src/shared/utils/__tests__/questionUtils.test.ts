/**
 * Unit tests for question data processing utilities
 * 
 * Purpose: Tests critical question data transformation and formatting functions:
 * - Sorting questions by ID (handles numeric and string IDs)
 * - Processing raw question data into structured format
 * - Formatting question explanations with proper line breaks and special markers
 * - Safely parsing date strings
 * 
 * These utilities ensure question data is correctly processed and displayed throughout the app.
 */
import { sortQuestionsById, processQuestionData, formatExplanation, safeParseDate } from '../questionUtils';
import type { RawQuestion } from '../../../shared/types';

describe('questionUtils', () => {
  beforeEach(() => {
    // Suppress expected console warnings during tests
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('sortQuestionsById', () => {
    it('should sort questions by numeric ID in ascending order', () => {
      const questions = [
        { id: 3, question: 'Question 3' },
        { id: 1, question: 'Question 1' },
        { id: 2, question: 'Question 2' },
      ];

      const sorted = sortQuestionsById(questions);

      expect(sorted[0].id).toBe(1);
      expect(sorted[1].id).toBe(2);
      expect(sorted[2].id).toBe(3);
    });

    it('should handle string IDs with numeric extraction', () => {
      const questions = [
        { id: 'formation_3', question: 'Question 3' },
        { id: 'formation_1', question: 'Question 1' },
        { id: 'formation_2', question: 'Question 2' },
      ];

      const sorted = sortQuestionsById(questions);

      expect(sorted[0].id).toBe('formation_1');
      expect(sorted[1].id).toBe('formation_2');
      expect(sorted[2].id).toBe('formation_3');
    });

    it('should handle mixed numeric and string IDs', () => {
      const questions = [
        { id: 5, question: 'Question 5' },
        { id: 'livret_2', question: 'Question 2' },
        { id: 1, question: 'Question 1' },
      ];

      const sorted = sortQuestionsById(questions);

      expect(sorted[0].id).toBe(1);
      expect(sorted[1].id).toBe('livret_2');
      expect(sorted[2].id).toBe(5);
    });
  });

  describe('processQuestionData', () => {
    it('should process valid question data correctly', () => {
      const rawQuestion: RawQuestion = {
        id: 1,
        question: 'What is the capital of France?',
        explanation: 'Paris is the capital.',
        image: 'paris.png',
      };

      const result = processQuestionData(rawQuestion, 'geography', 'Geography', 0);

      expect(result.id).toBe(1);
      expect(result.question).toBe('What is the capital of France?');
      expect(result.explanation).toBe('Paris is the capital.');
      expect(result.image).toBe('paris.png');
      expect(result.categoryId).toBe('geography');
      expect(result.categoryTitle).toBe('Geography');
    });

    it('should apply idOffset correctly', () => {
      const rawQuestion: RawQuestion = {
        id: 5,
        question: 'Test question',
      };

      const result = processQuestionData(rawQuestion, 'category', 'Category', 1000);

      expect(result.id).toBe(1005);
    });

    it('should return fallback for invalid question data', () => {
      const rawQuestion: RawQuestion = {
        id: 'invalid',
        question: 'Test',
      };

      const result = processQuestionData(rawQuestion, 'category', 'Category', 0);

      expect(result.id).toBe('invalid');
      expect(result.question).toBe('Invalid question data');
      expect(result.explanation).toBe('No explanation available');
    });
  });

  describe('formatExplanation', () => {
    it('should format explanation with proper line breaks', () => {
      const input = 'First sentence. Second sentence! Third sentence?';
      const result = formatExplanation(input);

      expect(result).toContain('First sentence.');
      expect(result).toContain('Second sentence!');
      expect(result).toContain('Third sentence?');
    });

    it('should preserve numbered lists without adding extra breaks', () => {
      const input = '1. First item. 2. Second item.';
      const result = formatExplanation(input);

      expect(result).not.toContain('1. First item.\n\n');
      expect(result).toContain('1. First item.');
    });

    it('should format bracketed content with arrows', () => {
      const input = 'Text [important note] more text';
      const result = formatExplanation(input);

      expect(result).toContain('→ important note ←');
    });
  });

  describe('safeParseDate', () => {
    it('should parse valid date string', () => {
      const dateStr = '2024-01-15';
      const result = safeParseDate(dateStr);

      expect(result).toBeInstanceOf(Date);
      expect(result?.getFullYear()).toBe(2024);
    });

    it('should return undefined for invalid date string', () => {
      const invalidDate = 'not-a-date';
      const result = safeParseDate(invalidDate);

      expect(result).toBeUndefined();
    });

    it('should return undefined for null or empty values', () => {
      expect(safeParseDate(null)).toBeUndefined();
      expect(safeParseDate(undefined)).toBeUndefined();
      expect(safeParseDate('')).toBeUndefined();
    });
  });
});

