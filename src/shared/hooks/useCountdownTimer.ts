import { useState, useEffect, useRef, useCallback } from 'react';

export interface UseCountdownTimerOptions {
    initialTime: number;
    isActive: boolean;
    onTimeUp: () => void;
    interval?: number;
    autoStart?: boolean;
    onPause?: () => void;
    onResume?: () => void;
}

export interface UseCountdownTimerReturn {
    timeLeft: number;
    formattedTime: string;
    stopTimer: () => void;
    startTimer: () => void;
    resetTimer: () => void;
    setTimeLeft: (time: number) => void;
    isRunning: boolean;
}

export const useCountdownTimer = ({
    initialTime,
    isActive,
    onTimeUp,
    interval = 1000,
    autoStart = true,
    onPause,
    onResume,
}: UseCountdownTimerOptions): UseCountdownTimerReturn => {
    const [timeLeft, setTimeLeft] = useState(initialTime);
    const [isRunning, setIsRunning] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const wasActiveRef = useRef(isActive);

    const stopTimer = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
            setIsRunning(false);
            if (onPause && wasActiveRef.current) {
                onPause();
            }
        }
    }, [onPause]);

    const startTimer = useCallback(() => {
        if (timerRef.current) {
            return;
        }

        if (timeLeft <= 0) {
            onTimeUp();
            return;
        }

        setIsRunning(true);
        if (onResume && !wasActiveRef.current) {
            onResume();
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
        }, interval);
    }, [timeLeft, onTimeUp, interval, stopTimer, onResume]);

    const resetTimer = useCallback(() => {
        stopTimer();
        setTimeLeft(initialTime);
        setIsRunning(false);
    }, [initialTime, stopTimer]);

    const setTime = useCallback((time: number) => {
        setTimeLeft(Math.max(0, time));
    }, []);

    useEffect(() => {
        setTimeLeft(initialTime);
    }, [initialTime]);

    useEffect(() => {
        wasActiveRef.current = isActive;

        if (!isActive) {
            stopTimer();
            return;
        }

        if (autoStart && timeLeft > 0) {
            startTimer();
        }

        return () => {
            stopTimer();
        };
    }, [isActive, autoStart, timeLeft, startTimer, stopTimer]);

    useEffect(() => {
        return () => {
            stopTimer();
        };
    }, [stopTimer]);

    const formatTime = useCallback((seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, []);

    return {
        timeLeft,
        formattedTime: formatTime(timeLeft),
        stopTimer,
        startTimer,
        resetTimer,
        setTimeLeft: setTime,
        isRunning,
    };
};

