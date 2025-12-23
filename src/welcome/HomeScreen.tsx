import React from 'react';
import { StyleSheet, View, ScrollView, StatusBar, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CategoryCard from './CategoryCard';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList, FrenchCategory } from '../types';
import { useData } from '../shared/contexts/DataContext';
import { useTheme } from '../shared/contexts/ThemeContext';
import { FormattedText } from '../shared/components';

type HomeScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList>;

const HomeScreen = () => {
    const navigation = useNavigation<HomeScreenNavigationProp>();
    const { theme, themeMode } = useTheme();
    const { questionsData } = useData();

    const categories = questionsData?.categories || [];

    const navigateToCategory = (categoryId: string) => {
        navigation.navigate('CategoryQuestions', { categoryId });
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.headerBackground} />

            <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.headerBackground }]} edges={['top']}>
                <View style={[styles.header, { backgroundColor: theme.colors.headerBackground }]}>
                    <FormattedText style={[styles.title, { color: theme.colors.headerText }]}>
                        Questions de Naturalisation
                    </FormattedText>
                    <FormattedText style={[styles.subtitle, { color: theme.colors.headerText + 'B3' }]}>
                        Préparez votre entretien de naturalisation
                    </FormattedText>
                </View>
            </SafeAreaView>

            <ScrollView
                style={[styles.scrollView, { backgroundColor: theme.colors.background }]}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                {categories.length > 0 ? (
                    <>
                        {categories.map((category: FrenchCategory) => {
                            return (
                                <CategoryCard
                                    key={category.id}
                                    title={category.title}
                                    description={category.description}
                                    icon={category.icon}
                                    count={category.questions?.length || 0}
                                    onPress={() => navigateToCategory(category.id)}
                                />
                            );
                        })}

                    </>
                ) : (
                    <View style={styles.emptyContainer}>
                        <FormattedText style={[styles.emptyText, { color: theme.colors.textMuted }]}>
                            Chargement des catégories...
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