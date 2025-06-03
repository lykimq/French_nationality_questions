import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView, TouchableWithoutFeedback, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MultiLangText } from '../contexts/LanguageContext';
import { getImageSource as loadImageSource, getCachedImageSource } from '../utils/imageUtils';
import ImageModal from './ImageModal';
import FormattedText from './FormattedText';
import { useTextFormatting, getTextStyles } from '../contexts/TextFormattingContext';

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
    const [isImageModalVisible, setIsImageModalVisible] = useState(false);
    const { settings } = useTextFormatting();

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

    // Don't auto-close modal on image change - let user control it manually

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
                    <FormattedText style={styles.id}>{id}</FormattedText>
                </View>
                <View style={styles.questionContainer}>
                    <FormattedText style={styles.question} numberOfLines={expanded ? 0 : 2}>
                        {getQuestionText('fr')}
                    </FormattedText>
                    {isMultilingual && language === 'vi' && (
                        <FormattedText style={styles.translation} numberOfLines={expanded ? 0 : 1}>
                            {getQuestionText('vi')}
                        </FormattedText>
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
                <View style={styles.expandedContent}>
                    {isMultilingual}

                    {/* Display image if available */}
                    {image && !imageError && (
                        <TouchableOpacity
                            style={styles.imageContainer}
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
                                <View style={styles.imageLoading}>
                                    <ActivityIndicator size="large" color="#3F51B5" />
                                    <FormattedText style={styles.loadingText}>
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
                                        <Ionicons name="expand-outline" size={24} color="#FFFFFF" />
                                    </View>
                                </>
                            )}
                        </TouchableOpacity>
                    )}

                    {/* Display fallback if image fails to load */}
                    {image && imageError && (
                        <View style={styles.imageFallback}>
                            <Ionicons name="image-outline" size={40} color="#CCCCCC" />
                            <FormattedText style={styles.imageFallbackText}>
                                {language === 'fr' ? "Image non disponible" : "Hình ảnh không khả dụng"}
                            </FormattedText>
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
                                <FormattedText style={styles.sectionTitle}>Explication:</FormattedText>
                                <FormattedText style={[styles.sectionContent, styles.explanationText]}>
                                    {formatExplanation(getExplanationText('fr'))}
                                </FormattedText>

                                {isMultilingual && showBothLanguages && language === 'vi' && getExplanationText('vi') !== "" && (
                                    <>
                                        <FormattedText style={[styles.sectionTitle, styles.secondLanguageTitle]}>Giải thích:</FormattedText>
                                        <FormattedText style={[styles.sectionContent, styles.explanationText]}>
                                            {formatExplanation(getExplanationText('vi'))}
                                        </FormattedText>
                                    </>
                                )}
                            </View>
                        </ScrollView>
                    )}
                </View>
            )}

            {/* Add a clickable overlay to the unexpanded card */}
            {!expanded && (
                <Pressable
                    style={styles.overlay}
                    onPress={toggleExpand}
                    android_ripple={{ color: '#E8EAF6', borderless: true }}
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
    imageOverlay: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: 1,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
});

export default QuestionCard;