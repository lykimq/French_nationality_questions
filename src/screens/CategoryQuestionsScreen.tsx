import React, { useEffect } from 'react';
import { Text, View, TouchableOpacity, StatusBar, Switch, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/types';
import { useLanguage, MultiLangCategory } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import QuestionSlideView from '../components/QuestionSlideView';
import { Question } from '../types/questions';
import FormattedText from '../components/FormattedText';

type CategoryQuestionsRouteProp = RouteProp<RootStackParamList, 'CategoryQuestions'>;
type CategoryQuestionsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CategoryQuestions'>;

const CategoryQuestionsScreen = () => {
    const route = useRoute<CategoryQuestionsRouteProp>();
    const navigation = useNavigation<CategoryQuestionsNavigationProp>();
    const { theme, themeMode } = useTheme();
    const { categoryId, language: initialLanguage } = route.params;
    const { language, setLanguage, toggleLanguage, questionsData, isTranslationLoaded } = useLanguage();

    useEffect(() => {
        if (initialLanguage && initialLanguage !== language) {
            setLanguage(initialLanguage);
        }
    }, [initialLanguage]);

    const category = questionsData.categories.find(c => c.id === categoryId);

    if (!category) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <FormattedText style={{ color: theme.colors.text }}>Category not found</FormattedText>
            </View>
        );
    }

    const title_vi = isTranslationLoaded ? (category as MultiLangCategory).title_vi : undefined;
    const displayTitle = language === 'fr'
        ? category.title
        : `${title_vi || category.title}\n${category.title}`;
    const questionsCount = language === 'fr'
        ? `${category.questions.length} questions`
        : `${category.questions.length} câu hỏi`;

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
                    <View style={styles.languageSelector}>
                        <FormattedText style={[styles.languageLabel, { color: theme.colors.headerText }]}>FR</FormattedText>
                        <Switch
                            value={language === 'vi'}
                            onValueChange={toggleLanguage}
                            thumbColor={theme.colors.switchThumb}
                            trackColor={{ false: theme.colors.primaryLight, true: theme.colors.primaryLight }}
                        />
                        <FormattedText style={[styles.languageLabel, { color: theme.colors.headerText }]}>VI</FormattedText>
                    </View>
                </View>
            </SafeAreaView>

            <QuestionSlideView questions={category.questions as Question[]} language={language} />
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
    languageSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 10,
    },
    languageLabel: {
        marginHorizontal: 5,
        fontWeight: '600',
        fontSize: 12,
    },
});