import React, { useEffect, useState } from 'react';
import {
    Modal,
    View,
    Image,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    SafeAreaView,
    StatusBar,
    ActivityIndicator,
    GestureResponderEvent,
    Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { usePanZoom } from '../hooks/usePanZoom';
import FormattedText from './FormattedText';
import type { ImageModalProps } from '../../types';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const ImageModal: React.FC<ImageModalProps> = ({ visible, imageSource, onClose }) => {
    const { theme, themeMode } = useTheme();
    const [imageLoaded, setImageLoaded] = useState(false);
    const [showZoomHint, setShowZoomHint] = useState(false);

    const {
        scale,
        translateX,
        translateY,
        panResponder,
        reset: resetPanZoom
    } = usePanZoom({
        onGestureGrant: () => setShowZoomHint(false)
    });

    // Reset image loaded state and animations when modal opens or image changes
    useEffect(() => {
        if (visible && imageSource) {
            setImageLoaded(false);
            resetPanZoom();

            // Show zoom hint for 3 seconds
            setShowZoomHint(true);
            const hintTimeout = setTimeout(() => setShowZoomHint(false), 3000);

            // Cleanup function to clear timeout
            return () => clearTimeout(hintTimeout);
        }
    }, [visible, imageSource, resetPanZoom]);

    const handleImageLoad = () => {
        setImageLoaded(true);
    };

    const handleImageError = () => {
        setImageLoaded(true); // Still mark as loaded to hide loading indicator
    };

    // Handle background press - only close if pressing the background, not the image
    const handleBackgroundPress = (event: GestureResponderEvent) => {
        // Only close if the press is directly on the background
        if (event.target === event.currentTarget) {
            onClose();
        }
    };

    // Don't render if not visible
    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
            statusBarTranslucent={true}
        >
            <StatusBar backgroundColor="rgba(0, 0, 0, 0.9)" barStyle="light-content" />
            <SafeAreaView style={styles.modalContainer}>
                <View
                    style={[styles.modalOverlay, { backgroundColor: themeMode === 'dark' ? 'rgba(0, 0, 0, 0.95)' : 'rgba(0, 0, 0, 0.85)' }]}
                    onStartShouldSetResponder={() => true}
                    onResponderRelease={handleBackgroundPress}
                >
                    {/* Close button */}
                    <TouchableOpacity style={[styles.closeButton, { backgroundColor: theme.colors.primary + '80' }]} onPress={onClose}>
                        <Ionicons name="close" size={30} color="#FFFFFF" />
                    </TouchableOpacity>

                    {/* Zoom hint overlay */}
                    {showZoomHint && (
                        <View style={[styles.zoomHint, { backgroundColor: theme.colors.primary + 'CC' }]}>
                            <FormattedText style={styles.zoomHintText}>Double-tap to zoom • Drag to pan when zoomed</FormattedText>
                        </View>
                    )}

                    {/* Photo container with zoom and pan gestures */}
                    <View style={styles.photoContainer}>
                        {/* Loading indicator */}
                        {!imageLoaded && (
                            <ActivityIndicator
                                size="large"
                                color={theme.colors.primary}
                                style={styles.loadingIndicator}
                            />
                        )}

                        {imageSource && (
                            <Animated.View
                                {...panResponder.panHandlers}
                                style={[
                                    styles.imageWrapper,
                                    {
                                        transform: [
                                            { scale },
                                            { translateX },
                                            { translateY },
                                        ],
                                    }
                                ]}
                            >
                                <Image
                                    key={JSON.stringify(imageSource)}
                                    source={imageSource}
                                    style={[styles.photo, !imageLoaded && styles.hiddenImage]}
                                    resizeMode="contain"
                                    onLoad={() => {
                                        handleImageLoad();
                                    }}
                                    onError={(error) => {
                                        handleImageError();
                                    }}
                                />
                            </Animated.View>
                        )}
                    </View>
                </View>
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 10,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    photoContainer: {
        flex: 1,
        width: screenWidth,
        height: screenHeight,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    photo: {
        width: '100%',
        height: '100%',
        maxWidth: screenWidth - 40,
        maxHeight: screenHeight - 200,
    },
    loadingIndicator: {
        position: 'absolute',
        zIndex: 5,
    },
    hiddenImage: {
        opacity: 0,
    },
    zoomHint: {
        position: 'absolute',
        top: 100,
        left: 20,
        right: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderRadius: 8,
        padding: 12,
        zIndex: 15,
    },
    zoomHintText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    imageWrapper: {
        width: screenWidth - 40,
        height: screenHeight - 200,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default ImageModal;