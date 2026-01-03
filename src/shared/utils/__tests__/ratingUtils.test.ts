/**
 * Unit tests for app rating and storage utilities
 * 
 * Purpose: Tests the app store rating system functionality including:
 * - Saving and retrieving user ratings
 * - Tracking app launch counts
 * - Determining when to prompt users for ratings (after 5 launches, not if already rated)
 * - Persisting rating state in AsyncStorage
 * 
 * These tests ensure the rating prompt logic works correctly to improve app store ratings.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  saveRating,
  getRatingData,
  hasUserRated,
  incrementLaunchCount,
  shouldPromptForRating,
} from '../ratingUtils';

jest.mock('@react-native-async-storage/async-storage');

describe('ratingUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    // Suppress expected console output during tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('saveRating', () => {
    it('should save rating data correctly', async () => {
      await saveRating(5);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'app_rating_data',
        expect.stringContaining('"rating":5')
      );
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('has_rated_app', 'true');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('app_rating_value', '5');
    });

    it('should handle errors when saving rating', async () => {
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

      await expect(saveRating(4)).rejects.toThrow('Storage error');
    });
  });

  describe('getRatingData', () => {
    it('should retrieve saved rating data', async () => {
      const mockData = { rating: 5, timestamp: 1234567890, hasLeftStoreReview: false };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockData));

      const result = await getRatingData();

      expect(result).toEqual(mockData);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('app_rating_data');
    });

    it('should return null when no rating data exists', async () => {
      const result = await getRatingData();

      expect(result).toBeNull();
    });
  });

  describe('hasUserRated', () => {
    it('should return true when user has rated', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('true');

      const result = await hasUserRated();

      expect(result).toBe(true);
    });

    it('should return false when user has not rated', async () => {
      const result = await hasUserRated();

      expect(result).toBe(false);
    });
  });

  describe('incrementLaunchCount', () => {
    it('should increment launch count from zero', async () => {
      const result = await incrementLaunchCount();

      expect(result).toBe(1);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('app_launch_count', '1');
    });

    it('should increment existing launch count', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('5');

      const result = await incrementLaunchCount();

      expect(result).toBe(6);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('app_launch_count', '6');
    });
  });

  describe('shouldPromptForRating', () => {
    it('should return false if user has already rated', async () => {
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === 'has_rated_app') return Promise.resolve('true');
        return Promise.resolve(null);
      });

      const result = await shouldPromptForRating();

      expect(result).toBe(false);
    });

    it('should return true when launch count is 5 or more', async () => {
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === 'has_rated_app') return Promise.resolve(null);
        if (key === 'app_launch_count') return Promise.resolve('5');
        return Promise.resolve(null);
      });

      const result = await shouldPromptForRating();

      expect(result).toBe(true);
    });

    it('should return false if prompted within last 7 days', async () => {
      const sevenDaysAgo = Date.now() - 6 * 24 * 60 * 60 * 1000;
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === 'has_rated_app') return Promise.resolve(null);
        if (key === 'app_launch_count') return Promise.resolve('10');
        if (key === 'last_rating_prompt_date') return Promise.resolve(String(sevenDaysAgo));
        return Promise.resolve(null);
      });

      const result = await shouldPromptForRating();

      expect(result).toBe(false);
    });
  });
});

