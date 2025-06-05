import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Pressable, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getImageSource as loadImageSource, getCachedImageSource } from '../utils/imageUtils';
import ImageModal from './ImageModal';
import FormattedText from './FormattedText';
import { useTextFormatting } from '../contexts/TextFormattingContext';
import { useTheme } from '../contexts/ThemeContext';
import { QuestionCardProps } from '../types';

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
    const [isImageModalVisible, setIsImageModalVisible] = useState(false);
    const { theme } = useTheme();

    const isMultilingual = typeof question !== 'string';

    // Load Firebase image when component mounts or image changes
    useEffect(() => {
        let isMounted = true;

        const loadImage = async () => {
            console.log('Loading image for question', id, ':', image);

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
                    console.log('Using cached image for question', id, ':', image);
                    setImageSource(cachedSource);
                    setImageLoading(false);
                    return;
                }

                // If not cached, load from Firebase
                console.log('Loading image from Firebase for question', id, ':', image);
                const source = await loadImageSource(image);
                if (isMounted) {
                    if (source) {
                        console.log('Successfully loaded image for question', id, ':', image);
                        setImageSource(source);
                        setImageLoading(false);
                    } else {
                        console.log('Failed to load image for question', id, ':', image);
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

    const handleImagePress = () => {
        console.log('=== IMAGE PRESS DEBUG ===');
        console.log('Question ID:', id);
        console.log('Image path:', image);
        console.log('Image source:', imageSource);
        console.log('Image error:', imageError);
        console.log('Image loading:', imageLoading);
        console.log('Current modal visible:', isImageModalVisible);

        if (imageSource && !imageError && !imageLoading) {
            console.log('✅ Opening modal for image');
            setIsImageModalVisible(true);
        } else {
            console.log('❌ Cannot open modal - conditions not met');
            console.log('   - Has imageSource:', !!imageSource);
            console.log('   - Not in error state:', !imageError);
            console.log('   - Not loading:', !imageLoading);
        }
        console.log('========================');
    };

    const closeImageModal = () => {
        setIsImageModalVisible(false);
    };

    // Debug modal state changes
    useEffect(() => {
        console.log(`Modal visibility changed for question ${id}: ${isImageModalVisible}`);
    }, [isImageModalVisible, id]);

    return (
        <View style={[
            styles.card,
            { backgroundColor: theme.colors.questionCardBackground, borderColor: theme.colors.questionCardBorder },
            expanded && styles.cardExpanded
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
                    <FormattedText style={[styles.question, { color: theme.colors.text }]} numberOfLines={expanded ? 0 : 2}>
                        {getQuestionText('fr')}
                    </FormattedText>
                    {isMultilingual && language === 'vi' && (
                        <FormattedText style={[styles.translation, { color: theme.colors.textSecondary }]} numberOfLines={expanded ? 0 : 1}>
                            {getQuestionText('vi')}
                        </FormattedText>
                    )}
                </View>
                <View style={styles.iconContainer}>
                    <Ionicons
                        name={expanded ? theme.icons.chevronUp as any : theme.icons.chevronDown as any}
                        size={24}
                        color={theme.colors.primary}
                    />
                </View>
            </Pressable>

            {expanded && (
                <View style={[styles.expandedContent, { backgroundColor: theme.colors.questionCardBackground }]}>
                    {isMultilingual}

                    {/* Display image if available */}
                    {image && !imageError && (
                        <TouchableOpacity
                            style={[styles.imageContainer, { borderColor: theme.colors.border }]}
                            onPress={() => {
                                console.log('🔥 TOUCH EVENT DETECTED on image container');
                                handleImagePress();
                            }}
                            onPressIn={() => console.log('👆 Press IN detected on container')}
                            onPressOut={() => {
                                console.log('👆 Press OUT detected on container');
                                // Backup: trigger modal opening on press out if onPress doesn't work
                                setTimeout(() => {
                                    console.log('🔄 Backup trigger - opening modal from onPressOut');
                                    handleImagePress();
                                }, 100);
                            }}
                            activeOpacity={0.9}
                        >
                            {imageLoading && (
                                <View style={[styles.imageLoading, { backgroundColor: theme.colors.surface }]}>
                                    <ActivityIndicator size="large" color={theme.colors.primary} />
                                    <FormattedText style={[styles.loadingText, { color: theme.colors.text }]}>
                                        {language === 'fr' ? "Chargement de l'image..." : "Đang tải hình ảnh..."}
                                    </FormattedText>
                                </View>
                            )}
                            {imageSource && (
                                <>
                                    {console.log('🎯 Rendering image for question', id)}
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
                                {language === 'fr' ? "Image non disponible" : "Hình ảnh không khả dụng"}
                            </FormattedText>
                        </View>
                    )}

                    {getExplanationText('fr') !== "" && (
                        <View style={styles.explanationContainer}>
                            <View style={styles.section}>
                                <FormattedText style={[styles.sectionTitle, { color: theme.colors.primary }]}>Explication:</FormattedText>
                                <FormattedText style={[styles.sectionContent, styles.explanationText, { color: theme.colors.text }]}>
                                    {formatExplanation(getExplanationText('fr'))}
                                </FormattedText>

                                {isMultilingual && showBothLanguages && language === 'vi' && getExplanationText('vi') !== "" && (
                                    <>
                                        <FormattedText style={[styles.sectionTitle, styles.secondLanguageTitle, { color: theme.colors.primary }]}>Giải thích:</FormattedText>
                                        <FormattedText style={[styles.sectionContent, styles.explanationText, { color: theme.colors.text }]}>
                                            {formatExplanation(getExplanationText('vi'))}
                                        </FormattedText>
                                    </>
                                )}
                            </View>
                        </View>
                    )}
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
        borderRadius: 10,
        marginBottom: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        overflow: 'hidden',
        borderWidth: 1,
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
    secondLanguageTitle: {
        marginTop: 16,
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