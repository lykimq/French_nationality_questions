import { useCountdownTimer } from '../../shared/hooks/useCountdownTimer';

interface UseTimerProps {
    initialTime: number;
    isActive: boolean;
    onTimeUp: () => void;
}

/**
 * Hook to manage exam countdown timer
 * Wrapper around shared countdown timer hook for backward compatibility
 */
export const useTimer = ({ initialTime, isActive, onTimeUp }: UseTimerProps) => {
    const timer = useCountdownTimer({
        initialTime,
        isActive,
        onTimeUp,
        autoStart: true,
    });

    return {
        timeLeft: timer.timeLeft,
        formattedTime: timer.formattedTime,
        stopTimer: timer.stopTimer,
        setTimeLeft: timer.setTimeLeft,
    };
};
