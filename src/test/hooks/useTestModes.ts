import { useMemo } from 'react';
import { MainTestModeOption } from '../../types';

interface UseTestModesProps {
    testProgress: {
        totalTestsTaken: number;
        averageScore: number;
    };
}

export const useTestModes = ({ testProgress }: UseTestModesProps) => {
    const testModes: MainTestModeOption[] = useMemo(() => [
        {
            mode: 'geography_only',
            title: 'Test de Géographie',
            description: 'Se concentrer sur les questions de géographie',
            icon: 'map',
            questionCount: 11,
            timeLimit: 15,
            color: '#00B4D8',
            isRecommended: testProgress.totalTestsTaken === 0,
        },
        {
            mode: 'history_culture_comprehensive',
            title: 'Test Histoire & Culture',
            description: 'Test complet sur l\'histoire, géographie et culture française (165 questions)',
            icon: 'library',
            questionCount: 165,
            timeLimit: 120,
            color: '#F77F00',
            isRecommended: testProgress.totalTestsTaken > 0 && testProgress.averageScore > 60,
        },
        {
            mode: 'mock_interview',
            title: 'Entretien Fictif',
            description: 'Simuler les conditions d\'entretien réelles',
            icon: 'person',
            questionCount: 30,
            timeLimit: 45,
            color: '#9B59B6',
            isRecommended: testProgress.averageScore >= 70,
        },
    ], [testProgress.totalTestsTaken, testProgress.averageScore]);

    const getLocalizedModeTitle = (modeOption: MainTestModeOption): string => {
        return modeOption.title;
    };

    const getLocalizedModeDescription = (modeOption: MainTestModeOption): string => {
        return modeOption.description;
    };

    return {
        testModes,
        getLocalizedModeTitle,
        getLocalizedModeDescription,
    };
};