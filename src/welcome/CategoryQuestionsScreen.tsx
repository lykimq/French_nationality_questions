import { useMemo } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList, Question } from '../types';
import { useData } from '../shared/contexts/DataContext';
import { useTheme } from '../shared/contexts/ThemeContext';
import { sortQuestionsById } from '../shared/utils/questionUtils';
import QuestionSlideView from './QuestionSlideView';
import { FormattedText } from '../shared/components';

type CategoryQuestionsRouteProp = RouteProp<HomeStackParamList, 'CategoryQuestions'>;
type CategoryQuestionsNavigationProp = NativeStackNavigationProp<HomeStackParamList, 'CategoryQuestions'>;

const CategoryQuestionsScreen = () => {
    const route = useRoute<CategoryQuestionsRouteProp>();
    const navigation = useNavigation<CategoryQuestionsNavigationProp>();
    const { theme } = useTheme();
    const { categoryId } = route.params;
    const { questionsData } = useData();

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

            <QuestionSlideView questions={sortedQuestions as Question[]} />
        </View>
    );
};

export default CategoryQuestionsScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {},
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
});