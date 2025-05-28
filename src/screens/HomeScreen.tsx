import React from 'react';
import { StyleSheet, Text, View, ScrollView, StatusBar, Switch, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CategoryCard from '../components/CategoryCard';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/types';
import { useLanguage, MultiLangCategory, FrenchCategory } from '../contexts/LanguageContext';
import historyData from '../data/history_subcategories_fr.json';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const HomeScreen = () => {
    const navigation = useNavigation<HomeScreenNavigationProp>();
    const { language, toggleLanguage, questionsData, isTranslationLoaded } = useLanguage();

    const categories = questionsData.categories;

    const navigateToCategory = (categoryId: string) => {
        navigation.navigate('CategoryQuestions', { categoryId, language });
    };

    const navigateToHistoryQuestions = () => {
        navigation.navigate('CategoryBasedQuestions', {
            categories: historyData.subcategories.map(subcategory => ({
                id: subcategory.id,
                title: subcategory.title,
                questions: subcategory.questions
            })),
            title: historyData.title
        });
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#3F51B5" />

            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <View style={styles.header}>
                    <Text style={styles.title}>
                        {language === 'fr' ? 'Questions de Naturalisation' : 'Câu hỏi Nhập tịch'}
                    </Text>
                    <Text style={styles.subtitle}>
                        {language === 'fr'
                            ? 'Préparez votre entretien de naturalisation'
                            : 'Chuẩn bị cho cuộc phỏng vấn nhập tịch của bạn'}
                    </Text>
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
                <CategoryCard
                    key="history"
                    title={historyData.title}
                    description={historyData.description}
                    icon={historyData.icon}
                    count={historyData.subcategories.reduce((total, subcategory) => total + subcategory.questions.length, 0)}
                    onPress={navigateToHistoryQuestions}
                    language={language}
                />

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