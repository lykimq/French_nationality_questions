import {
    resolveImagePath,
    extractImagePathFromMarkdown,
    getQuestionImagePath,
} from "../imagePathUtils";

describe("imagePathUtils", () => {
    describe("resolveImagePath", () => {
        it("maps known aliases to bundled assets", () => {
            expect(resolveImagePath("pics/Construction_de_la_France.png")).toBe(
                "pics/Construction_de_la_France_Chronologie.png"
            );
            expect(resolveImagePath("pics/chart_elcole.png")).toBe(
                "pics/chart_ecole.png"
            );
        });

        it("returns null for empty input", () => {
            expect(resolveImagePath(null)).toBeNull();
        });
    });

    describe("getQuestionImagePath", () => {
        it("falls back to markdown image in explanation", () => {
            expect(
                getQuestionImagePath(
                    null,
                    "Text ![alt](pics/politiques.png) more"
                )
            ).toBe("pics/politiques.png");
        });
    });

    describe("extractImagePathFromMarkdown", () => {
        it("extracts the first image path", () => {
            expect(
                extractImagePathFromMarkdown("See ![x](pics/card.png) here")
            ).toBe("pics/card.png");
        });
    });
});
