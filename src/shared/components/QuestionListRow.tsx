import React from "react";
import {
    StyleSheet,
    View,
    TouchableOpacity,
    ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import FormattedText from "./FormattedText";
import QuestionNumberBadge from "./QuestionNumberBadge";
import { useTheme } from "../contexts/ThemeContext";

export interface QuestionListRowProps {
    number: number | string;
    question: string;
    onPress: () => void;
    borderBottomColor?: string;
    header?: React.ReactNode;
    numberOfLines?: number;
    style?: ViewStyle;
}

const QuestionListRow: React.FC<QuestionListRowProps> = ({
    number,
    question,
    onPress,
    borderBottomColor,
    header,
    numberOfLines = 2,
    style,
}) => {
    const { theme } = useTheme();
    const dividerColor = borderBottomColor ?? theme.colors.divider;

    return (
        <TouchableOpacity
            style={[styles.row, { borderBottomColor: dividerColor }, style]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <QuestionNumberBadge value={number} />
            <View style={styles.content}>
                {header}
                <FormattedText
                    style={[styles.questionText, { color: theme.colors.text }]}
                    numberOfLines={numberOfLines}
                >
                    {question}
                </FormattedText>
            </View>
            <Ionicons
                name="chevron-forward"
                size={20}
                color={theme.colors.textMuted}
            />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 15,
        borderBottomWidth: 1,
        gap: 15,
    },
    content: {
        flex: 1,
    },
    questionText: {
        fontSize: 15,
        lineHeight: 20,
    },
});

export default QuestionListRow;
