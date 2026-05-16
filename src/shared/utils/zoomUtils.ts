export const DEFAULT_MIN_SCALE = 1;
export const DEFAULT_MAX_SCALE = 2.5;
export const ZOOM_STEP = 0.5;

export const clampScale = (
    scale: number,
    minScale = DEFAULT_MIN_SCALE,
    maxScale = DEFAULT_MAX_SCALE
): number => Math.max(minScale, Math.min(maxScale, scale));

export const nextZoomInScale = (
    currentScale: number,
    step = ZOOM_STEP,
    maxScale = DEFAULT_MAX_SCALE
): number => clampScale(currentScale + step, DEFAULT_MIN_SCALE, maxScale);

export const nextZoomOutScale = (
    currentScale: number,
    step = ZOOM_STEP,
    minScale = DEFAULT_MIN_SCALE
): number => clampScale(currentScale - step, minScale, DEFAULT_MAX_SCALE);

export const isZoomedIn = (scale: number): boolean => scale > 1.05;

export interface TouchPoint {
    readonly pageX: number;
    readonly pageY: number;
}

export const getTouchDistance = (
    touches: readonly TouchPoint[]
): number | null => {
    if (touches.length < 2) {
        return null;
    }
    const [first, second] = touches;
    return Math.hypot(first.pageX - second.pageX, first.pageY - second.pageY);
};

export const scaleFromPinch = (
    startDistance: number,
    currentDistance: number,
    startScale: number,
    minScale = DEFAULT_MIN_SCALE,
    maxScale = DEFAULT_MAX_SCALE
): number => {
    if (startDistance <= 0) {
        return startScale;
    }
    return clampScale(
        startScale * (currentDistance / startDistance),
        minScale,
        maxScale
    );
};

export const scaleFromPinchGesture = (
    startScale: number,
    gestureScale: number,
    minScale = DEFAULT_MIN_SCALE,
    maxScale = DEFAULT_MAX_SCALE
): number =>
    clampScale(startScale * gestureScale, minScale, maxScale);
