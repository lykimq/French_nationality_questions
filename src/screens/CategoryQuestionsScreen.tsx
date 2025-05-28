import React, { useEffect } from 'react';
import { Text, View, TouchableOpacity, StatusBar, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useLanguage, MultiLangCategory } from '../contexts/LanguageContext';
import { useDisplaySettings } from './SettingsScreen';
import QuestionListView from '../components/QuestionListView';
import QuestionSlideView from '../components/QuestionSlideView';
import { commonStyles as styles } from '../styles/questionViews';
import { Question } from '../types/questions';

type CategoryQuestionsRouteProp = RouteProp<RootStackParamList, 'CategoryQuestions'>;
type CategoryQuestionsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CategoryQuestions'>;

const CategoryQuestionsScreen = () => {
    const route = useRoute<CategoryQuestionsRouteProp>();
    const navigation = useNavigation<CategoryQuestionsNavigationProp>();
    const { categoryId, language: initialLanguage } = route.params;
    const { language, setLanguage, toggleLanguage, questionsData, isTranslationLoaded } = useLanguage();
    const { isSlideMode } = useDisplaySettings();

    useEffect(() => {
        if (initialLanguage && initialLanguage !== language) {
            setLanguage(initialLanguage);
        }
    }, [initialLanguage]);

    const category = questionsData.categories.find(c => c.id === categoryId);

    if (!category) {
        return (
            <View style={styles.container}>
                <Text>Category not found</Text>
            </View>
        );
    }

    const title_vi = isTranslationLoaded ? (category as MultiLangCategory).title_vi : undefined;
    const displayTitle = language === 'fr' ? category.title : (title_vi || category.title);
    const questionsCount = language === 'fr'
        ? `${category.questions.length} questions`
        : `${category.questions.length} câu hỏi`;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#3F51B5" />

            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.title}>{displayTitle}</Text>
                        <Text style={styles.count}>{questionsCount}</Text>
                    </View>
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

            {isSlideMode ? (
                <QuestionSlideView questions={category.questions as Question[]} language={language} />
            ) : (
                <QuestionListView questions={category.questions as Question[]} language={language} />
            )}
        </View>
    );
};

export default CategoryQuestionsScreen;