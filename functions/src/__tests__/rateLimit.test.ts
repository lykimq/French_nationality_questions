import { assertWithinRateLimit, resolveClientKey } from "../rateLimit";
import { HttpsError } from "firebase-functions/v2/https";

describe("rateLimit", () => {
    it("resolveClientKey prefers x-forwarded-for", () => {
        expect(resolveClientKey("10.0.0.1", "203.0.113.5, 10.0.0.1")).toBe(
            "203.0.113.5"
        );
    });

    it("resolveClientKey falls back to ip", () => {
        expect(resolveClientKey("10.0.0.1", undefined)).toBe("10.0.0.1");
    });

    it("assertWithinRateLimit allows requests under the cap", () => {
        const key = `test-allow-${Date.now()}`;
        expect(() => {
            for (let i = 0; i < 30; i++) {
                assertWithinRateLimit(key);
            }
        }).not.toThrow();
    });

    it("assertWithinRateLimit rejects above the cap", () => {
        const key = `test-reject-${Date.now()}`;
        for (let i = 0; i < 30; i++) {
            assertWithinRateLimit(key);
        }
        expect(() => assertWithinRateLimit(key)).toThrow(HttpsError);
    });
});
