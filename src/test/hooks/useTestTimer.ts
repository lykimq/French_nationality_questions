import { useState, useEffect, useCallback } from 'react';

interface UseTestTimerProps {
    currentSession: any;
    onTimeUp: () => void;
}

export const useTestTimer = ({ currentSession, onTimeUp }: UseTestTimerProps) => {
    const [timeLeft, setTimeLeft] = useState<number | null>(null);

    // Initialize timer if test has time limit
    useEffect(() => {
        if (currentSession?.mode === 'geography_only' || currentSession?.mode === 'mock_interview' || currentSession?.mode === 'history_culture_comprehensive') {
            let timeLimit;
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
            const elapsed = Math.floor((new Date().getTime() - currentSession.startTime.getTime()) / 1000);
            setTimeLeft(Math.max(0, timeLimit - elapsed));
        }
    }, [currentSession]);

    // Timer countdown
    useEffect(() => {
        if (timeLeft === null || timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev === null || prev <= 1) {
                    onTimeUp();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, onTimeUp]);

    const formatTime = useCallback((seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, []);

    return { timeLeft, formatTime };
};
