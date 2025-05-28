import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StatusBar, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/types';
import { useLanguage } from '../contexts/LanguageContext';
import CategorySlideView from '../components/CategorySlideView';
import CategorySelectionView from '../components/CategorySelectionView';
import { commonStyles as styles } from '../styles/questionViews';

type CategoryBasedQuestionsRouteProp = RouteProp<RootStackParamList, 'CategoryBasedQuestions'>;

const CategoryBasedQuestionsScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const route = useRoute<CategoryBasedQuestionsRouteProp>();
    const { language, toggleLanguage } = useLanguage();
    const { categories, title } = route.params;

    const [selectedCategoryIndex, setSelectedCategoryIndex] = useState<number | null>(null);

    const totalQuestions = categories.reduce((total, category) => total + category.questions.length, 0);
    const questionsCount = `${totalQuestions} ${language === 'fr' ? 'questions' : 'câu hỏi'}`;

    const handleBack = () => {
        if (selectedCategoryIndex !== null) {
            setSelectedCategoryIndex(null);
        } else {
            navigation.goBack();
        }
    };

    const getCurrentTitle = () => {
        if (selectedCategoryIndex !== null) {
            return categories[selectedCategoryIndex].title;
        }
        return title;
    };

    const getCurrentCount = () => {
        if (selectedCategoryIndex !== null) {
            const count = categories[selectedCategoryIndex].questions.length;
            return `${count} ${language === 'fr' ? 'questions' : 'câu hỏi'}`;
        }
        return questionsCount;
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#3F51B5" />

            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={handleBack}
                    >
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.title}>{getCurrentTitle()}</Text>
                        <Text style={styles.count}>{getCurrentCount()}</Text>
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

            {selectedCategoryIndex !== null ? (
                <CategorySlideView
                    categories={[categories[selectedCategoryIndex]]}
                    language={language}
                />
            ) : (
                <CategorySelectionView
                    categories={categories}
                    language={language}
                    onSelectCategory={setSelectedCategoryIndex}
                />
            )}
        </View>
    );
};

export default CategoryBasedQuestionsScreen;