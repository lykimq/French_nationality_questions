import React, { useState } from 'react';
import { View, TouchableOpacity, StatusBar, Switch, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import CategorySlideView from '../components/CategorySlideView';
import CategorySelectionView from '../components/CategorySelectionView';
import FormattedText from '../components/FormattedText';

type CategoryBasedQuestionsRouteProp = RouteProp<HomeStackParamList, 'CategoryBasedQuestions'>;

const CategoryBasedQuestionsScreen = () => {
    const route = useRoute<CategoryBasedQuestionsRouteProp>();
    const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
    const { theme, themeMode } = useTheme();
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
            return language === 'fr'
                ? category.title
                : `${category.title_vi || category.title}\n${category.title}`;
        }
        return language === 'fr'
            ? route.params.title
            : `${route.params.title_vi || route.params.title}\n${route.params.title}`;
    };

    const getCurrentCount = () => {
        if (selectedCategoryIndex !== null) {
            const count = categories[selectedCategoryIndex].questions.length;
            return `${count} ${language === 'fr' ? 'questions' : 'câu hỏi'}`;
        }
        return questionsCount;
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.headerBackground} />

            <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.headerBackground }]} edges={['top']}>
                <View style={[styles.header, { backgroundColor: theme.colors.headerBackground }]}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={handleBack}
                    >
                        <Ionicons name="arrow-back" size={24} color={theme.colors.headerText} />
                    </TouchableOpacity>
                    <View style={styles.headerTextContainer}>
                        <FormattedText style={[styles.title, { color: theme.colors.headerText }]}>{getCurrentTitle()}</FormattedText>
                        <FormattedText style={[styles.count, { color: theme.colors.headerText + 'B3' }]}>{getCurrentCount()}</FormattedText>
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

// These styles are used by other components, so we'll keep them as a function that takes the theme
export const getCommonStyles = (theme: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    safeArea: {
        backgroundColor: theme.colors.headerBackground,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 10,
        paddingHorizontal: 20,
        paddingBottom: 15,
        backgroundColor: theme.colors.headerBackground,
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
        color: theme.colors.headerText,
        textAlign: 'left',
    },
    count: {
        fontSize: 14,
        color: theme.colors.headerText + 'B3',
        marginTop: 2,
    },
    languageSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 10,
    },
    languageLabel: {
        color: theme.colors.headerText,
        marginHorizontal: 5,
        fontWeight: '600',
        fontSize: 12,
    },
});

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
        borderBottomWidth: 1,
    },
    navButton: {
        padding: 10,
    },
    pageIndicator: {
        fontSize: 16,
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
});