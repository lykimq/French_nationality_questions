import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import QuestionCard from '../components/QuestionCard';

import questionsData from '../data/questions.json';

type CategoryQuestionsRouteProp = RouteProp<RootStackParamList, 'CategoryQuestions'>;
type CategoryQuestionsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CategoryQuestions'>;

const CategoryQuestionsScreen = () => {
    const route = useRoute<CategoryQuestionsRouteProp>();
    const navigation = useNavigation<CategoryQuestionsNavigationProp>();
    const { categoryId } = route.params;

    const category = questionsData.categories.find(c => c.id === categoryId);

    if (!category) {
        return (
            <View style={styles.container}>
                <Text>Category not found</Text>
            </View>
        );
    }

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
                        <Text style={styles.title}>{category.title}</Text>
                        <Text style={styles.count}>{category.questions.length} questions</Text>
                    </View>
                </View>
            </SafeAreaView>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                {category.questions.map((question) => (
                    <QuestionCard
                        key={question.id}
                        id={question.id}
                        question={question.question}
                        translation={question.translation}
                        answer={question.answer}
                        explanation={question.explanation}
                    />
                ))}
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
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
    },
});

export default CategoryQuestionsScreen;