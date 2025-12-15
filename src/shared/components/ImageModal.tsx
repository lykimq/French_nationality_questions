import React, { useEffect, useState, useRef } from 'react';
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
    PanResponder,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import FormattedText from './FormattedText';
import type { ImageModalProps } from '../../types';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const ImageModal: React.FC<ImageModalProps> = ({ visible, imageSource, onClose }) => {
    const { theme, themeMode } = useTheme();
    const [imageLoaded, setImageLoaded] = useState(false);
    const [showZoomHint, setShowZoomHint] = useState(false);

    // Animation values for zoom and pan
    const scale = useRef(new Animated.Value(1)).current;
    const translateX = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(0)).current;

    // Gesture state tracking
    const gestureState = useRef({
        scale: 1,
        lastScale: 1,
        offsetX: 0,
        offsetY: 0,
        isZoomed: false,
        initialX: 0,
        initialY: 0,
        lastTap: 0,
    });

    // Reset image loaded state and animations when modal opens or image changes
    useEffect(() => {
        if (visible && imageSource) {
            setImageLoaded(false);
            // Reset all animation values
            scale.setValue(1);
            translateX.setValue(0);
            translateY.setValue(0);
            gestureState.current = {
                scale: 1,
                lastScale: 1,
                offsetX: 0,
                offsetY: 0,
                isZoomed: false,
                initialX: 0,
                initialY: 0,
                lastTap: 0,
            };

            // Show zoom hint for 3 seconds
            setShowZoomHint(true);
            const hintTimeout = setTimeout(() => setShowZoomHint(false), 3000);

            // Cleanup function to clear timeout
            return () => clearTimeout(hintTimeout);
        }
    }, [visible, imageSource]);

    // Create pan responder for handling gestures
    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (evt, panGestureState) => {
            // Allow movement for pan when zoomed
            return gestureState.current.isZoomed && (Math.abs(panGestureState.dx) > 2 || Math.abs(panGestureState.dy) > 2);
        },
        onPanResponderGrant: (evt) => {
            setShowZoomHint(false);
            const touches = evt.nativeEvent.touches;

            if (touches.length === 1) {
                // Single touch - check for double-tap or pan
                const now = Date.now();
                const timeSinceLastTap = now - gestureState.current.lastTap;

                if (timeSinceLastTap < 300) {
                    // Double-tap detected - toggle zoom
                    const currentScale = gestureState.current.scale;
                    const targetScale = currentScale <= 1.1 ? 2.5 : 1;

                    gestureState.current.scale = targetScale;
                    gestureState.current.lastScale = targetScale;
                    gestureState.current.isZoomed = targetScale > 1.1;

                    if (targetScale <= 1.1) {
                        // Zoom out - reset position
                        gestureState.current.offsetX = 0;
                        gestureState.current.offsetY = 0;

                        Animated.parallel([
                            Animated.spring(scale, {
                                toValue: 1,
                                useNativeDriver: true,
                                tension: 100,
                                friction: 8,
                            }),
                            Animated.spring(translateX, {
                                toValue: 0,
                                useNativeDriver: true,
                                tension: 100,
                                friction: 8,
                            }),
                            Animated.spring(translateY, {
                                toValue: 0,
                                useNativeDriver: true,
                                tension: 100,
                                friction: 8,
                            }),
                        ]).start();
                    } else {
                        // Zoom in
                        Animated.spring(scale, {
                            toValue: targetScale,
                            useNativeDriver: true,
                            tension: 100,
                            friction: 8,
                        }).start();
                    }

                    gestureState.current.lastTap = 0; // Reset to prevent triple-tap
                } else {
                    // Single tap - prepare for potential pan
                    gestureState.current.lastTap = now;
                    gestureState.current.initialX = gestureState.current.offsetX;
                    gestureState.current.initialY = gestureState.current.offsetY;

                    // Set up for panning if zoomed
                    if (gestureState.current.isZoomed) {
                        translateX.setOffset(gestureState.current.offsetX);
                        translateY.setOffset(gestureState.current.offsetY);
                        translateX.setValue(0);
                        translateY.setValue(0);
                    }
                }
            }
        },
        onPanResponderMove: (evt, gestureState_) => {
            const touches = evt.nativeEvent.touches;

            if (touches.length === 1 && gestureState.current.isZoomed) {
                // Handle pan when zoomed
                const maxTranslate = 100 * gestureState.current.scale;

                // Constrain translation
                const newX = Math.max(-maxTranslate, Math.min(maxTranslate, gestureState_.dx));
                const newY = Math.max(-maxTranslate, Math.min(maxTranslate, gestureState_.dy));

                translateX.setValue(newX);
                translateY.setValue(newY);
            }
        },
        onPanResponderRelease: (evt, gestureState_) => {
            const touches = evt.nativeEvent.touches;

            if (gestureState.current.isZoomed && touches.length === 0) {
                // Pan gesture ended
                gestureState.current.offsetX += gestureState_.dx;
                gestureState.current.offsetY += gestureState_.dy;

                // Constrain final position
                const maxTranslate = 100 * gestureState.current.scale;
                gestureState.current.offsetX = Math.max(-maxTranslate, Math.min(maxTranslate, gestureState.current.offsetX));
                gestureState.current.offsetY = Math.max(-maxTranslate, Math.min(maxTranslate, gestureState.current.offsetY));

                translateX.flattenOffset();
                translateY.flattenOffset();
            }
        },
    });

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