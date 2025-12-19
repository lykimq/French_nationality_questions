import { useState, useEffect, useRef, useCallback } from 'react';

export interface UseCountdownTimerOptions {
    /**
     * Initial time in seconds
     */
    initialTime: number;
    
    /**
     * Whether the timer is active
     */
    isActive: boolean;
    
    /**
     * Callback when timer reaches zero
     */
    onTimeUp: () => void;
    
    /**
     * Interval in milliseconds (default: 1000ms = 1 second)
     */
    interval?: number;
    
    /**
     * Whether to auto-start when isActive becomes true (default: true)
     */
    autoStart?: boolean;
    
    /**
     * Callback when timer is paused
     */
    onPause?: () => void;
    
    /**
     * Callback when timer is resumed
     */
    onResume?: () => void;
}

export interface UseCountdownTimerReturn {
    /**
     * Time remaining in seconds
     */
    timeLeft: number;
    
    /**
     * Formatted time string (MM:SS)
     */
    formattedTime: string;
    
    /**
     * Manually stop the timer
     */
    stopTimer: () => void;
    
    /**
     * Manually start the timer
     */
    startTimer: () => void;
    
    /**
     * Reset timer to initial time
     */
    resetTimer: () => void;
    
    /**
     * Set time manually
     */
    setTimeLeft: (time: number) => void;
    
    /**
     * Whether timer is currently running
     */
    isRunning: boolean;
}

/**
 * Shared countdown timer hook with flexible configuration
 * Handles countdown logic, formatting, and lifecycle management
 */
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

    // Reset timer when initialTime changes
    useEffect(() => {
        setTimeLeft(initialTime);
    }, [initialTime]);

    // Handle isActive changes
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

    // Cleanup on unmount
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

