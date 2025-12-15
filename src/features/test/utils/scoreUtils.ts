interface ThemeColors {
    success: string;
    warning: string;
    error: string;
}

interface Theme {
    colors: ThemeColors;
}

export const getScoreColor = (score: number, theme: Theme): string => {
    const safeScore = score || 0;
    if (safeScore >= 80) return theme.colors.success;
    if (safeScore >= 60) return theme.colors.warning;
    return theme.colors.error;
};

export const getScoreMessage = (score: number, language: string): string => {
    const safeScore = score || 0;
    if (safeScore >= 90) {
        return language === 'fr' ? 'Excellent!' : 'Xuất sắc!';
    } else if (safeScore >= 80) {
        return language === 'fr' ? 'Très bien!' : 'Rất tốt!';
    } else if (safeScore >= 70) {
        return language === 'fr' ? 'Bien!' : 'Tốt!';
    } else if (safeScore >= 60) {
        return language === 'fr' ? 'Passable' : 'Đạt';
    } else {
        return language === 'fr' ? 'À améliorer' : 'Cần cải thiện';
    }
};