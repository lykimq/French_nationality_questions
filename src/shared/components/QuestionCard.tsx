import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Pressable, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getImageSource as loadImageSource, getCachedImageSource, getQuestionText, getExplanationText, formatExplanation } from '../utils';
import ImageModal from './ImageModal';
import FormattedText from './FormattedText';
import { useTheme } from '../contexts/ThemeContext';
import { QuestionCardProps } from '../../types';
import { sharedStyles } from '../utils';

const QuestionCard: React.FC<QuestionCardProps> = ({
    id,
    question,
    explanation,
    image,
    alwaysExpanded = false,
}) => {
    console.log('[QuestionCard] Render - id:', id, 'question length:', question?.length || 0, 'explanation length:', explanation?.length || 0, 'alwaysExpanded:', alwaysExpanded);
    console.log('[QuestionCard] Props received:', {
        id,
        question: question?.substring(0, 50),
        explanation: explanation?.substring(0, 50),
        image,
        alwaysExpanded
    });

    const [expanded, setExpanded] = useState(alwaysExpanded);
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);
    const [imageSource, setImageSource] = useState<any>(null);
    const [isImageModalVisible, setIsImageModalVisible] = useState(false);
    const { theme } = useTheme();

    const isExpanded = alwaysExpanded ? true : expanded;

    console.log('[QuestionCard] State - expanded:', expanded, 'alwaysExpanded:', alwaysExpanded, 'isExpanded (computed):', isExpanded);

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
                console.error('Error loading image for question', id, ':', image, error);
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
    }, [image, id]);


    const toggleExpand = () => {
        setExpanded(!expanded);
    };

    const handleImageError = () => {
        setImageError(true);
        setImageLoading(false);
    };

    const handleImageLoad = () => {
        setImageLoading(false);
    };

    const handleImagePress = () => {
        if (imageSource && !imageError && !imageLoading) {
            setIsImageModalVisible(true);
        }
    };

    const closeImageModal = () => {
        setIsImageModalVisible(false);
    };

    console.log('[QuestionCard] Rendering card - isExpanded:', isExpanded, 'expanded state:', expanded);

    return (
        <View style={[
            styles.card,
            sharedStyles.mediumShadow,
            {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.questionCardBorder,
                borderWidth: 1,
            },
            isExpanded && styles.cardExpanded
        ]}>
            <Pressable
                style={({ pressed }) => [
                    styles.header,
                    { backgroundColor: theme.colors.questionCardBackground },
                    pressed && [styles.headerPressed, { backgroundColor: theme.colors.primary + '10' }]
                ]}
                onPress={toggleExpand}
                android_ripple={{ color: theme.colors.primary + '20' }}
            >
                <View style={[styles.idContainer, { backgroundColor: theme.colors.primary }]}>
                    <FormattedText style={[styles.id, { color: theme.colors.buttonText }]}>{id}</FormattedText>
                </View>
                <View style={styles.questionContainer}>
                    {(() => {
                        const questionText = getQuestionText(question);
                        console.log('[QuestionCard] Rendering question text - length:', questionText.length, 'preview:', questionText.substring(0, 50), 'isExpanded:', isExpanded);
                        return (
                            <FormattedText style={[styles.question, { color: theme.colors.text }]} numberOfLines={isExpanded ? 0 : 2}>
                                {questionText}
                            </FormattedText>
                        );
                    })()}
                </View>
                <View style={styles.iconContainer}>
                    <Ionicons
                        name={isExpanded ? theme.icons.chevronUp as any : theme.icons.chevronDown as any}
                        size={24}
                        color={theme.colors.primary}
                    />
                </View>
            </Pressable>

            {isExpanded && (
                <View style={[styles.expandedContent, { backgroundColor: theme.colors.questionCardBackground }]}>
                    {/* Display image if available */}
                    {image && !imageError && (
                        <TouchableOpacity
                            style={[styles.imageContainer, { borderColor: theme.colors.border }]}
                            onPress={handleImagePress}
                            activeOpacity={0.9}
                        >
                            {imageLoading && (
                                <View style={[styles.imageLoading, { backgroundColor: theme.colors.surface }]}>
                                    <ActivityIndicator size="large" color={theme.colors.primary} />
                                    <FormattedText style={[styles.loadingText, { color: theme.colors.text }]}>
                                        Chargement de l'image...
                                    </FormattedText>
                                </View>
                            )}
                            {imageSource && (
                                <>
                                    <Image
                                        source={imageSource}
                                        style={[styles.image, imageLoading && styles.hiddenImage]}
                                        resizeMode="contain"
                                        onError={handleImageError}
                                        onLoad={handleImageLoad}
                                    />
                                    <View style={styles.imageOverlay}>
                                        <Ionicons name={theme.icons.expand as any} size={24} color="#FFFFFF" />
                                    </View>
                                </>
                            )}
                        </TouchableOpacity>
                    )}

                    {/* Display fallback if image fails to load */}
                    {image && imageError && (
                        <View style={[styles.imageFallback, { backgroundColor: theme.colors.surface }]}>
                            <Ionicons name={theme.icons.image as any} size={40} color={theme.colors.textMuted} />
                            <FormattedText style={[styles.imageFallbackText, { color: theme.colors.textMuted }]}>
                                Image non disponible
                            </FormattedText>
                        </View>
                    )}

                    {(() => {
                        const explanationText = getExplanationText(explanation);
                        console.log('[QuestionCard] Rendering explanation - length:', explanationText.length, 'isEmpty:', explanationText === '');
                        if (explanationText !== "") {
                            return (
                                <View style={styles.explanationContainer}>
                                    <View style={styles.section}>
                                        <FormattedText style={[styles.sectionTitle, { color: theme.colors.primary }]}>Explication:</FormattedText>
                                        <FormattedText style={[styles.sectionContent, styles.explanationText, { color: theme.colors.text }]}>
                                            {formatExplanation(explanationText)}
                                        </FormattedText>
                                    </View>
                                </View>
                            );
                        }
                        console.warn('[QuestionCard] Explanation is empty, not rendering explanation section');
                        return null;
                    })()}
                </View>
            )}

            {/* Add a clickable overlay to the unexpanded card */}
            {!expanded && (
                <Pressable
                    style={styles.overlay}
                    onPress={toggleExpand}
                    android_ripple={{ color: theme.colors.primary + '20', borderless: true }}
                />
            )}

            {/* Image Modal */}
            <ImageModal
                key={image || 'no-image'}
                visible={isImageModalVisible}
                imageSource={imageSource}
                onClose={closeImageModal}
            />
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
        ...sharedStyles.spaceBetween,
        marginBottom: 12,
    },
    headerPressed: {
        // backgroundColor will be set dynamically
    },
    idContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    id: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    questionContainer: {
        flex: 1,
        marginRight: 8,
    },
    question: {
        fontSize: 16,
        fontWeight: '600',
        lineHeight: 22,
    },
    translation: {
        fontSize: 14,
        marginTop: 4,
        fontStyle: 'italic',
        lineHeight: 20,
    },
    iconContainer: {
        padding: 4,
    },
    expandedContent: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    imageContainer: {
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 16,
        borderWidth: 1,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: 200,
        backgroundColor: '#f5f5f5',
    },
    hiddenImage: {
        opacity: 0,
    },
    imageOverlay: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: 20,
        padding: 8,
    },
    imageLoading: {
        width: '100%',
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
    },
    loadingText: {
        marginTop: 8,
        fontSize: 14,
    },
    imageFallback: {
        width: '100%',
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderRadius: 8,
    },
    imageFallbackText: {
        marginTop: 8,
        fontSize: 14,
        textAlign: 'center',
    },
    explanationContainer: {
        marginBottom: 16,
    },
    section: {
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    sectionContent: {
        fontSize: 14,
        lineHeight: 20,
    },
    explanationText: {
        textAlign: 'justify',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
    },
});

export default QuestionCard;