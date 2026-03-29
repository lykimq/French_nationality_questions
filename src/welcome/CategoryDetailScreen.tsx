import React, { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList, Question } from '../types';
import { useData } from '../shared/contexts/DataContext';
import { useTheme } from '../shared/contexts/ThemeContext';
import { getCategoryMasteryStats, getMasteryForQuestionId, MasteryLevel } from '../shared/utils/MasteryUtils';
import { sortQuestionsById } from '../shared/utils/questionUtils';
import { useMastery } from '../shared/contexts/MasteryContext';
import { FormattedText, AppHeader, Icon3D, ProgressBar } from '../shared/components';
import { sharedStyles } from '../shared/utils';

type CategoryDetailRouteProp = RouteProp<HomeStackParamList, 'CategoryDetail'>;
type CategoryDetailNavigationProp = NativeStackNavigationProp<HomeStackParamList>;

const CategoryDetailScreen = () => {
    const route = useRoute<CategoryDetailRouteProp>();
    const navigation = useNavigation<CategoryDetailNavigationProp>();
    const { theme } = useTheme();
    const { categoryId } = route.params;
    const { questionsData } = useData();
    const { masteryMap } = useMastery();

    const category = useMemo(() => 
        questionsData.categories.find(c => c.id === categoryId),
        [questionsData.categories, categoryId]
    );

    const sortedQuestions = useMemo(
        () => sortQuestionsById(category?.questions || []),
        [category?.questions]
    );

    const stats = useMemo(
        () => getCategoryMasteryStats(sortedQuestions, masteryMap),
        [sortedQuestions, masteryMap]
    );

    if (!category) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <FormattedText style={{ color: theme.colors.text }}>Catégorie non trouvée</FormattedText>
            </View>
        );
    }

    const startTraining = () => {
        navigation.navigate('FlashCard', { categoryId });
    };

    const renderQuestionItem = ({ item, index }: { item: Question, index: number }) => {
        const mastery = getMasteryForQuestionId(masteryMap, item.id);
        const isMastered = mastery?.level === MasteryLevel.MASTERED;
        const isLearning = mastery?.level && mastery.level !== MasteryLevel.NEW && !isMastered;

        return (
            <TouchableOpacity 
                style={[styles.questionItem, { borderBottomColor: theme.colors.divider }]}
                onPress={() => navigation.navigate('CategoryQuestions', { categoryId, initialIndex: index })}
            >
                <View style={[styles.questionIdBadge, { backgroundColor: theme.colors.primary + '10' }]}>
                    <FormattedText style={{ color: theme.colors.primary, fontWeight: 'bold', fontSize: 12 }}>
                        {index + 1}
                    </FormattedText>
                </View>
                <FormattedText style={[styles.questionText, { color: theme.colors.text }]} numberOfLines={2}>
                    {item.question}
                </FormattedText>
                {isMastered && (
                    <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                )}
                {isLearning && (
                    <Ionicons name="time" size={20} color="#FF9800" />
                )}
                {!isMastered && !isLearning && (
                    <Ionicons name="ellipse-outline" size={20} color={theme.colors.textMuted} />
                )}
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <AppHeader
                title={category.title}
                subtitle={`${category.questions?.length || 0} questions`}
                showBackButton={true}
                onBackPress={() => navigation.goBack()}
            />

            <View style={styles.content}>
                {/* Header Stats */}
                <View style={[sharedStyles.premiumCard, { backgroundColor: theme.colors.card, marginBottom: 15 }]}>
                    <View style={sharedStyles.spaceBetween}>
                        <View>
                            <FormattedText style={[styles.progressTitle, { color: theme.colors.text }]}>
                                Votre progression
                            </FormattedText>
                            <FormattedText style={[styles.progressValue, { color: theme.colors.primary }]}>
                                {stats.percentage}% maîtrisé
                            </FormattedText>
                        </View>
                        <View style={styles.statsIconsRow}>
                            <View style={styles.miniStat}>
                                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                                <FormattedText style={[styles.miniStatText, { color: theme.colors.text }]}>
                                    {stats.mastered}
                                </FormattedText>
                            </View>
                            <View style={styles.miniStat}>
                                <Ionicons name="time" size={16} color="#FF9800" />
                                <FormattedText style={[styles.miniStatText, { color: theme.colors.text }]}>
                                    {stats.learning}
                                </FormattedText>
                            </View>
                        </View>
                    </View>
                    <ProgressBar 
                        progress={stats.percentage / 100} 
                        height={8} 
                        color={theme.colors.primary}
                        containerStyle={{ marginTop: 15 }}
                    />
                </View>

                {/* Primary Action */}
                <TouchableOpacity 
                    style={[sharedStyles.primaryButton, { backgroundColor: theme.colors.primary, marginBottom: 20 }]}
                    onPress={startTraining}
                >
                    <Ionicons name="play" size={20} color="#FFF" style={{ marginRight: 8 }} />
                    <FormattedText style={{ color: '#FFF', fontWeight: 'bold', fontSize: 16 }}>
                        Démarrer l'entraînement
                    </FormattedText>
                </TouchableOpacity>

                <FormattedText style={[sharedStyles.sectionTitle, { color: theme.colors.text, marginBottom: 8 }]}>
                    Liste des questions
                </FormattedText>
                <FormattedText
                    style={[styles.listHint, { color: theme.colors.textMuted }]}
                    numberOfLines={4}
                >
                    Les icônes suivent votre maîtrise lorsque vous vous évaluez sur les cartes (bouton ci-dessus ou
                    onglet Entraînement). Touchez une ligne pour lire la réponse sans noter.
                </FormattedText>

                <FlatList
                    data={sortedQuestions}
                    renderItem={renderQuestionItem}
                    keyExtractor={(item) => item.id.toString()}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 40 }}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    progressTitle: {
        fontSize: 14,
        fontWeight: '600',
    },
    progressValue: {
        fontSize: 22,
        fontWeight: 'bold',
        marginTop: 2,
    },
    statsIconsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    miniStat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    miniStatText: {
        fontSize: 14,
        fontWeight: '600',
    },
    questionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        gap: 15,
    },
    questionIdBadge: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    questionText: {
        flex: 1,
        fontSize: 15,
        lineHeight: 20,
    },
    listHint: {
        fontSize: 12,
        lineHeight: 16,
        marginBottom: 12,
    },
});

export default CategoryDetailScreen;
