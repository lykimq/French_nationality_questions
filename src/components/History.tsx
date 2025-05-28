import React from 'react';
import { View } from 'react-native';
import { historyStyles as styles } from '../styles/historyStyles';
import HistorySubcategories from './HistorySubcategories';
import historyDataFr from '../data/history_subcategories_fr.json';
import historyDataVi from '../data/history_subcategories_vi.json';
import { Language } from '../types/history';

interface HistoryProps {
    language?: Language;
    onBack?: () => void;
}

const History: React.FC<HistoryProps> = ({
    language = 'fr',
    onBack
}) => {
    const historyData = language === 'fr' ? historyDataFr : historyDataVi;

    return (
        <View style={styles.container}>
            <HistorySubcategories
                subcategories={historyData.subcategories}
                language={language}
                onBack={onBack}
            />
        </View>
    );
};

export default History;