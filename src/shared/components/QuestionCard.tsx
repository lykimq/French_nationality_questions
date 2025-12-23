import React, { useState } from 'react';
import { StyleSheet, View, Pressable, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { getQuestionText, getExplanationText, formatExplanation } from '../utils';
import ImageModal from './ImageModal';
import FormattedText from './FormattedText';
import Icon3D from './Icon3D';
import { useTheme } from '../contexts/ThemeContext';
import { useIcons } from '../contexts/IconContext';
import { QuestionCardProps } from '../../types';
import { sharedStyles } from '../utils';
import { useFirebaseImage } from '../hooks/useFirebaseImage';
import { createLogger } from '../utils/logger';

const logger = createLogger('QuestionCard');

const QuestionCard: React.FC<QuestionCardProps> = ({
    id,
    question,
    explanation,
    image,
    alwaysExpanded = false,
}) => {
    const [expanded, setExpanded] = useState(alwaysExpanded);
    const [isImageModalVisible, setIsImageModalVisible] = useState(false);
    const { theme } = useTheme();
    const { getIconName, getIconVariant } = useIcons();

    const { imageSource, isLoading: imageLoading, error: imageError } = useFirebaseImage(image);
    const isExpanded = alwaysExpanded ? true : expanded;

    const toggleExpand = () => {
        if (!alwaysExpanded) {
            setExpanded(!expanded);
        }
    };

    const handleImagePress = () => {
        if (imageSource && !imageError && !imageLoading) {
            setIsImageModalVisible(true);
        }
    };

    const closeImageModal = () => setIsImageModalVisible(false);

    const questionText = getQuestionText(question);
    const explanationText = getExplanationText(explanation);

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
                    pressed && !alwaysExpanded && [styles.headerPressed, { backgroundColor: theme.colors.primary + '10' }]
                ]}
                onPress={toggleExpand}
                android_ripple={!alwaysExpanded ? { color: theme.colors.primary + '20' } : undefined}
                disabled={alwaysExpanded}
            >
                <View style={[styles.idContainer, { backgroundColor: theme.colors.primary }]}>
                    <FormattedText style={[styles.id, { color: theme.colors.buttonText }]}>{id}</FormattedText>
                </View>
                <View style={styles.questionContainer}>
                    <FormattedText style={[styles.question, { color: theme.colors.text }]} numberOfLines={isExpanded ? 0 : 2}>
                        {questionText}
                    </FormattedText>
                </View>
                {!alwaysExpanded && (
                    <View style={styles.iconContainer}>
                        <Icon3D
                            name={isExpanded ? getIconName('chevronUp') : getIconName('chevronDown')}
                            size={20}
                            color={theme.colors.primary}
                            variant={isExpanded ? getIconVariant('chevronUp') : getIconVariant('chevronDown')}
                        />
                    </View>
                )}
            </Pressable>

            {isExpanded && (
                <View style={[styles.expandedContent, { backgroundColor: theme.colors.questionCardBackground }]}>
                    {/* Display image if available */}
                    {image && !imageError && (
                        <TouchableOpacity
                            style={[styles.imageContainer, { borderColor: theme.colors.border }]}
                            onPress={handleImagePress}
                            activeOpacity={0.9}
                            disabled={imageLoading}
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
                                    />
                                    <View style={styles.imageOverlay}>
                                        <Icon3D
                                            name={getIconName('expand')}
                                            size={20}
                                            color="#FFFFFF"
                                            variant="default"
                                        />
                                    </View>
                                </>
                            )}
                        </TouchableOpacity>
                    )}

                    {/* Display fallback if image fails to load */}
                    {image && imageError && (
                        <View style={[styles.imageFallback, { backgroundColor: theme.colors.surface }]}>
                            <Icon3D
                                name={getIconName('image')}
                                size={32}
                                color={theme.colors.textMuted}
                                variant={getIconVariant('image')}
                            />
                            <FormattedText style={[styles.imageFallbackText, { color: theme.colors.textMuted }]}>
                                Image non disponible
                            </FormattedText>
                        </View>
                    )}

                    {explanationText !== "" && (
                        <View style={styles.explanationContainer}>
                            <View style={styles.section}>
                                <FormattedText style={[styles.sectionTitle, { color: theme.colors.primary }]}>Explication:</FormattedText>
                                <FormattedText style={[styles.sectionContent, styles.explanationText, { color: theme.colors.text }]}>
                                    {formatExplanation(explanationText)}
                                </FormattedText>
                            </View>
                        </View>
                    )}
                </View>
            )}

            {/* Add a clickable overlay to the unexpanded card if not always expanded */}
            {!isExpanded && !alwaysExpanded && (
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
    },
    headerPressed: {
        borderRadius: 8,
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
    iconContainer: {
        padding: 4,
    },
    expandedContent: {
        paddingTop: 16,
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
        marginBottom: 8,
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