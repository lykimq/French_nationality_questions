import React from 'react';
import { StyleSheet, View, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FormattedText, Icon3D } from './';
import { useTheme } from '../contexts/ThemeContext';
import { useIcon3D } from '../hooks';
import { sharedStyles } from '../utils';

interface AppHeaderProps {
    title: string;
    subtitle?: string;
    showBackButton?: boolean;
    onBackPress?: () => void;
    rightAction?: React.ReactNode;
    showTricolore?: boolean;
    containerStyle?: ViewStyle;
    titleStyle?: TextStyle;
}

const AppHeader: React.FC<AppHeaderProps> = ({
    title,
    subtitle,
    showBackButton = false,
    onBackPress,
    rightAction,
    showTricolore = true,
    containerStyle,
    titleStyle,
}) => {
    const { theme } = useTheme();
    const { getIcon } = useIcon3D();
    const arrowBackIcon = getIcon('arrowBack');

    return (
        <SafeAreaView edges={['top']} style={{ backgroundColor: theme.colors.headerBackground }}>
            {showTricolore && (
                <View style={sharedStyles.headerTopAccent}>
                    <View style={sharedStyles.accentBlue} />
                    <View style={sharedStyles.accentWhite} />
                    <View style={sharedStyles.accentRed} />
                </View>
            )}
            <View style={[sharedStyles.headerContainer, { backgroundColor: theme.colors.headerBackground }, containerStyle]}>
                <View style={sharedStyles.headerTitleRow}>
                    {showBackButton && (
                        <TouchableOpacity
                            onPress={onBackPress}
                            style={styles.backButton}
                            activeOpacity={0.7}
                        >
                            <Icon3D
                                name={arrowBackIcon.name}
                                size={22}
                                color={theme.colors.headerText}
                                variant={arrowBackIcon.variant}
                            />
                        </TouchableOpacity>
                    )}
                    
                    <View style={sharedStyles.headerTextContainer}>
                        <FormattedText 
                            style={[
                                styles.titleText, 
                                { color: theme.colors.headerText },
                                titleStyle
                            ]}
                            numberOfLines={1}
                        >
                            {title}
                        </FormattedText>
                        {subtitle && (
                            <FormattedText 
                                style={[
                                    sharedStyles.headerSubtitle, 
                                    { color: theme.colors.headerText + 'B3' }
                                ]}
                                numberOfLines={1}
                            >
                                {subtitle}
                            </FormattedText>
                        )}
                    </View>

                    {rightAction && (
                        <View style={styles.rightActionContainer}>
                            {rightAction}
                        </View>
                    )}
                    
                    {/* Spacer to center title if back button is present but no right action */}
                    {showBackButton && !rightAction && <View style={styles.spacer} />}
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    backButton: {
        padding: 8,
        marginLeft: -8,
        marginRight: 8,
    },
    titleText: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    rightActionContainer: {
        marginLeft: 12,
    },
    spacer: {
        width: 40,
    },
});

export default AppHeader;
