import { useState, useEffect, useRef, useCallback } from 'react';

interface UseTimerProps {
    initialTime: number;
    isActive: boolean;
    onTimeUp: () => void;
}

/**
 * Hook to manage exam countdown timer
 */
export const useTimer = ({ initialTime, isActive, onTimeUp }: UseTimerProps) => {
    const [timeLeft, setTimeLeft] = useState(initialTime);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const stopTimer = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    useEffect(() => {
        if (!isActive) {
            stopTimer();
            return;
        }

        if (timeLeft <= 0) {
            onTimeUp();
            stopTimer();
            return;
        }

        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    onTimeUp();
                    stopTimer();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return stopTimer;
    }, [isActive, onTimeUp, stopTimer]);

    const formatTime = useCallback((seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, []);

    return {
        timeLeft,
        formattedTime: formatTime(timeLeft),
        stopTimer,
        setTimeLeft
    };
};
