import { useRef, useCallback } from 'react';
import { Animated, PanResponder, GestureResponderEvent, PanResponderGestureState } from 'react-native';

interface UsePanZoomOptions {
    onGestureGrant?: () => void;
    maxScale?: number;
    minScale?: number;
}

export const usePanZoom = (options: UsePanZoomOptions = {}) => {
    const { onGestureGrant, maxScale = 2.5, minScale = 1 } = options;

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

    const reset = useCallback(() => {
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
    }, [scale, translateX, translateY]);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (evt, panGestureState) => {
                // Allow movement for pan when zoomed
                return gestureState.current.isZoomed && (Math.abs(panGestureState.dx) > 2 || Math.abs(panGestureState.dy) > 2);
            },
            onPanResponderGrant: (evt: GestureResponderEvent) => {
                if (onGestureGrant) onGestureGrant();

                const touches = evt.nativeEvent.touches;

                if (touches.length === 1) {
                    // Single touch - check for double-tap or pan
                    const now = Date.now();
                    const timeSinceLastTap = now - gestureState.current.lastTap;

                    if (timeSinceLastTap < 300) {
                        // Double-tap detected - toggle zoom
                        const currentScale = gestureState.current.scale;
                        const targetScale = currentScale <= 1.1 ? maxScale : 1;

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
            onPanResponderMove: (evt: GestureResponderEvent, panGestureState: PanResponderGestureState) => {
                const touches = evt.nativeEvent.touches;

                if (touches.length === 1 && gestureState.current.isZoomed) {
                    // Handle pan when zoomed
                    const maxTranslate = 100 * gestureState.current.scale;

                    // Constrain translation
                    const newX = Math.max(-maxTranslate, Math.min(maxTranslate, panGestureState.dx));
                    const newY = Math.max(-maxTranslate, Math.min(maxTranslate, panGestureState.dy));

                    translateX.setValue(newX);
                    translateY.setValue(newY);
                }
            },
            onPanResponderRelease: (evt: GestureResponderEvent, panGestureState: PanResponderGestureState) => {
                const touches = evt.nativeEvent.touches;

                if (gestureState.current.isZoomed && touches.length === 0) {
                    // Pan gesture ended
                    gestureState.current.offsetX += panGestureState.dx;
                    gestureState.current.offsetY += panGestureState.dy;

                    // Constrain final position
                    const maxTranslate = 100 * gestureState.current.scale;
                    gestureState.current.offsetX = Math.max(-maxTranslate, Math.min(maxTranslate, gestureState.current.offsetX));
                    gestureState.current.offsetY = Math.max(-maxTranslate, Math.min(maxTranslate, gestureState.current.offsetY));

                    translateX.flattenOffset();
                    translateY.flattenOffset();
                }
            },
        })
    ).current;

    return {
        scale,
        translateX,
        translateY,
        panResponder,
        reset,
        isZoomed: gestureState.current.isZoomed
    };
};
