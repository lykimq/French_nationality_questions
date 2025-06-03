import React from 'react';
import { StyleSheet, Text, View, ScrollView, StatusBar, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CategoryCard from '../components/CategoryCard';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/types';
import { useLanguage, MultiLangCategory, FrenchCategory } from '../contexts/LanguageContext';
import FormattedText from '../components/FormattedText';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const HomeScreen = () => {
    const navigation = useNavigation<HomeScreenNavigationProp>();
    const {
        language,
        toggleLanguage,
        questionsData,
        isTranslationLoaded,
        historyCategories,
        historySubcategories
    } = useLanguage();

    const categories = questionsData.categories;

    const navigateToCategory = (categoryId: string) => {
        navigation.navigate('CategoryQuestions', { categoryId, language });
    };

    const navigateToHistoryQuestions = () => {
        if (!historyCategories) return;

        navigation.navigate('CategoryBasedQuestions', {
            categories: historyCategories.subcategories.map(subcategory => {
                const subcategoryData = historySubcategories[subcategory.id];
                return {
                    id: subcategory.id,
                    title: subcategory.title,
                    title_vi: subcategory.title_vi,
                    description: subcategory.description,
                    description_vi: subcategory.description_vi,
                    icon: subcategory.icon,
                    questions: (subcategoryData?.questions || []).map(q => ({
                        id: q.id,
                        question: q.question,
                        question_vi: q.question_vi,
                        explanation: q.explanation,
                        explanation_vi: q.explanation_vi,
                        image: q.image
                    }))
                };
            }),
            title: historyCategories.title,
            title_vi: historyCategories.title_vi
        });
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#3F51B5" />

            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <View style={styles.header}>
                    <FormattedText style={styles.title}>
                        {language === 'fr' ? 'Questions de Naturalisation' : 'Câu hỏi Nhập tịch'}
                    </FormattedText>
                    <FormattedText style={styles.subtitle}>
                        {language === 'fr'
                            ? 'Préparez votre entretien de naturalisation'
                            : 'Chuẩn bị cho cuộc phỏng vấn nhập tịch của bạn'}
                    </FormattedText>
                    <View style={styles.languageSelector}>
                        <Text style={styles.languageLabel}>FR</Text>
                        <Switch
                            value={language === 'vi'}
                            onValueChange={toggleLanguage}
                            thumbColor="#fff"
                            trackColor={{ false: '#7986CB', true: '#7986CB' }}
                        />
                        <Text style={styles.languageLabel}>VI</Text>
                    </View>
                </View>
            </SafeAreaView>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
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
                            count={category.questions.length}
                            onPress={() => navigateToCategory(category.id)}
                            language={language}
                        />
                    );
                })}

                {historyCategories && (
                    <CategoryCard
                        key="history"
                        title={historyCategories.title}
                        title_vi={historyCategories.title_vi}
                        description={historyCategories.description}
                        description_vi={historyCategories.description_vi}
                        icon={historyCategories.icon}
                        count={Object.values(historySubcategories).reduce((total, subcategory) => total + (subcategory.questions?.length || 0), 0)}
                        onPress={navigateToHistoryQuestions}
                        language={language}
                    />
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    safeArea: {
        backgroundColor: '#3F51B5',
    },
    header: {
        paddingHorizontal: 20,
        paddingBottom: 15,
        paddingTop: 10,
        backgroundColor: '#3F51B5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    subtitle: {
        fontSize: 16,
        color: '#E8EAF6',
        marginTop: 5,
    },
    languageSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        alignSelf: 'flex-end',
    },
    languageLabel: {
        color: '#fff',
        marginHorizontal: 5,
        fontWeight: '600',
    },
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
    },
});

export default HomeScreen;