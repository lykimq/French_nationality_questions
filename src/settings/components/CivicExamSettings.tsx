import React from 'react';
import { View, Alert } from 'react-native';
import { useTheme } from '../../shared/contexts/ThemeContext';
import { useCivicExam } from '../../test_civic/hooks/useCivicExam';
import { FormattedText } from '../../shared/components';
import SettingItem from './SettingItem';
import { settingsStyles } from './settingsStyles';

interface CivicExamSettingsProps {
    language: 'fr' | 'vi';
}

const CivicExamSettings: React.FC<CivicExamSettingsProps> = ({ language }) => {
    const { theme } = useTheme();
    const { examProgress, resetProgress } = useCivicExam();

    const handleResetStatistics = () => {
        const title = language === 'fr' ? 'Réinitialiser les statistiques' : 'Đặt lại thống kê';
        const message = language === 'fr'
            ? 'Êtes-vous sûr de vouloir réinitialiser toutes les statistiques de l\'examen civique ? Cette action est irréversible et supprimera tous vos scores, progrès et statistiques.'
            : 'Bạn có chắc chắn muốn đặt lại tất cả thống kê của kỳ thi công dân? Hành động này không thể hoàn tác và sẽ xóa tất cả điểm số, tiến độ và thống kê của bạn.';

        Alert.alert(
            title,
            message,
            [
                {
                    text: language === 'fr' ? 'Annuler' : 'Hủy',
                    style: 'cancel',
                },
                {
                    text: language === 'fr' ? 'Réinitialiser' : 'Đặt lại',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            console.warn('🔄 RESET BUTTON CLICKED - Starting reset process...');
                            console.warn('📊 Current state before reset:', {
                                totalExamsTaken: examProgress.totalExamsTaken,
                                totalPracticeSessions: examProgress.totalPracticeSessions,
                                bestScore: examProgress.bestScore,
                                passedExams: examProgress.passedExams,
                            });
                            
                            await resetProgress();
                            
                            console.warn('✅ RESET COMPLETE - Check if numbers are now zero');
                            
                            Alert.alert(
                                language === 'fr' ? 'Réinitialisation réussie' : 'Đặt lại thành công',
                                language === 'fr'
                                    ? 'Toutes les statistiques ont été réinitialisées.'
                                    : 'Tất cả thống kê đã được đặt lại.',
                                [{ 
                                    text: 'OK',
                                    onPress: () => {
                                        console.warn('✅ User confirmed reset success');
                                    }
                                }]
                            );
                        } catch (error) {
                            console.error('❌ ERROR resetting statistics:', error);
                            Alert.alert(
                                language === 'fr' ? 'Erreur' : 'Lỗi',
                                language === 'fr'
                                    ? 'Une erreur est survenue lors de la réinitialisation.'
                                    : 'Đã xảy ra lỗi khi đặt lại.',
                                [{ text: 'OK' }]
                            );
                        }
                    },
                },
            ]
        );
    };

    const hasStatistics = examProgress.totalExamsTaken > 0 || 
                         examProgress.totalPracticeSessions > 0 ||
                         examProgress.bestScore > 0;

    if (!hasStatistics) {
        return null;
    }

    return (
        <View style={[settingsStyles.section, { backgroundColor: theme.colors.card }]}>
            <FormattedText style={[settingsStyles.sectionTitle, { color: theme.colors.textSecondary, borderBottomColor: theme.colors.divider }]}>
                {language === 'fr' ? 'Statistiques de l\'examen civique' : 'Thống kê kỳ thi công dân'}
            </FormattedText>

            <SettingItem
                title="Réinitialiser les statistiques"
                title_vi="Đặt lại thống kê"
                icon={theme.icons.refresh}
                iconColor={theme.colors.error}
                onPress={handleResetStatistics}
                language={language}
            />
        </View>
    );
};

export default CivicExamSettings;

