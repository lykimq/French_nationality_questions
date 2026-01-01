import React, { useMemo, useState } from 'react';
import { View, TouchableOpacity, StatusBar, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList, Question } from '../types';
import { useData } from '../shared/contexts/DataContext';
import { useTheme } from '../shared/contexts/ThemeContext';
import { sortQuestionsById } from '../shared/utils/questionUtils';
import QuestionSlideView from './QuestionSlideView';
import { FormattedText, InfoBanner } from '../shared/components';

type CategoryQuestionsRouteProp = RouteProp<HomeStackParamList, 'CategoryQuestions'>;
type CategoryQuestionsNavigationProp = NativeStackNavigationProp<HomeStackParamList, 'CategoryQuestions'>;

const CategoryQuestionsScreen = () => {
    const route = useRoute<CategoryQuestionsRouteProp>();
    const navigation = useNavigation<CategoryQuestionsNavigationProp>();
    const { theme, themeMode } = useTheme();
    const { categoryId } = route.params;
    const { questionsData } = useData();
    const [showInfoBanner, setShowInfoBanner] = useState(true);

    const category = questionsData.categories.find(c => c.id === categoryId);

    const sortedQuestions = useMemo(() => {
        if (!category?.questions) return [];
        return sortQuestionsById(category.questions);
    }, [category?.questions]);

    if (!category) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <FormattedText style={{ color: theme.colors.text }}>Category not found</FormattedText>
            </View>
        );
    }

    const displayTitle = category.title;
    const questionsCount = `${sortedQuestions.length} questions`;

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.headerBackground} />

            <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.headerBackground }]} edges={['top']}>
                <View style={[styles.header, { backgroundColor: theme.colors.headerBackground }]}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color={theme.colors.headerText} />
                    </TouchableOpacity>
                    <View style={styles.headerTextContainer}>
                        <FormattedText style={[styles.title, { color: theme.colors.headerText }]}>{displayTitle}</FormattedText>
                        <FormattedText style={[styles.count, { color: theme.colors.headerText + 'B3' }]}>{questionsCount}</FormattedText>
                    </View>
                </View>
            </SafeAreaView>

            {showInfoBanner && (
                <View style={[styles.infoBannerContainer, { backgroundColor: theme.colors.background }]}>
                    <InfoBanner
                        type="info"
                        title="À propos de cette section"
                        message="Parcourez les questions de cette catégorie pour vous familiariser avec les concepts. Utilisez les flèches pour naviguer entre les questions. Chaque question inclut une explication détaillée pour vous aider à comprendre les réponses."
                        icon="book"
                        dismissible={true}
                        collapsible={true}
                        onDismiss={() => setShowInfoBanner(false)}
                    />
                </View>
            )}

            <QuestionSlideView questions={sortedQuestions as Question[]} />
        </View>
    );
};

export default CategoryQuestionsScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        // backgroundColor will be set dynamically
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 10,
        paddingHorizontal: 20,
        paddingBottom: 15,
    },
    backButton: {
        marginRight: 16,
    },
    headerTextContainer: {
        flex: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'left',
    },
    count: {
        fontSize: 14,
        marginTop: 2,
    },
    infoBannerContainer: {
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 8,
    },
});