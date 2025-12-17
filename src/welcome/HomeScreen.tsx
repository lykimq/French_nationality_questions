import React from 'react';
import { StyleSheet, View, ScrollView, StatusBar, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CategoryCard from './CategoryCard';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList, MultiLangCategory, FrenchCategory } from '../types';
import { useLanguage } from '../shared/contexts/LanguageContext';
import { useTheme } from '../shared/contexts/ThemeContext';
import { FormattedText } from '../shared/components';

type HomeScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList>;

const HomeScreen = () => {
    const navigation = useNavigation<HomeScreenNavigationProp>();
    const { theme, themeMode } = useTheme();
    const {
        language,
        toggleLanguage,
        questionsData,
        isTranslationLoaded,
        historyCategories,
        historySubcategories
    } = useLanguage();

    const categories = questionsData?.categories || [];

    const navigateToCategory = (categoryId: string) => {
        navigation.navigate('CategoryQuestions', { categoryId, language });
    };

    const navigateToHistoryQuestions = () => {
        if (!historyCategories) return;

        navigation.navigate('CategoryBasedQuestions', {
            categories: historyCategories.subcategories.map(subcategory => {
                const subcategoryData = historySubcategories[(subcategory as any).id];
                return {
                    id: (subcategory as any).id,
                    title: (subcategory as any).title,
                    title_vi: (subcategory as any).title_vi,
                    description: (subcategory as any).description,
                    description_vi: (subcategory as any).description_vi,
                    icon: (subcategory as any).icon,
                    questions: (subcategoryData?.questions || []).map(q => ({
                        id: q.id,
                        question: q.question,
                        question_vi: q.question_vi,
                        explanation: q.explanation,
                        explanation_vi: q.explanation_vi,
                        image: (q as any).image
                    }))
                };
            }),
            title: (historyCategories as any).title,
            title_vi: (historyCategories as any).title_vi
        });
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.headerBackground} />

            <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.headerBackground }]} edges={['top']}>
                <View style={[styles.header, { backgroundColor: theme.colors.headerBackground }]}>
                    <FormattedText style={[styles.title, { color: theme.colors.headerText }]}>
                        {language === 'fr' ? 'Questions de Naturalisation' : 'Câu hỏi Nhập tịch'}
                    </FormattedText>
                    <FormattedText style={[styles.subtitle, { color: theme.colors.headerText + 'B3' }]}>
                        {language === 'fr'
                            ? 'Préparez votre entretien de naturalisation'
                            : 'Chuẩn bị cho cuộc phỏng vấn nhập tịch của bạn'}
                    </FormattedText>
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

            <ScrollView
                style={[styles.scrollView, { backgroundColor: theme.colors.background }]}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                {categories.length > 0 ? (
                    <>
                        {categories.map((category: FrenchCategory | MultiLangCategory) => {
                            const title_vi = isTranslationLoaded ? (category as MultiLangCategory).title_vi : undefined;
                            const description_vi = isTranslationLoaded ? (category as MultiLangCategory).description_vi : undefined;

                            return (
                                <CategoryCard
                                    key={category.id}
                                    title={category.title}
                                    title_vi={title_vi}
                                    description={category.description}
                                    description_vi={description_vi}
                                    icon={category.icon}
                                    count={category.questions?.length || 0}
                                    onPress={() => navigateToCategory(category.id)}
                                    language={language}
                                />
                            );
                        })}

                        {historyCategories && (
                            <CategoryCard
                                key="history"
                                title={(historyCategories as any).title}
                                title_vi={(historyCategories as any).title_vi}
                                description={(historyCategories as any).description}
                                description_vi={(historyCategories as any).description_vi}
                                icon={(historyCategories as any).icon}
                                count={Object.values(historySubcategories).reduce((total, subcategory) => total + (subcategory.questions?.length || 0), 0)}
                                onPress={navigateToHistoryQuestions}
                                language={language}
                            />
                        )}
                    </>
                ) : (
                    <View style={styles.emptyContainer}>
                        <FormattedText style={[styles.emptyText, { color: theme.colors.textMuted }]}>
                            {language === 'fr' ? 'Chargement des catégories...' : 'Đang tải danh mục...'}
                        </FormattedText>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        // backgroundColor will be set dynamically
    },
    header: {
        paddingHorizontal: 20,
        paddingBottom: 15,
        paddingTop: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 16,
        marginTop: 5,
    },
    languageSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        alignSelf: 'flex-end',
    },
    languageLabel: {
        marginHorizontal: 5,
        fontWeight: '600',
    },
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        flexGrow: 1,
        padding: 20,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
    },
});

export default HomeScreen;