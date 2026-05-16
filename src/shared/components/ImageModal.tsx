import React, { useEffect, useState } from "react";
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
    Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
    GestureHandlerRootView,
    PinchGestureHandler,
    PanGestureHandler,
} from "react-native-gesture-handler";
import { useTheme } from "../contexts/ThemeContext";
import { usePanZoom } from "../hooks/usePanZoom";
import FormattedText from "./FormattedText";
import type { ImageModalProps } from "../../types";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const ImageModal: React.FC<ImageModalProps> = ({
    visible,
    imageSource,
    onClose,
}) => {
    const { theme, themeMode } = useTheme();
    const [imageLoaded, setImageLoaded] = useState(false);
    const [showZoomHint, setShowZoomHint] = useState(false);

    const {
        scale,
        translateX,
        translateY,
        pinchRef,
        panRef,
        onPinchGestureEvent,
        onPinchHandlerStateChange,
        onPanGestureEvent,
        onPanHandlerStateChange,
        reset: resetPanZoom,
    } = usePanZoom({
        onGestureGrant: () => setShowZoomHint(false),
    });

    useEffect(() => {
        if (visible && imageSource) {
            setImageLoaded(false);
            resetPanZoom();
            setShowZoomHint(true);
            const hintTimeout = setTimeout(() => setShowZoomHint(false), 3000);
            return () => clearTimeout(hintTimeout);
        }
    }, [visible, imageSource, resetPanZoom]);

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
            statusBarTranslucent={true}
        >
            <GestureHandlerRootView style={styles.gestureRoot}>
                <StatusBar
                    backgroundColor="rgba(0, 0, 0, 0.9)"
                    barStyle="light-content"
                />
                <SafeAreaView style={styles.modalContainer}>
                    <View
                        style={[
                            styles.modalOverlay,
                            {
                                backgroundColor:
                                    themeMode === "dark"
                                        ? "rgba(0, 0, 0, 0.95)"
                                        : "rgba(0, 0, 0, 0.85)",
                            },
                        ]}
                        pointerEvents="box-none"
                    >
                        <TouchableOpacity
                            style={[
                                styles.closeButton,
                                {
                                    backgroundColor:
                                        theme.colors.primary + "80",
                                },
                            ]}
                            onPress={onClose}
                            accessibilityLabel="Fermer l'image"
                        >
                            <Ionicons name="close" size={30} color="#FFFFFF" />
                        </TouchableOpacity>

                        {showZoomHint && (
                            <View
                                style={[
                                    styles.zoomHint,
                                    {
                                        backgroundColor:
                                            theme.colors.primary + "CC",
                                    },
                                ]}
                                pointerEvents="none"
                            >
                                <FormattedText style={styles.zoomHintText}>
                                    Écartez ou rapprochez deux doigts pour
                                    zoomer
                                </FormattedText>
                            </View>
                        )}

                        <View
                            style={styles.photoContainer}
                            pointerEvents="box-none"
                        >
                            {!imageLoaded && (
                                <ActivityIndicator
                                    size="large"
                                    color={theme.colors.primary}
                                    style={styles.loadingIndicator}
                                />
                            )}

                            {imageSource && (
                                <PanGestureHandler
                                    ref={panRef}
                                    simultaneousHandlers={pinchRef}
                                    onGestureEvent={onPanGestureEvent}
                                    onHandlerStateChange={
                                        onPanHandlerStateChange
                                    }
                                    minPointers={1}
                                    maxPointers={1}
                                    avgTouches
                                >
                                    <Animated.View
                                        style={styles.gestureWrapper}
                                        collapsable={false}
                                    >
                                        <PinchGestureHandler
                                            ref={pinchRef}
                                            simultaneousHandlers={panRef}
                                            onGestureEvent={onPinchGestureEvent}
                                            onHandlerStateChange={
                                                onPinchHandlerStateChange
                                            }
                                        >
                                            <Animated.View
                                                style={[
                                                    styles.imageWrapper,
                                                    {
                                                        transform: [
                                                            { scale },
                                                            { translateX },
                                                            { translateY },
                                                        ],
                                                    },
                                                ]}
                                                collapsable={false}
                                            >
                                                <Image
                                                    key={JSON.stringify(
                                                        imageSource
                                                    )}
                                                    source={imageSource}
                                                    style={[
                                                        styles.photo,
                                                        !imageLoaded &&
                                                            styles.hiddenImage,
                                                    ]}
                                                    resizeMode="contain"
                                                    onLoad={() =>
                                                        setImageLoaded(true)
                                                    }
                                                    onError={() =>
                                                        setImageLoaded(true)
                                                    }
                                                />
                                            </Animated.View>
                                        </PinchGestureHandler>
                                    </Animated.View>
                                </PanGestureHandler>
                            )}
                        </View>
                    </View>
                </SafeAreaView>
            </GestureHandlerRootView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    gestureRoot: {
        flex: 1,
    },
    modalContainer: {
        flex: 1,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    closeButton: {
        position: "absolute",
        top: 50,
        right: 20,
        zIndex: 10,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    photoContainer: {
        flex: 1,
        width: screenWidth,
        height: screenHeight,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    gestureWrapper: {
        flex: 1,
        width: screenWidth - 40,
        height: screenHeight - 200,
        justifyContent: "center",
        alignItems: "center",
    },
    photo: {
        width: "100%",
        height: "100%",
        maxWidth: screenWidth - 40,
        maxHeight: screenHeight - 200,
    },
    loadingIndicator: {
        position: "absolute",
        zIndex: 5,
    },
    hiddenImage: {
        opacity: 0,
    },
    zoomHint: {
        position: "absolute",
        top: 100,
        left: 20,
        right: 20,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        borderRadius: 8,
        padding: 12,
        zIndex: 15,
    },
    zoomHintText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "bold",
        textAlign: "center",
    },
    imageWrapper: {
        width: screenWidth - 40,
        height: screenHeight - 200,
        justifyContent: "center",
        alignItems: "center",
    },
});

export default ImageModal;
