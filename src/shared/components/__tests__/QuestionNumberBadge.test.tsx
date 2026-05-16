import React from "react";
import { render } from "@testing-library/react-native";
import QuestionNumberBadge from "../QuestionNumberBadge";

jest.mock("../../contexts/ThemeContext", () => ({
    useTheme: () => ({
        theme: {
            colors: {
                primary: "#0055ff",
                divider: "#eeeeee",
                text: "#111111",
                buttonText: "#ffffff",
            },
        },
    }),
}));

describe("QuestionNumberBadge", () => {
    it("renders two-digit list values", () => {
        const { getByText } = render(<QuestionNumberBadge value={42} />);
        expect(getByText("42")).toBeTruthy();
    });

    it("renders three-digit list values", () => {
        const { getByText } = render(<QuestionNumberBadge value={358} />);
        expect(getByText("358")).toBeTruthy();
    });

    it("renders modal variant when selected", () => {
        const { getByText } = render(
            <QuestionNumberBadge value={12} variant="modal" selected />
        );
        expect(getByText("12")).toBeTruthy();
    });
});
