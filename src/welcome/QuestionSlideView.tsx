import React, { useState, useCallback, useMemo, useLayoutEffect } from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "../shared/contexts/ThemeContext";
import { useMastery } from "../shared/contexts/MasteryContext";
import {
    getMasteryForQuestionId,
    MasteryLevel,
} from "../shared/utils/MasteryUtils";
import { resolveQuestionIndex } from "../shared/utils/questionUtils";
import { QuestionSlideViewProps } from "../types";
import { SlideQuestionView } from "../shared/components";
import { FormattedText } from "../shared/components";

const QuestionSlideView: React.FC<QuestionSlideViewProps> = ({
    questions,
    initialIndex = 0,
    focusQuestionId = null,
}) => {
    const { theme } = useTheme();
    const { masteryMap } = useMastery();

    const resolvedIndex = useMemo(
        () =>
            resolveQuestionIndex(questions, {
                questionId: focusQuestionId,
                initialIndex,
            }),
        [questions, focusQuestionId, initialIndex]
    );

    const [currentIndex, setCurrentIndex] = useState(resolvedIndex);

    useLayoutEffect(() => {
        setCurrentIndex(resolvedIndex);
    }, [resolvedIndex]);

    const handleNext = useCallback(() => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex((prev) => prev + 1);
        }
    }, [currentIndex, questions.length]);

    const handlePrevious = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex((prev) => prev - 1);
        }
    }, [currentIndex]);

    const handleGoToIndex = useCallback(
        (index: number) => {
            if (index >= 0 && index < questions.length) {
                setCurrentIndex(index);
            }
        },
        [questions.length]
    );

    if (!questions || questions.length === 0) {
        return (
            <View
                style={[
                    styles.container,
                    { backgroundColor: theme.colors.background },
                ]}
            >
                <FormattedText style={{ color: theme.colors.text }}>
                    No questions available
                </FormattedText>
            </View>
        );
    }

    const currentQuestion = questions[currentIndex];
    const mastery = currentQuestion
        ? getMasteryForQuestionId(masteryMap, currentQuestion.id)
        : undefined;
    const masteryLevel: MasteryLevel | undefined = mastery?.level;

    return (
        <SlideQuestionView
            key={String(currentQuestion?.id ?? currentIndex)}
            question={currentQuestion}
            currentIndex={currentIndex}
            totalCount={questions.length}
            questions={questions}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onGoToIndex={handleGoToIndex}
            hasNext={currentIndex < questions.length - 1}
            hasPrevious={currentIndex > 0}
            masteryLevel={masteryLevel}
        />
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});

export default QuestionSlideView;
