import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    View,
    ScrollView,
    ActivityIndicator,
    StatusBar,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../shared/contexts/ThemeContext';
import { useIcons } from '../../shared/contexts/IconContext';
import { FormattedText } from '../../shared/components';
import CategoryCard from '../../welcome/CategoryCard';
import { loadFlashCardData, getAllCategories } from '../utils';
import type { FormationCategory } from '../types';
import type { FlashCardStackParamList } from '../navigation/FlashCardStack';

type CategorySelectionScreenNavigationProp = NativeStackNavigationProp<FlashCardStackParamList>;

const CATEGORY_ICON_KEYS: { [key: string]: string } = {
    principes_et_valeurs: 'flag',
    histoire_geographie_et_culture: 'map',
    droits_et_devoirs: 'shield',
    system_et_politique: 'business',
    vivre_dans_la_societe_francaise: 'people',
};

const CategorySelectionScreen: React.FC = () => {
    const navigation = useNavigation<CategorySelectionScreenNavigationProp>();
    const { theme, themeMode } = useTheme();
    const { getJsonIconName, getJsonIconColor } = useIcons();
    const [categories, setCategories] = useState<FormationCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await loadFlashCardData();
            if (data) {
                const allCategories = getAllCategories(data);
                setCategories(allCategories);
            } else {
                setError('Impossible de charger les données');
            }
        } catch (err) {
            setError('Erreur lors du chargement des données');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCategoryPress = (category: FormationCategory) => {
        navigation.navigate('FlashCard', { categoryId: category.id });
    };

    if (isLoading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <FormattedText style={[styles.loadingText, { color: theme.colors.textMuted, marginTop: 16 }]}>
                    Chargement...
                </FormattedText>
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.container, { backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
                <Ionicons name="alert-circle" size={48} color={theme.colors.error} />
                <FormattedText style={[styles.errorText, { color: theme.colors.text, marginTop: 16, textAlign: 'center' }]}>
                    {error}
                </FormattedText>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <StatusBar barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'} />
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <View style={[styles.header, { backgroundColor: theme.colors.headerBackground }]}>
                    <FormattedText style={[styles.headerTitle, { color: theme.colors.headerText }]}>
                        Cartes Flash
                    </FormattedText>
                    <FormattedText style={[styles.headerSubtitle, { color: theme.colors.headerText + 'B3' }]}>
                        Choisissez une catégorie
                    </FormattedText>
                </View>

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={true}
                >
                    {categories.map((category) => {
                        const iconKey = CATEGORY_ICON_KEYS[category.id] || 'book';
                        const questionCount = category.questions?.length || 0;

                        return (
                            <CategoryCard
                                key={category.id}
                                title={category.title}
                                description={category.description}
                                icon={iconKey}
                                count={questionCount}
                                onPress={() => handleCategoryPress(category)}
                            />
                        );
                    })}
                </ScrollView>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    loadingText: {
        fontSize: 16,
    },
    errorText: {
        fontSize: 16,
    },
});

export default CategorySelectionScreen;

