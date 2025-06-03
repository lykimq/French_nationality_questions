import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView, TouchableWithoutFeedback, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MultiLangText } from '../contexts/LanguageContext';
import { getImageSource as loadImageSource, getCachedImageSource } from '../utils/imageUtils';

type QuestionCardProps = {
    id: number;
    question: string | MultiLangText;
    explanation: string | MultiLangText;
    language?: 'fr' | 'vi';
    image?: string | null;
    alwaysExpanded?: boolean;
};

const QuestionCard: React.FC<QuestionCardProps> = ({
    id,
    question,
    explanation,
    language = 'fr',
    image,
    alwaysExpanded = false,
}) => {
    const [expanded, setExpanded] = useState(alwaysExpanded);
    const [showBothLanguages, setShowBothLanguages] = useState(true);
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);
    const [imageSource, setImageSource] = useState<any>(null);

    const isMultilingual = typeof question !== 'string';

    // Load Firebase image when component mounts or image changes
    useEffect(() => {
        let isMounted = true;

        const loadImage = async () => {
            if (!image) {
                setImageSource(null);
                setImageLoading(false);
                return;
            }

            setImageLoading(true);
            setImageError(false);

            try {
                // First try to get cached image source for immediate display
                const cachedSource = getCachedImageSource(image);
                if (cachedSource && isMounted) {
                    setImageSource(cachedSource);
                    setImageLoading(false);
                    return;
                }

                // If not cached, load from Firebase
                const source = await loadImageSource(image);
                if (isMounted) {
                    if (source) {
                        setImageSource(source);
                        setImageLoading(false);
                    } else {
                        setImageError(true);
                        setImageLoading(false);
                        setImageSource(null);
                    }
                }
            } catch (error) {
                console.error('Error loading image:', error);
                if (isMounted) {
                    setImageError(true);
                    setImageLoading(false);
                    setImageSource(null);
                }
            }
        };

        loadImage();

        return () => {
            isMounted = false;
        };
    }, [image]);

    const getQuestionText = (lang: 'fr' | 'vi') => {
        if (typeof question === 'string') {
            return question;
        }
        return question[lang];
    };

    const getExplanationText = (lang: 'fr' | 'vi') => {
        if (typeof explanation === 'string') {
            return explanation;
        }
        return explanation[lang];
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
        setExpanded(!expanded);
    };

    const toggleLanguage = () => {
        setShowBothLanguages(!showBothLanguages);
    };

    const handleImageError = () => {
        console.log('Image failed to render:', image);
        setImageError(true);
        setImageLoading(false);
    };

    const handleImageLoad = () => {
        setImageLoading(false);
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
            >
                <View style={styles.idContainer}>
                    <Text style={styles.id}>{id}</Text>
                </View>
                <View style={styles.questionContainer}>
                    <Text style={styles.question} numberOfLines={expanded ? 0 : 2}>
                        {getQuestionText('fr')}
                    </Text>
                    {isMultilingual && language === 'vi' && (
                        <Text style={styles.translation} numberOfLines={expanded ? 0 : 1}>
                            {getQuestionText('vi')}
                        </Text>
                    )}
                </View>
                <View style={styles.iconContainer}>
                    <Ionicons
                        name={expanded ? 'chevron-up' : 'chevron-down'}
                        size={24}
                        color="#3F51B5"
                    />
                </View>
            </Pressable>

            {expanded && (
                <TouchableWithoutFeedback onPress={toggleExpand}>
                    <View style={styles.expandedContent}>
                        {isMultilingual}

                        {/* Display image if available */}
                        {image && !imageError && (
                            <View style={styles.imageContainer}>
                                {imageLoading && (
                                    <View style={styles.imageLoading}>
                                        <ActivityIndicator size="large" color="#3F51B5" />
                                        <Text style={styles.loadingText}>
                                            {language === 'fr' ? "Chargement de l'image..." : "Đang tải hình ảnh..."}
                                        </Text>
                                    </View>
                                )}
                                {imageSource && (
                                    <Image
                                        source={imageSource}
                                        style={[styles.image, imageLoading && styles.hiddenImage]}
                                        resizeMode="contain"
                                        onError={handleImageError}
                                        onLoad={handleImageLoad}
                                    />
                                )}
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

                        {getExplanationText('fr') !== "" && (
                            <ScrollView
                                style={styles.explanationScrollView}
                                contentContainerStyle={styles.scrollContent}
                                showsVerticalScrollIndicator={true}
                                nestedScrollEnabled={true}
                                onTouchStart={(e) => e.stopPropagation()}
                            >
                                <View style={styles.section}>
                                    <Text style={styles.sectionTitle}>Explication:</Text>
                                    <Text style={[styles.sectionContent, styles.explanationText]}>
                                        {formatExplanation(getExplanationText('fr'))}
                                    </Text>

                                    {isMultilingual && showBothLanguages && language === 'vi' && getExplanationText('vi') !== "" && (
                                        <>
                                            <Text style={[styles.sectionTitle, styles.secondLanguageTitle]}>Giải thích:</Text>
                                            <Text style={[styles.sectionContent, styles.explanationText]}>
                                                {formatExplanation(getExplanationText('vi'))}
                                            </Text>
                                        </>
                                    )}
                                </View>
                            </ScrollView>
                        )}
                    </View>
                </TouchableWithoutFeedback>
            )}

            {/* Add a clickable overlay to the unexpanded card */}
            {!expanded && (
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
    secondLanguageTitle: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#E0E0FF',
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
    explanationScrollView: {
        borderWidth: 1,
        borderColor: '#E0E0FF',
        borderRadius: 8,
        marginBottom: 8,
    },
    scrollContent: {
        padding: 10,
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
    loadingText: {
        color: '#3F51B5',
        fontSize: 14,
        marginTop: 8,
    },
    imageFallback: {
        marginBottom: 12,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        height: 120,
    },
    imageFallbackText: {
        marginTop: 8,
        color: '#999',
        fontSize: 14,
        textAlign: 'center',
    },
});

export default QuestionCard;