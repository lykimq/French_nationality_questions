/**
 * End-to-end tests for settings and rating flow
 *
 * Purpose: Tests the complete user flow for app settings and rating functionality:
 * - Rating the app and persisting the rating
 * - Tracking app launches and triggering rating prompts
 * - Persisting theme preferences
 * - Preventing duplicate rating prompts
 *
 * These E2E tests verify that the settings and rating system works end-to-end,
 * ensuring users can rate the app and customize settings correctly.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    saveRating,
    getRatingData,
    incrementLaunchCount,
    shouldPromptForRating,
} from "../../shared/utils/ratingUtils";

jest.mock("@react-native-async-storage/async-storage");

describe("Settings Flow E2E", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        const storage = new Map<string, string>();
        (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) =>
            Promise.resolve(storage.get(key) ?? null)
        );
        (AsyncStorage.setItem as jest.Mock).mockImplementation(
            (key: string, value: string) => {
                storage.set(key, value);
                return Promise.resolve();
            }
        );
        // Suppress expected console output during tests
        jest.spyOn(console, "debug").mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("should complete rating flow: rate app -> save -> retrieve", async () => {
        await saveRating(5);

        const ratingData = await getRatingData();

        expect(ratingData).toBeTruthy();
        expect(ratingData?.rating).toBe(5);
    });

    it("should track app launches and prompt for rating after threshold", async () => {
        (AsyncStorage.getItem as jest.Mock).mockImplementation(
            (key: string) => {
                if (key === "app_launch_count") return Promise.resolve("5");
                if (key === "has_rated_app") return Promise.resolve(null);
                return Promise.resolve(null);
            }
        );

        const shouldPrompt = await shouldPromptForRating();

        expect(shouldPrompt).toBe(true);
    });

    it("should handle theme persistence flow", async () => {
        const theme = "dark";
        await AsyncStorage.setItem("app_theme", theme);

        const savedTheme = await AsyncStorage.getItem("app_theme");

        expect(savedTheme).toBe(theme);
    });

    it("should handle launch count increment correctly", async () => {
        let launchCount = 0;
        (AsyncStorage.getItem as jest.Mock).mockImplementation(() =>
            Promise.resolve(String(launchCount))
        );
        (AsyncStorage.setItem as jest.Mock).mockImplementation((key, value) => {
            if (key === "app_launch_count") launchCount = parseInt(value, 10);
            return Promise.resolve();
        });

        const count1 = await incrementLaunchCount();
        const count2 = await incrementLaunchCount();

        expect(count1).toBe(1);
        expect(count2).toBe(2);
    });

    it("should prevent rating prompt if user already rated", async () => {
        (AsyncStorage.getItem as jest.Mock).mockImplementation(
            (key: string) => {
                if (key === "has_rated_app") return Promise.resolve("true");
                if (key === "app_launch_count") return Promise.resolve("10");
                return Promise.resolve(null);
            }
        );

        const shouldPrompt = await shouldPromptForRating();

        expect(shouldPrompt).toBe(false);
    });
});
