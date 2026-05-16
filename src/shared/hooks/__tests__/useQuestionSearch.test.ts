import {
    SEARCH_LIVE_OPTIONS,
    SEARCH_TAB_OPTIONS,
    mergeSearchOptions,
} from "../searchHookConfig";

describe("useQuestionSearch presets", () => {
    it("SEARCH_TAB_OPTIONS enables filters, history, and suggestions", () => {
        expect(SEARCH_TAB_OPTIONS.debounceMs).toBe(150);
        expect(SEARCH_TAB_OPTIONS.features).toEqual({
            filters: true,
            history: true,
            suggestions: true,
        });
    });

    it("SEARCH_LIVE_OPTIONS uses results-only defaults", () => {
        expect(SEARCH_LIVE_OPTIONS.debounceMs).toBe(200);
        expect(SEARCH_LIVE_OPTIONS.features).toBeUndefined();
    });
});

describe("mergeSearchOptions", () => {
    it("merges debounce and feature flags without dropping base features", () => {
        expect(
            mergeSearchOptions(SEARCH_TAB_OPTIONS, {
                debounceMs: 100,
                features: { history: false },
            })
        ).toEqual({
            debounceMs: 100,
            features: {
                filters: true,
                history: false,
                suggestions: true,
            },
        });
    });

    it("applies live preset overrides for custom debounce", () => {
        expect(
            mergeSearchOptions(SEARCH_LIVE_OPTIONS, { debounceMs: 300 })
        ).toEqual({
            debounceMs: 300,
            features: {
                filters: false,
                history: false,
                suggestions: false,
            },
        });
    });
});
