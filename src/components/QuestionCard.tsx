import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView, Image, ActivityIndicator, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MultiLangText } from '../contexts/LanguageContext';
import { getImageSource as loadImageSource } from '../utils/imageUtils';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type QuestionCardProps = {
    id: number;
    question: string | MultiLangText;
    answer?: string | MultiLangText;
    explanation: string | MultiLangText;
    language?: 'fr' | 'vi';
    image?: string | null;
    alwaysExpanded?: boolean;
};

const QuestionCard: React.FC<QuestionCardProps> = ({
    id,
    question,
    answer,
    explanation,
    language = 'fr',
    image,
    alwaysExpanded = false,
}) => {
    const [expanded, setExpanded] = useState(alwaysExpanded);
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);

    const isMultilingual = typeof question === 'object' || typeof answer === 'object' || typeof explanation === 'object';

    const getQuestionText = (lang: 'fr' | 'vi') => {
        if (typeof question === 'object') {
            return lang === 'fr' ? question.fr : question.vi;
        }
        return question;
    };

    const getAnswerText = (lang: 'fr' | 'vi') => {
        if (!answer) return '';
        if (typeof answer === 'object') {
            return lang === 'fr' ? answer.fr : answer.vi;
        }
        return answer;
    };

    const getExplanationText = (lang: 'fr' | 'vi') => {
        if (typeof explanation === 'object') {
            return lang === 'fr' ? explanation.fr : explanation.vi;
        }
        return explanation;
    };

    const formatExplanation = (text: string) => {
        if (!text) return '';

        let formatted = text
            .replace(/\. /g, '. \n\n')
            .replace(/\! /g, '! \n\n')
            .replace(/\? /g, '? \n\n')
            .replace(/\[(.*?)\]/g, '\n→ $1 ←\n')
            .replace(/\n\n+/g, '\n\n')
            .trim();

        return formatted;
    };

    const toggleExpand = () => {
        if (!alwaysExpanded) {
            setExpanded(!expanded);
        }
    };

    const handleImageError = () => {
        console.log('Image failed to load:', image);
        setImageError(true);
        setImageLoading(false);
    };

    const handleImageLoad = () => {
        setImageLoading(false);
    };

    const getImageSource = () => {
        try {
            const source = image ? loadImageSource(image) : null;
            if (!source) {
                setImageError(true);
            }
            return source;
        } catch (error) {
            console.error('Error loading image:', error);
            setImageError(true);
            return null;
        }
    };

    const shouldShowContent = expanded || alwaysExpanded;

    const renderContent = (lang: 'fr' | 'vi', showTitle: boolean = true) => (
        <View style={styles.contentSection}>
            {showTitle && (
                <View style={styles.languageHeader}>
                    <Text style={styles.languageTitle}>
                        {lang === 'fr' ? 'Français' : 'Tiếng Việt'}
                    </Text>
                </View>
            )}
            <Text style={styles.question}>
                {getQuestionText(lang)}
            </Text>
            {answer && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        {lang === 'fr' ? 'Réponse:' : 'Trả lời:'}
                    </Text>
                    <Text style={styles.sectionContent}>{getAnswerText(lang)}</Text>
                </View>
            )}
            {getExplanationText(lang) !== "" && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        {lang === 'fr' ? 'Explication:' : 'Giải thích:'}
                    </Text>
                    <Text style={[styles.sectionContent, styles.explanationText]}>
                        {formatExplanation(getExplanationText(lang))}
                    </Text>
                </View>
            )}
        </View>
    );

    return (
        <View style={[styles.card, shouldShowContent && styles.cardExpanded]}>
            <View style={[styles.header, !alwaysExpanded && styles.clickableHeader]}>
                <View style={styles.idContainer}>
                    <Text style={styles.id}>{id}</Text>
                </View>
                <View style={styles.questionContainer}>
                    <Text style={styles.question} numberOfLines={shouldShowContent ? 0 : 2}>
                        {getQuestionText(language)}
                    </Text>
                </View>
                {!alwaysExpanded && (
                    <Pressable style={styles.iconContainer} onPress={toggleExpand}>
                        <Ionicons
                            name={expanded ? 'chevron-up' : 'chevron-down'}
                            size={24}
                            color="#3F51B5"
                        />
                    </Pressable>
                )}
            </View>

            {shouldShowContent && (
                <View style={styles.expandedContent}>
                    <ScrollView
                        style={styles.contentScrollView}
                        contentContainerStyle={styles.contentScrollViewContainer}
                        showsVerticalScrollIndicator={true}
                        nestedScrollEnabled={true}
                    >
                        {/* Display image if available */}
                        {image && !imageError && (
                            <View style={styles.imageContainer}>
                                {imageLoading && (
                                    <View style={styles.imageLoading}>
                                        <ActivityIndicator size="large" color="#3F51B5" />
                                    </View>
                                )}
                                <Image
                                    source={getImageSource()}
                                    style={[styles.image, imageLoading && styles.hiddenImage]}
                                    resizeMode="contain"
                                    onError={handleImageError}
                                    onLoad={handleImageLoad}
                                />
                            </View>
                        )}

                        {/* Display fallback if image fails to load */}
                        {image && imageError && (
                            <View style={styles.imageFallback}>
                                <Ionicons name="image-outline" size={40} color="#CCCCCC" />
                                <Text style={styles.imageFallbackText}>
                                    {language === 'fr' ? "Image non disponible" : "Hình ảnh không khả dụng"}
                                </Text>
                            </View>
                        )}

                        {language === 'vi' && isMultilingual ? (
                            <>
                                {renderContent('fr', true)}
                                <View style={styles.languageDivider} />
                                {renderContent('vi', true)}
                            </>
                        ) : (
                            renderContent('fr', false)
                        )}
                    </ScrollView>
                </View>
            )}

            {/* Add a clickable overlay to the unexpanded card */}
            {!alwaysExpanded && !expanded && (
                <Pressable
                    style={styles.overlay}
                    onPress={toggleExpand}
                    android_ripple={{ color: '#E8EAF6', borderless: true }}
                />
            )}
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
        flex: 1,
    },
    cardExpanded: {
        elevation: 3,
        shadowOpacity: 0.15,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 2 },
        maxHeight: SCREEN_HEIGHT - 120, // Account for header and padding
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    clickableHeader: {
        cursor: 'pointer',
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
        marginBottom: 12,
    },
    iconContainer: {
        width: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    expandedContent: {
        flex: 1,
    },
    contentScrollView: {
        flex: 1,
    },
    contentScrollViewContainer: {
        padding: 16,
    },
    contentSection: {
        marginBottom: 16,
    },
    languageHeader: {
        backgroundColor: '#F0F2FF',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 4,
        marginBottom: 12,
    },
    languageTitle: {
        color: '#3F51B5',
        fontWeight: '600',
        fontSize: 14,
    },
    section: {
        marginBottom: 16,
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
        lineHeight: 22,
    },
    explanationText: {
        backgroundColor: '#F8F9FF',
        padding: 12,
        borderRadius: 6,
        marginVertical: 4,
    },
    languageDivider: {
        height: 1,
        backgroundColor: '#E0E0FF',
        marginVertical: 16,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'transparent',
    },
    imageContainer: {
        marginBottom: 12,
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E0E0FF',
        backgroundColor: '#F8F9FF',
        height: 200,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: 200,
        backgroundColor: 'transparent',
    },
    hiddenImage: {
        opacity: 0,
    },
    imageLoading: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    imageFallback: {
        marginBottom: 12,
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E0E0FF',
        backgroundColor: '#F8F9FF',
        height: 150,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageFallbackText: {
        color: '#888888',
        marginTop: 8,
        fontSize: 14,
    }
});

export default QuestionCard;