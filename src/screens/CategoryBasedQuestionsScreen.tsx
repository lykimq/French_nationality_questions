import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StatusBar, Switch, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/types';
import { useLanguage } from '../contexts/LanguageContext';
import CategorySlideView from '../components/CategorySlideView';
import CategorySelectionView from '../components/CategorySelectionView';

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
            const category = categories[selectedCategoryIndex];
            return language === 'vi' && category.title_vi ? category.title_vi : category.title;
        }
        return language === 'vi' && route.params.title_vi ? route.params.title_vi : route.params.title;
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

            <SafeAreaView style={commonStyles.safeArea} edges={['top']}>
                <View style={commonStyles.header}>
                    <TouchableOpacity
                        style={commonStyles.backButton}
                        onPress={handleBack}
                    >
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <View style={commonStyles.headerTextContainer}>
                        <Text style={commonStyles.title}>{getCurrentTitle()}</Text>
                        <Text style={commonStyles.count}>{getCurrentCount()}</Text>
                    </View>
                    <View style={commonStyles.languageSelector}>
                        <Text style={commonStyles.languageLabel}>FR</Text>
                        <Switch
                            value={language === 'vi'}
                            onValueChange={toggleLanguage}
                            thumbColor="#fff"
                            trackColor={{ false: '#7986CB', true: '#7986CB' }}
                        />
                        <Text style={commonStyles.languageLabel}>VI</Text>
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


const { width: SCREEN_WIDTH } = Dimensions.get('window');


export const commonStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    safeArea: {
        backgroundColor: '#3F51B5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 10,
        paddingHorizontal: 20,
        paddingBottom: 15,
        backgroundColor: '#3F51B5',
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
        color: '#fff',
    },
    count: {
        fontSize: 14,
        color: '#E8EAF6',
        marginTop: 2,
    },
    languageSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 10,
    },
    languageLabel: {
        color: '#fff',
        marginHorizontal: 5,
        fontWeight: '600',
        fontSize: 12,
    },
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    slideContent: {
        flex: 1,
        paddingHorizontal: 20,
        position: 'relative',
    },
    navigationIndicator: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    navButton: {
        padding: 10,
    },
    pageIndicator: {
        fontSize: 16,
        color: '#666',
        fontWeight: '600',
    },
    middleNavigation: {
        position: 'absolute',
        top: '50%',
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 10,
        zIndex: 1,
        transform: [{ translateY: -20 }],
    },
    middleNavButton: {
        padding: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 25,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    middleNavButtonDisabled: {
        opacity: 0.5,
    },



    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    count: {
        fontSize: 14,
        color: '#E8EAF6',
        marginTop: 2,
    },
    languageSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 10,
    },
    languageLabel: {
        color: '#fff',
        marginHorizontal: 5,
        fontWeight: '600',
        fontSize: 12,
    },
});