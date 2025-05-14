import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Animated, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type MultiLangText = {
    fr: string;
    vi: string;
};

type QuestionCardProps = {
    id: number;
    question: MultiLangText;
    answer?: MultiLangText;
    explanation: MultiLangText;
    language?: 'fr' | 'vi';  // Added language prop to control which language to display
};

const QuestionCard: React.FC<QuestionCardProps> = ({
    id,
    question,
    answer,
    explanation,
    language = 'fr',  // Default to French if not specified
}) => {
    const [expanded, setExpanded] = useState(false);
    const [animation] = useState(new Animated.Value(0));
    const [pressed, setPressed] = useState(false);
    const [showBothLanguages, setShowBothLanguages] = useState(true);  // Toggle to show both languages

    const toggleExpand = () => {
        const toValue = expanded ? 0 : 1;

        Animated.timing(animation, {
            toValue,
            duration: 300,
            useNativeDriver: false,
        }).start();

        setExpanded(!expanded);
    };

    const toggleLanguage = () => {
        setShowBothLanguages(!showBothLanguages);
    };

    const heightInterpolate = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 500],  // You might need to adjust this value
    });

    const animatedStyle = {
        height: heightInterpolate,
        opacity: animation,
    };

    return (
        <View style={[styles.card, expanded && styles.cardExpanded]}>
            <Pressable
                style={({ pressed }) => [
                    styles.header,
                    pressed && styles.headerPressed
                ]}
                onPress={toggleExpand}
                android_ripple={{ color: '#E8EAF6' }}
                onPressIn={() => setPressed(true)}
                onPressOut={() => setPressed(false)}
            >
                <View style={styles.idContainer}>
                    <Text style={styles.id}>{id}</Text>
                </View>
                <View style={styles.questionContainer}>
                    <Text style={styles.question} numberOfLines={expanded ? 0 : 2}>
                        {question.fr}
                    </Text>
                    <Text style={styles.translation} numberOfLines={expanded ? 0 : 1}>
                        {question.vi}
                    </Text>
                </View>
                <View style={styles.iconContainer}>
                    <Ionicons
                        name={expanded ? 'chevron-up' : 'chevron-down'}
                        size={24}
                        color="#3F51B5"
                    />
                </View>
            </Pressable>

            <Animated.View style={[styles.expandedContent, animatedStyle]}>
                {expanded && (
                    <Pressable
                        style={styles.languageToggle}
                        onPress={toggleLanguage}
                    >
                        <Text style={styles.languageToggleText}>
                            {showBothLanguages ? "Afficher une seule langue" : "Afficher les deux langues"}
                        </Text>
                    </Pressable>
                )}

                {answer && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Réponse:</Text>
                        <Text style={styles.sectionContent}>{answer.fr}</Text>

                        {showBothLanguages && (
                            <>
                                <Text style={styles.sectionTitle}>Trả lời:</Text>
                                <Text style={styles.sectionContent}>{answer.vi}</Text>
                            </>
                        )}
                    </View>
                )}

                {explanation.fr !== "" && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Explication:</Text>
                        <Text style={styles.sectionContent}>{explanation.fr}</Text>

                        {showBothLanguages && explanation.vi !== "" && (
                            <>
                                <Text style={styles.sectionTitle}>Giải thích:</Text>
                                <Text style={styles.sectionContent}>{explanation.vi}</Text>
                            </>
                        )}
                    </View>
                )}
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 10,
        marginBottom: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        overflow: 'hidden',
    },
    cardExpanded: {
        elevation: 3,
        shadowOpacity: 0.15,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 2 },
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff',
    },
    headerPressed: {
        backgroundColor: '#F5F7FF',
    },
    idContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#3F51B5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    id: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    questionContainer: {
        flex: 1,
        paddingRight: 8,
    },
    question: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    translation: {
        fontSize: 14,
        color: '#666',
        fontStyle: 'italic',
    },
    iconContainer: {
        width: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    expandedContent: {
        overflow: 'hidden',
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    section: {
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#3F51B5',
        marginBottom: 4,
    },
    sectionContent: {
        fontSize: 14,
        color: '#444',
        lineHeight: 20,
    },
    languageToggle: {
        padding: 8,
        marginBottom: 8,
        backgroundColor: '#F0F2FF',
        borderRadius: 4,
        alignItems: 'center',
    },
    languageToggleText: {
        color: '#3F51B5',
        fontWeight: '500',
    },
});

export default QuestionCard;