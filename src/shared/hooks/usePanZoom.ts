import { useRef, useCallback } from "react";
import { Animated } from "react-native";
import {
    State,
    type PanGestureHandlerGestureEvent,
    type PinchGestureHandlerGestureEvent,
} from "react-native-gesture-handler";
import {
    DEFAULT_MAX_SCALE,
    DEFAULT_MIN_SCALE,
    isZoomedIn,
    scaleFromPinchGesture,
} from "../utils/zoomUtils";

interface UsePanZoomOptions {
    onGestureGrant?: () => void;
    maxScale?: number;
    minScale?: number;
}

export const usePanZoom = (options: UsePanZoomOptions = {}) => {
    const {
        onGestureGrant,
        maxScale = DEFAULT_MAX_SCALE,
        minScale = DEFAULT_MIN_SCALE,
    } = options;

    const scale = useRef(new Animated.Value(1)).current;
    const translateX = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(0)).current;
    const pinchRef = useRef(null);
    const panRef = useRef(null);

    const gestureState = useRef({
        scale: 1,
        offsetX: 0,
        offsetY: 0,
        isZoomed: false,
        pinchStartScale: 1,
        panStartX: 0,
        panStartY: 0,
    });

    const optionsRef = useRef({ onGestureGrant, maxScale, minScale });
    optionsRef.current = { onGestureGrant, maxScale, minScale };

    const animateToScale = useCallback(
        (targetScale: number, resetPan: boolean) => {
            const { maxScale: max, minScale: min } = optionsRef.current;
            const clamped = Math.max(min, Math.min(max, targetScale));
            gestureState.current.scale = clamped;
            gestureState.current.isZoomed = isZoomedIn(clamped);

            if (resetPan || !isZoomedIn(clamped)) {
                gestureState.current.offsetX = 0;
                gestureState.current.offsetY = 0;

                Animated.parallel([
                    Animated.spring(scale, {
                        toValue: clamped,
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
                Animated.spring(scale, {
                    toValue: clamped,
                    useNativeDriver: true,
                    tension: 100,
                    friction: 8,
                }).start();
            }
        },
        [scale, translateX, translateY]
    );

    const reset = useCallback(() => {
        gestureState.current = {
            scale: 1,
            offsetX: 0,
            offsetY: 0,
            isZoomed: false,
            pinchStartScale: 1,
            panStartX: 0,
            panStartY: 0,
        };
        scale.setValue(1);
        translateX.setValue(0);
        translateY.setValue(0);
    }, [scale, translateX, translateY]);

    const clampTranslation = useCallback((value: number, currentScale: number) => {
        const maxTranslate = 100 * currentScale;
        return Math.max(-maxTranslate, Math.min(maxTranslate, value));
    }, []);

    const onPinchGestureEvent = useCallback(
        (event: PinchGestureHandlerGestureEvent) => {
            const { maxScale: max, minScale: min } = optionsRef.current;
            const newScale = scaleFromPinchGesture(
                gestureState.current.pinchStartScale,
                event.nativeEvent.scale,
                min,
                max
            );
            gestureState.current.scale = newScale;
            gestureState.current.isZoomed = isZoomedIn(newScale);
            scale.setValue(newScale);
        },
        [scale]
    );

    const onPinchHandlerStateChange = useCallback(
        (event: PinchGestureHandlerGestureEvent) => {
            const { state } = event.nativeEvent;

            if (state === State.BEGAN) {
                optionsRef.current.onGestureGrant?.();
                gestureState.current.pinchStartScale = gestureState.current.scale;
            }

            if (state === State.END || state === State.CANCELLED) {
                if (!isZoomedIn(gestureState.current.scale)) {
                    animateToScale(optionsRef.current.minScale, true);
                }
            }
        },
        [animateToScale]
    );

    const onPanGestureEvent = useCallback(
        (event: PanGestureHandlerGestureEvent) => {
            if (!gestureState.current.isZoomed) {
                return;
            }

            const currentScale = gestureState.current.scale;
            const { translationX, translationY } = event.nativeEvent;

            translateX.setValue(
                clampTranslation(
                    gestureState.current.panStartX + translationX,
                    currentScale
                )
            );
            translateY.setValue(
                clampTranslation(
                    gestureState.current.panStartY + translationY,
                    currentScale
                )
            );
        },
        [clampTranslation, translateX, translateY]
    );

    const onPanHandlerStateChange = useCallback(
        (event: PanGestureHandlerGestureEvent) => {
            const { state, translationX, translationY } = event.nativeEvent;

            if (state === State.BEGAN) {
                optionsRef.current.onGestureGrant?.();
                gestureState.current.panStartX = gestureState.current.offsetX;
                gestureState.current.panStartY = gestureState.current.offsetY;
            }

            if (
                (state === State.END || state === State.CANCELLED) &&
                gestureState.current.isZoomed
            ) {
                const currentScale = gestureState.current.scale;
                gestureState.current.offsetX = clampTranslation(
                    gestureState.current.panStartX + translationX,
                    currentScale
                );
                gestureState.current.offsetY = clampTranslation(
                    gestureState.current.panStartY + translationY,
                    currentScale
                );
                translateX.setValue(gestureState.current.offsetX);
                translateY.setValue(gestureState.current.offsetY);
            }
        },
        [clampTranslation, translateX, translateY]
    );

    return {
        scale,
        translateX,
        translateY,
        pinchRef,
        panRef,
        onPinchGestureEvent,
        onPinchHandlerStateChange,
        onPanGestureEvent,
        onPanHandlerStateChange,
        reset,
    };
};
