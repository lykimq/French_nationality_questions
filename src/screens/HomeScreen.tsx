import React from 'react';
import { StyleSheet, Text, View, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CategoryCard from '../components/CategoryCard';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

import questionsData from '../data/questions.json';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen = () => {
    const navigation = useNavigation<HomeScreenNavigationProp>();

    const categories = questionsData.categories;

    const navigateToCategory = (categoryId: string) => {
        navigation.navigate('CategoryQuestions', { categoryId });
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#3F51B5" />

            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <View style={styles.header}>
                    <Text style={styles.title}>Questions Nationalité Française</Text>
                    <Text style={styles.subtitle}>
                        Préparation pour l'entretien de naturalisation
                    </Text>
                </View>
            </SafeAreaView>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                {categories.map((category) => (
                    <CategoryCard
                        key={category.id}
                        title={category.title}
                        description={category.description}
                        icon={category.icon}
                        count={category.questions.length}
                        onPress={() => navigateToCategory(category.id)}
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
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
    },
});

export default HomeScreen;