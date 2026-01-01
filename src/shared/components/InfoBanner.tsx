import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../contexts/ThemeContext';
import { FormattedText, Icon3D } from './';
import { createLogger } from '../utils/logger';

const logger = createLogger('InfoBanner');

const STORAGE_PREFIX = 'info_banner_collapsed_';

export interface InfoBannerProps {
    type?: 'info' | 'warning' | 'disclaimer';
    title?: string;
    message: string;
    icon?: string;
    onDismiss?: () => void;
    dismissible?: boolean;
    collapsible?: boolean;
    defaultCollapsed?: boolean;
    storageKey?: string;
    style?: object;
}

const InfoBanner: React.FC<InfoBannerProps> = ({
    type = 'info',
    title,
    message,
    icon,
    onDismiss,
    dismissible = false,
    collapsible = false,
    defaultCollapsed = false,
    storageKey,
    style,
}) => {
    const { theme } = useTheme();
    const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
    const [isLoadingState, setIsLoadingState] = useState(!!storageKey);
    const animatedHeight = useRef(new Animated.Value(defaultCollapsed ? 0 : 1)).current;
    const [contentHeight, setContentHeight] = useState(0);

    useEffect(() => {
        if (storageKey && collapsible) {
            const loadCollapsedState = async () => {
                try {
                    const storageKeyFull = `${STORAGE_PREFIX}${storageKey}`;
                    const savedState = await AsyncStorage.getItem(storageKeyFull);
                    if (savedState !== null) {
                        const isCollapsedSaved = savedState === 'true';
                        setIsCollapsed(isCollapsedSaved);
                        animatedHeight.setValue(isCollapsedSaved ? 0 : 1);
                    }
                } catch (error) {
                    logger.error('Failed to load collapsed state:', error);
                } finally {
                    setIsLoadingState(false);
                }
            };
            loadCollapsedState();
        } else {
            setIsLoadingState(false);
        }
    }, [storageKey, collapsible, animatedHeight]);

    useEffect(() => {
        if (!isLoadingState) {
            Animated.timing(animatedHeight, {
                toValue: isCollapsed ? 0 : 1,
                duration: 250,
                useNativeDriver: false,
            }).start();
        }
    }, [isCollapsed, animatedHeight, isLoadingState]);

    const toggleCollapse = async () => {
        const newCollapsedState = !isCollapsed;
        setIsCollapsed(newCollapsedState);

        if (storageKey && collapsible) {
            try {
                const storageKeyFull = `${STORAGE_PREFIX}${storageKey}`;
                await AsyncStorage.setItem(storageKeyFull, String(newCollapsedState));
            } catch (error) {
                logger.error('Failed to save collapsed state:', error);
            }
        }
    };

    const handleContentLayout = (event: any) => {
        const { height } = event.nativeEvent.layout;
        if (height > 0 && contentHeight === 0) {
            setContentHeight(height);
        }
    };

    const getIconName = () => {
        if (icon) return icon;
        switch (type) {
            case 'warning':
                return 'warning';
            case 'disclaimer':
                return 'information-circle';
            default:
                return 'information-circle';
        }
    };

    const getBackgroundColor = () => {
        switch (type) {
            case 'warning':
                return theme.colors.warning || '#FF9800';
            case 'disclaimer':
                return theme.colors.card;
            default:
                return theme.colors.primary + '15';
        }
    };

    const getTextColor = () => {
        switch (type) {
            case 'warning':
                return '#FFFFFF';
            case 'disclaimer':
                return theme.colors.text;
            default:
                return theme.colors.text;
        }
    };

    const getIconColor = () => {
        switch (type) {
            case 'warning':
                return '#FFFFFF';
            case 'disclaimer':
                return theme.colors.primary;
            default:
                return theme.colors.primary;
        }
    };

    const maxHeight = animatedHeight.interpolate({
        inputRange: [0, 1],
        outputRange: [0, contentHeight || 1000],
    });

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: getBackgroundColor(),
                    borderColor: type === 'disclaimer' ? theme.colors.border : 'transparent',
                },
                style,
            ]}
        >
            <View style={styles.content}>
                <Icon3D
                    name={getIconName()}
                    size={20}
                    color={getIconColor()}
                    variant={type === 'warning' ? 'gradient' : 'default'}
                    containerStyle={styles.icon}
                />
                <View style={styles.textContainer}>
                    {title && (
                        <FormattedText
                            style={[
                                styles.title,
                                {
                                    color: getTextColor(),
                                },
                            ]}
                        >
                            {title}
                        </FormattedText>
                    )}
                    <Animated.View
                        style={[
                            styles.messageContainer,
                            {
                                maxHeight: collapsible ? maxHeight : undefined,
                                opacity: collapsible ? animatedHeight : 1,
                            },
                        ]}
                        onLayout={handleContentLayout}
                    >
                        <FormattedText
                            style={[
                                styles.message,
                                {
                                    color: getTextColor(),
                                },
                            ]}
                        >
                            {message}
                        </FormattedText>
                    </Animated.View>
                </View>
                <View style={styles.actionsContainer}>
                    {collapsible && (
                        <TouchableOpacity
                            onPress={toggleCollapse}
                            style={[styles.collapseButton, dismissible && styles.collapseButtonWithDismiss]}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Ionicons
                                name={isCollapsed ? 'chevron-down' : 'chevron-up'}
                                size={20}
                                color={getTextColor()}
                            />
                        </TouchableOpacity>
                    )}
                    {dismissible && onDismiss && (
                        <TouchableOpacity
                            onPress={onDismiss}
                            style={styles.dismissButton}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Ionicons
                                name="close"
                                size={20}
                                color={getTextColor()}
                            />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 12,
        padding: 16,
        marginVertical: 8,
        borderWidth: 1,
        overflow: 'hidden',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    icon: {
        marginRight: 12,
        marginTop: 2,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    messageContainer: {
        overflow: 'hidden',
    },
    message: {
        fontSize: 13,
        lineHeight: 18,
    },
    actionsContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginLeft: 8,
        marginTop: -4,
    },
    collapseButton: {
        padding: 4,
    },
    collapseButtonWithDismiss: {
        marginRight: 4,
    },
    dismissButton: {
        padding: 4,
    },
});

export default InfoBanner;

