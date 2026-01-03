import React from 'react';
import {
    StyleSheet,
    View,
    ScrollView,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../shared/contexts/ThemeContext';
import { FormattedText, BackButton } from '../../shared/components';
import { sharedStyles } from '../../shared/utils';
import { PrivacyPolicy, TermsOfService } from '../../shared/constants';

type LegalDocumentType = 'privacy' | 'terms';

interface LegalDocumentScreenRouteParams {
    type: LegalDocumentType;
}

const DOCUMENT_TITLES = {
    privacy: 'Politique de Confidentialité',
    terms: 'Conditions d\'Utilisation',
} as const;

const LegalDocumentScreen: React.FC = () => {
    const route = useRoute();
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { theme, themeMode } = useTheme();

    const { type } = (route.params as LegalDocumentScreenRouteParams) || { type: 'privacy' };
    const title = DOCUMENT_TITLES[type];

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.headerBackground} />

            <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.headerBackground }]} edges={['top']}>
                <View style={[styles.header, { backgroundColor: theme.colors.headerBackground }]}>
                    <BackButton onPress={() => navigation.goBack()} />
                    <FormattedText style={[styles.title, { color: theme.colors.headerText }]}>
                        {title}
                    </FormattedText>
                    <View style={styles.placeholder} />
                </View>
            </SafeAreaView>

            <ScrollView
                style={[styles.scrollView, { backgroundColor: theme.colors.background }]}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={true}
            >
                <View style={[styles.contentContainer, { backgroundColor: theme.colors.card }]}>
                    {type === 'privacy' ? (
                        <PrivacyPolicy theme={theme} />
                    ) : (
                        <TermsOfService theme={theme} />
                    )}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        ...sharedStyles.container,
    },
    safeArea: {
        // backgroundColor will be set dynamically
    },
    header: {
        ...sharedStyles.header,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 10,
        paddingBottom: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        flex: 1,
        textAlign: 'center',
    },
    placeholder: {
        width: 40,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    contentContainer: {
        padding: 20,
        borderRadius: 12,
        ...sharedStyles.mediumShadow,
    },
});

export default LegalDocumentScreen;

