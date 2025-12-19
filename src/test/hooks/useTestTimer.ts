import { useState, useEffect } from 'react';
import { useCountdownTimer } from '../../shared/hooks/useCountdownTimer';

interface UseTestTimerProps {
    currentSession: any;
    onTimeUp: () => void;
}

/**
 * Hook for test timer with mode-based time limits
 * Uses shared countdown timer hook internally
 */
export const useTestTimer = ({ currentSession, onTimeUp }: UseTestTimerProps) => {
    const [initialTime, setInitialTime] = useState<number>(0);

    // Calculate initial time based on session mode
    useEffect(() => {
        if (!currentSession) {
            setInitialTime(0);
            return;
        }

        const hasTimeLimit = currentSession.mode === 'geography_only' ||
            currentSession.mode === 'mock_interview' ||
            currentSession.mode === 'history_culture_comprehensive';

        if (!hasTimeLimit) {
            setInitialTime(0);
            return;
        }

        let timeLimit: number;
        switch (currentSession.mode) {
            case 'geography_only':
                timeLimit = 15 * 60; // 15 minutes
                break;
            case 'mock_interview':
                timeLimit = 45 * 60; // 45 minutes
                break;
            case 'history_culture_comprehensive':
                timeLimit = 120 * 60; // 120 minutes
                break;
            default:
                timeLimit = 30 * 60; // 30 minutes default
        }

        // Calculate elapsed time and remaining time
        const elapsed = Math.floor((new Date().getTime() - currentSession.startTime.getTime()) / 1000);
        const remaining = Math.max(0, timeLimit - elapsed);
        setInitialTime(remaining);
    }, [currentSession]);

    const timer = useCountdownTimer({
        initialTime,
        isActive: initialTime > 0 && currentSession !== null,
        onTimeUp,
        autoStart: true,
    });

    return {
        timeLeft: timer.timeLeft,
        formatTime: (seconds: number) => {
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        },
    };
};
