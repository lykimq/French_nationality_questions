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
            title_vi: 'Kiểm tra Địa lý',
            title_fr: 'Test de Géographie',
            description_vi: 'Tập trung vào câu hỏi địa lý',
            description_fr: 'Se concentrer sur les questions de géographie',
            icon: 'map',
            questionCount: 11,
            timeLimit: 15,
            color: '#00B4D8',
            isRecommended: testProgress.totalTestsTaken === 0,
        },
        {
            mode: 'history_culture_comprehensive',
            title_vi: 'Kiểm tra Lịch sử & Văn hoá',
            title_fr: 'Test Histoire & Culture',
            description_vi: 'Bài kiểm tra toàn diện về lịch sử, địa lý và văn hóa Pháp (165 câu hỏi)',
            description_fr: 'Test complet sur l\'histoire, géographie et culture française (165 questions)',
            icon: 'library',
            questionCount: 165,
            timeLimit: 120,
            color: '#F77F00',
            isRecommended: testProgress.totalTestsTaken > 0 && testProgress.averageScore > 60,
        },
        {
            mode: 'mock_interview',
            title_vi: 'Phỏng vấn thử',
            title_fr: 'Entretien Fictif',
            description_vi: 'Mô phỏng điều kiện phỏng vấn thực tế',
            description_fr: 'Simuler les conditions d\'entretien réelles',
            icon: 'person',
            questionCount: 30,
            timeLimit: 45,
            color: '#9B59B6',
            isRecommended: testProgress.averageScore >= 70,
        },
    ], [testProgress.totalTestsTaken, testProgress.averageScore]);

    const getLocalizedModeTitle = (modeOption: MainTestModeOption, language: string, getLocalizedText: (textFr: string, textVi: string) => string): string => {
        return getLocalizedText(modeOption.title_fr, modeOption.title_vi);
    };

    const getLocalizedModeDescription = (modeOption: MainTestModeOption, language: string, getLocalizedText: (textFr: string, textVi: string) => string): string => {
        return getLocalizedText(modeOption.description_fr, modeOption.description_vi);
    };

    return {
        testModes,
        getLocalizedModeTitle,
        getLocalizedModeDescription,
    };
};