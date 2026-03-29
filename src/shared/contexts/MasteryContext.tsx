import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
    QuestionMastery, 
    MasteryLevel, 
    PerformanceRating, 
    calculateNextReview, 
    createInitialMastery 
} from '../utils/MasteryUtils';

interface DailyStats {
    date: string; // YYYY-MM-DD
    count: number;
    goal: number;
}

interface MasteryState {
    masteryMap: Record<number, QuestionMastery>; // id -> mastery
    dailyStats: DailyStats;
    totalStreak: number;
    isLoading: boolean;
}

interface MasteryContextProps extends MasteryState {
    updateMastery: (questionId: number, rating: PerformanceRating) => Promise<void>;
    resetProgress: () => Promise<void>;
    getQuestionsByLevel: (level: MasteryLevel) => number[];
    getGlobalMasteryPercentage: () => number;
}

const MasteryContext = createContext<MasteryContextProps | undefined>(undefined);

const STORAGE_KEY = '@mastery_data_v1';
const DAILY_GOAL_DEFAULT = 20;

export const MasteryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, setState] = useState<MasteryState>({
        masteryMap: {},
        dailyStats: {
            date: new Date().toISOString().split('T')[0],
            count: 0,
            goal: DAILY_GOAL_DEFAULT,
        },
        totalStreak: 0,
        isLoading: true,
    });

    // Load data from AsyncStorage
    useEffect(() => {
        const loadPersistedData = async () => {
            try {
                const stored = await AsyncStorage.getItem(STORAGE_KEY);
                const today = new Date().toISOString().split('T')[0];
                const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

                if (stored) {
                    const parsed = JSON.parse(stored);
                    
                    let newStreak = parsed.totalStreak || 0;
                    if (parsed.dailyStats.date === yesterday) {
                        // Streak continues
                    } else if (parsed.dailyStats.date !== today) {
                        // More than 1 day missed, streak reset
                        newStreak = 0;
                    }

                    // Reset daily count if it's a new day
                    if (parsed.dailyStats.date !== today) {
                        parsed.dailyStats = {
                            date: today,
                            count: 0,
                            goal: parsed.dailyStats.goal || DAILY_GOAL_DEFAULT,
                        };
                    }
                    
                    setState({ 
                        ...parsed, 
                        totalStreak: newStreak,
                        isLoading: false 
                    });
                } else {
                    setState(prev => ({ ...prev, isLoading: false }));
                }
            } catch (err) {
                console.error('Failed to load mastery data', err);
                setState(prev => ({ ...prev, isLoading: false }));
            }
        };

        loadPersistedData();
    }, []);

    // Save data to AsyncStorage
    const saveData = useCallback(async (newState: MasteryState) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
        } catch (err) {
            console.error('Failed to save mastery data', err);
        }
    }, []);

    const updateMastery = useCallback(async (questionId: number, rating: PerformanceRating) => {
        setState(prev => {
            const currentMastery = prev.masteryMap[questionId] || createInitialMastery(questionId);
            const updatedMastery = calculateNextReview(currentMastery, rating);
            
            const newMap = {
                ...prev.masteryMap,
                [questionId]: updatedMastery,
            };

            const today = new Date().toISOString().split('T')[0];
            const newDailyStats = {
                ...prev.dailyStats,
                count: prev.dailyStats.count + 1,
                date: today,
            };

            // Increment streak on first practice of the day
            let newStreak = prev.totalStreak;
            if (prev.dailyStats.count === 0) {
                newStreak += 1;
            }

            const newState = {
                ...prev,
                masteryMap: newMap,
                dailyStats: newDailyStats,
                totalStreak: newStreak,
            };

            saveData(newState);
            return newState;
        });
    }, [saveData]);

    const resetProgress = async () => {
        const initialState: MasteryState = {
            masteryMap: {},
            dailyStats: {
                date: new Date().toISOString().split('T')[0],
                count: 0,
                goal: DAILY_GOAL_DEFAULT,
            },
            totalStreak: 0,
            isLoading: false,
        };
        setState(initialState);
        await saveData(initialState);
    };

    const getQuestionsByLevel = (level: MasteryLevel): number[] => {
        return Object.values(state.masteryMap)
            .filter(m => m.level === level)
            .map(m => m.id);
    };

    const getGlobalMasteryPercentage = (): number => {
        const masterys = Object.values(state.masteryMap);
        if (masterys.length === 0) return 0;
        
        const totalScore = masterys.reduce((acc, m) => {
            if (m.level === MasteryLevel.MASTERED) return acc + 1;
            if (m.level === MasteryLevel.REVIEW) return acc + 0.5;
            if (m.level === MasteryLevel.LEARNING) return acc + 0.2;
            return acc;
        }, 0);
        
        return Math.round((totalScore / masterys.length) * 100);
    };

    return (
        <MasteryContext.Provider 
            value={{ 
                ...state, 
                updateMastery, 
                resetProgress, 
                getQuestionsByLevel, 
                getGlobalMasteryPercentage 
            }}
        >
            {children}
        </MasteryContext.Provider>
    );
};

export const useMastery = () => {
    const context = useContext(MasteryContext);
    if (!context) {
        throw new Error('useMastery must be used within a MasteryProvider');
    }
    return context;
};
