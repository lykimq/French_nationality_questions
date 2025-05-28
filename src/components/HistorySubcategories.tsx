import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { HistorySubcategory, Language } from '../types/history';
import { historyStyles as styles } from '../styles/historyStyles';
import CategoryCard from './CategoryCard';
import HistoryQuestions from './HistoryQuestions';

interface HistorySubcategoriesProps {
    subcategories: HistorySubcategory[];
    language?: Language;
    onBack?: () => void;
}

const HistorySubcategories: React.FC<HistorySubcategoriesProps> = ({
    subcategories,
    language = 'fr',
    onBack
}) => {
    const [selectedSubcategory, setSelectedSubcategory] = useState<HistorySubcategory | null>(null);

    if (selectedSubcategory) {
        return (
            <HistoryQuestions
                subcategory={selectedSubcategory}
                language={language}
                onBack={() => setSelectedSubcategory(null)}
            />
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View>
                {subcategories.map((subcategory) => (
                    <CategoryCard
                        key={subcategory.id}
                        title={subcategory.title}
                        title_vi={subcategory.title_vi}
                        description={subcategory.description}
                        description_vi={subcategory.description_vi}
                        icon={subcategory.icon}
                        count={subcategory.questions.length}
                        onPress={() => setSelectedSubcategory(subcategory)}
                        language={language}
                    />
                ))}
            </View>
        </ScrollView>
    );
};

export default HistorySubcategories;