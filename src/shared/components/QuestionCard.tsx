import React, { useMemo, useState } from "react";
import { StyleSheet, View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { formatExplanation } from "../utils";
import FormattedText from "./FormattedText";
import SpeakButton from "./SpeakButton";
import Icon3D from "./Icon3D";
import QuestionNumberBadge from "./QuestionNumberBadge";
import QuestionImage from "./QuestionImage";
import { useTheme } from "../contexts/ThemeContext";
import { useIcons } from "../contexts/IconContext";
import { QuestionCardProps } from "../../types";
import { sharedStyles } from "../utils";

const QuestionCard: React.FC<QuestionCardProps> = ({
    id,
    question,
    explanation,
    image,
    alwaysExpanded = false,
}) => {
    const [expanded, setExpanded] = useState(alwaysExpanded);
    const { theme } = useTheme();
    const { getIconName, getIconVariant } = useIcons();
    const isExpanded = alwaysExpanded ? true : expanded;

    const toggleExpand = () => {
        if (!alwaysExpanded) {
            setExpanded(!expanded);
        }
    };

    const displayId = useMemo(() => {
        if (typeof id === "string") {
            const numeric = id.match(/\d+/);
            return numeric ? numeric[0] : id;
        }
        return String(id);
    }, [id]);

    const questionText = question ?? "";
    const explanationText = explanation ?? "";

    return (
        <View
            style={[
                styles.card,
                sharedStyles.mediumShadow,
                {
                    backgroundColor: theme.colors.card,
                    borderColor: theme.colors.questionCardBorder,
                    borderWidth: 1,
                },
                isExpanded && styles.cardExpanded,
                isExpanded && {
                    borderColor: theme.colors.primary + "40",
                    elevation: 6,
                },
            ]}
        >
            <View
                style={[
                    styles.header,
                    { backgroundColor: theme.colors.questionCardBackground },
                ]}
            >
                <Pressable
                    style={({ pressed }) => [
                        styles.headerPressable,
                        pressed &&
                            !alwaysExpanded && [
                                styles.headerPressed,
                                { backgroundColor: theme.colors.primary + "10" },
                            ],
                    ]}
                    onPress={toggleExpand}
                    android_ripple={
                        !alwaysExpanded
                            ? { color: theme.colors.primary + "20" }
                            : undefined
                    }
                    disabled={alwaysExpanded}
                >
                    <QuestionNumberBadge
                        value={displayId}
                        style={styles.idBadge}
                    />
                    <View style={styles.questionContainer}>
                        <FormattedText
                            style={[
                                styles.question,
                                styles.questionTextFlex,
                                { color: theme.colors.text },
                            ]}
                            numberOfLines={isExpanded ? 0 : 2}
                        >
                            {questionText}
                        </FormattedText>
                    </View>
                    {!alwaysExpanded && (
                        <View style={styles.iconContainer}>
                            <Icon3D
                                name={
                                    isExpanded
                                        ? getIconName("chevronUp")
                                        : getIconName("chevronDown")
                                }
                                size={20}
                                color={theme.colors.primary}
                                variant={
                                    isExpanded
                                        ? getIconVariant("chevronUp")
                                        : getIconVariant("chevronDown")
                                }
                            />
                        </View>
                    )}
                </Pressable>
                {questionText !== "" && (
                    <SpeakButton
                        text={questionText}
                        accessibilityLabel="Écouter la question"
                        style={styles.speakButton}
                    />
                )}
            </View>

            {isExpanded && (
                <View
                    style={[
                        styles.expandedContent,
                        {
                            backgroundColor:
                                theme.colors.questionCardBackground,
                        },
                    ]}
                >
                    <QuestionImage
                        image={image}
                        enableFullscreen
                        showExpandOverlay
                        showLoadingText
                    />

                    {explanationText !== "" && (
                        <View style={styles.explanationContainer}>
                            <View
                                style={[
                                    styles.section,
                                    {
                                        borderLeftWidth: 4,
                                        borderLeftColor: theme.colors.primary,
                                        backgroundColor:
                                            theme.colors.primary + "08",
                                        padding: 16,
                                        borderRadius: 8,
                                    },
                                ]}
                            >
                                <View style={styles.explanationHeader}>
                                    <View style={sharedStyles.row}>
                                        <Ionicons
                                            name="information-circle"
                                            size={18}
                                            color={theme.colors.primary}
                                            style={{ marginRight: 6 }}
                                        />
                                        <FormattedText
                                            style={[
                                                styles.sectionTitle,
                                                {
                                                    color: theme.colors.primary,
                                                    fontSize: 13,
                                                    letterSpacing: 1,
                                                    fontWeight: "800",
                                                },
                                            ]}
                                        >
                                            EXPLICATION
                                        </FormattedText>
                                    </View>
                                    <SpeakButton
                                        text={explanationText}
                                        accessibilityLabel="Écouter l'explication"
                                    />
                                </View>
                                <FormattedText
                                    style={[
                                        styles.sectionContent,
                                        styles.explanationText,
                                        {
                                            color: theme.colors.text,
                                            lineHeight: 24,
                                            marginTop: 8,
                                        },
                                    ]}
                                >
                                    {formatExplanation(explanationText)}
                                </FormattedText>
                            </View>
                        </View>
                    )}
                </View>
            )}

            {/* Add a clickable overlay to the unexpanded card if not always expanded */}
            {!isExpanded && (
                <Pressable
                    style={styles.overlay}
                    onPress={toggleExpand}
                    android_ripple={{
                        color: theme.colors.primary + "20",
                        borderless: true,
                    }}
                />
            )}

        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    cardExpanded: {
        elevation: 3,
        shadowOpacity: 0.15,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 2 },
    },
    header: {
        flexDirection: "row",
        alignItems: "flex-start",
    },
    headerPressable: {
        flex: 1,
        ...sharedStyles.spaceBetween,
        alignItems: "flex-start",
    },
    headerPressed: {
        borderRadius: 8,
    },
    idBadge: {
        marginRight: 12,
    },
    questionContainer: {
        flex: 1,
        marginRight: 8,
    },
    speakButton: {
        marginTop: 2,
        marginLeft: 4,
    },
    explanationHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    question: {
        fontSize: 16,
        fontWeight: "600",
        lineHeight: 22,
    },
    questionTextFlex: {
        flex: 1,
    },
    iconContainer: {
        padding: 4,
    },
    expandedContent: {
        marginTop: 8,
        paddingTop: 20,
    },
    explanationContainer: {
        marginBottom: 8,
    },
    section: {
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 8,
    },
    sectionContent: {
        fontSize: 14,
        lineHeight: 20,
    },
    explanationText: {
        textAlign: "justify",
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
    },
});

export default QuestionCard;
