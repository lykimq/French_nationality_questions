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

export const getScoreMessage = (score: number): string => {
    const safeScore = score || 0;
    if (safeScore >= 90) {
        return 'Excellent!';
    } else if (safeScore >= 80) {
        return 'Très bien!';
    } else if (safeScore >= 70) {
        return 'Bien!';
    } else if (safeScore >= 60) {
        return 'Passable';
    } else {
        return 'À améliorer';
    }
};