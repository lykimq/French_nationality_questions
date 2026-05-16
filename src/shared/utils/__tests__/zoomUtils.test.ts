import {
    clampScale,
    nextZoomInScale,
    nextZoomOutScale,
    isZoomedIn,
    getTouchDistance,
    scaleFromPinch,
    scaleFromPinchGesture,
    DEFAULT_MAX_SCALE,
} from "../zoomUtils";

describe("zoomUtils", () => {
    describe("clampScale", () => {
        it("clamps below minimum", () => {
            expect(clampScale(0.5)).toBe(1);
        });

        it("clamps above maximum", () => {
            expect(clampScale(5)).toBe(DEFAULT_MAX_SCALE);
        });
    });

    describe("nextZoomInScale", () => {
        it("increases scale by step", () => {
            expect(nextZoomInScale(1)).toBe(1.5);
        });

        it("does not exceed max scale", () => {
            expect(nextZoomInScale(DEFAULT_MAX_SCALE)).toBe(DEFAULT_MAX_SCALE);
        });
    });

    describe("nextZoomOutScale", () => {
        it("decreases scale by step", () => {
            expect(nextZoomOutScale(2)).toBe(1.5);
        });

        it("does not go below minimum scale", () => {
            expect(nextZoomOutScale(1)).toBe(1);
        });
    });

    describe("isZoomedIn", () => {
        it("returns false at 1x", () => {
            expect(isZoomedIn(1)).toBe(false);
        });

        it("returns true above 1x", () => {
            expect(isZoomedIn(1.1)).toBe(true);
        });
    });

    describe("getTouchDistance", () => {
        it("returns null for a single touch", () => {
            expect(getTouchDistance([{ pageX: 0, pageY: 0 }])).toBeNull();
        });

        it("returns distance between two touches", () => {
            expect(
                getTouchDistance([
                    { pageX: 0, pageY: 0 },
                    { pageX: 3, pageY: 4 },
                ])
            ).toBe(5);
        });
    });

    describe("scaleFromPinch", () => {
        it("scales proportionally to pinch distance", () => {
            expect(scaleFromPinch(100, 200, 1)).toBe(2);
        });

        it("clamps to max scale", () => {
            expect(scaleFromPinch(100, 400, 1)).toBe(DEFAULT_MAX_SCALE);
        });
    });

    describe("scaleFromPinchGesture", () => {
        it("scales from gesture multiplier", () => {
            expect(scaleFromPinchGesture(1, 2)).toBe(2);
        });

        it("clamps to max scale", () => {
            expect(scaleFromPinchGesture(1, 4)).toBe(DEFAULT_MAX_SCALE);
        });
    });
});
