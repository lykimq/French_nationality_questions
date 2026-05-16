import React, { useState } from "react";
import {
    StyleSheet,
    View,
    Image,
    ActivityIndicator,
    TouchableOpacity,
    StyleProp,
    ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { useIcons } from "../contexts/IconContext";
import { useFirebaseImage } from "../hooks/useFirebaseImage";
import FormattedText from "./FormattedText";
import ImageModal from "./ImageModal";
import Icon3D from "./Icon3D";

export interface QuestionImageProps {
    image: string | null;
    imageHeight?: number;
    enableFullscreen?: boolean;
    showExpandOverlay?: boolean;
    showLoadingText?: boolean;
    containerStyle?: StyleProp<ViewStyle>;
}

const QuestionImage: React.FC<QuestionImageProps> = ({
    image,
    imageHeight = 200,
    enableFullscreen = false,
    showExpandOverlay = false,
    showLoadingText = false,
    containerStyle,
}) => {
    const { theme } = useTheme();
    const { getIconName, getIconVariant } = useIcons();
    const [isImageModalVisible, setIsImageModalVisible] = useState(false);

    const {
        imageSource,
        isLoading: imageLoading,
        error: imageError,
    } = useFirebaseImage(image);

    if (!image) {
        return null;
    }

    const handleImagePress = () => {
        if (
            enableFullscreen &&
            imageSource &&
            !imageError &&
            !imageLoading
        ) {
            setIsImageModalVisible(true);
        }
    };

    const closeImageModal = () => setIsImageModalVisible(false);

    const imageStyle = [styles.image, { height: imageHeight }];
    const loadingStyle = [styles.imageLoading, { height: imageHeight }];

    if (imageError) {
        return (
            <View
                style={[
                    styles.imageFallback,
                    { backgroundColor: theme.colors.surface },
                    containerStyle,
                ]}
            >
                <Icon3D
                    name={getIconName("image")}
                    size={32}
                    color={theme.colors.textMuted}
                    variant={getIconVariant("image")}
                />
                <FormattedText
                    style={[
                        styles.imageFallbackText,
                        { color: theme.colors.textMuted },
                    ]}
                >
                    Image non disponible
                </FormattedText>
            </View>
        );
    }

    const Wrapper = enableFullscreen ? TouchableOpacity : View;
    const wrapperProps = enableFullscreen
        ? {
              onPress: handleImagePress,
              activeOpacity: 0.9 as const,
              disabled: imageLoading,
          }
        : {};

    return (
        <>
            <Wrapper
                {...wrapperProps}
                style={[
                    styles.imageContainer,
                    { borderColor: theme.colors.border },
                    containerStyle,
                ]}
            >
                {imageLoading && (
                    <View
                        style={[
                            loadingStyle,
                            { backgroundColor: theme.colors.surface },
                        ]}
                    >
                        <ActivityIndicator
                            size="large"
                            color={theme.colors.primary}
                        />
                        {showLoadingText && (
                            <FormattedText
                                style={[
                                    styles.loadingText,
                                    { color: theme.colors.text },
                                ]}
                            >
                                Chargement de l'image...
                            </FormattedText>
                        )}
                    </View>
                )}
                {imageSource && (
                    <>
                        <Image
                            source={imageSource}
                            style={[
                                imageStyle,
                                {
                                    backgroundColor: theme.colors.divider,
                                },
                                imageLoading && styles.hiddenImage,
                            ]}
                            resizeMode="contain"
                        />
                        {showExpandOverlay && !imageLoading && (
                            <View style={styles.imageOverlay}>
                                <Icon3D
                                    name={getIconName("expand")}
                                    size={20}
                                    color={theme.colors.buttonText}
                                    variant="default"
                                />
                            </View>
                        )}
                        {enableFullscreen && !showExpandOverlay && !imageLoading && (
                            <View style={styles.imageOverlay}>
                                <Ionicons
                                    name="expand-outline"
                                    size={20}
                                    color="#FFFFFF"
                                />
                            </View>
                        )}
                    </>
                )}
            </Wrapper>

            {enableFullscreen && (
                <ImageModal
                    key={image}
                    visible={isImageModalVisible}
                    imageSource={imageSource}
                    onClose={closeImageModal}
                />
            )}
        </>
    );
};

const styles = StyleSheet.create({
    imageContainer: {
        borderRadius: 8,
        overflow: "hidden",
        marginBottom: 16,
        borderWidth: 1,
        position: "relative",
    },
    image: {
        width: "100%",
    },
    hiddenImage: {
        opacity: 0,
    },
    imageOverlay: {
        position: "absolute",
        top: 8,
        right: 8,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        borderRadius: 20,
        padding: 8,
    },
    imageLoading: {
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        marginTop: 8,
        fontSize: 14,
    },
    imageFallback: {
        width: "100%",
        height: 120,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
        borderRadius: 12,
        gap: 8,
    },
    imageFallbackText: {
        fontSize: 14,
    },
});

export default QuestionImage;
