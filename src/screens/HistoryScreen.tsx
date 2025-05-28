import React from 'react';
import { View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/types';
import History from '../components/History';

type HistoryScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const HistoryScreen = () => {
    const navigation = useNavigation<HistoryScreenNavigationProp>();
    const route = useRoute();
    const language = (route.params as { language?: 'fr' | 'vi' })?.language || 'fr';

    return (
        <History
            language={language}
            onBack={() => navigation.goBack()}
        />
    );
};

export default HistoryScreen;