import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Store full pick metadata including game info
interface PickData {
    team: 'home' | 'away';
    year: number;
    week: number;
    gameId: number;
    homeTeam: string;
    awayTeam: string;
    spread: number;
    result?: 'win' | 'loss' | 'push'; // Set when game is complete
    homeScore?: number;
    awayScore?: number;
}

interface PicksContextType {
    picks: Record<number, 'home' | 'away'>; // For quick lookup - gameId -> team
    pickData: Record<number, PickData>; // Full pick data - gameId -> PickData
    savePick: (gameId: number, team: 'home' | 'away', year: number, week: number, homeTeam: string, awayTeam: string, spread: number, homeScore?: number, awayScore?: number) => Promise<void>;
    updateGameResult: (gameId: number, homeScore: number, awayScore: number) => Promise<void>;
    getAggregateRecord: (scope: 'week' | 'year' | 'all', year?: number, week?: number) => { wins: number; losses: number; pushes: number };
}

const PicksContext = createContext<PicksContextType | undefined>(undefined);

export const PicksProvider = ({ children }: { children: React.ReactNode }) => {
    const [picks, setPicks] = useState<Record<number, 'home' | 'away'>>({});
    const [pickData, setPickData] = useState<Record<number, PickData>>({});

    useEffect(() => {
        loadPicks();
    }, []);

    const loadPicks = async () => {
        try {
            const storedPickData = await AsyncStorage.getItem('pickData');
            if (storedPickData) {
                const data = JSON.parse(storedPickData);
                setPickData(data);

                // Build quick lookup map
                const quickPicks: Record<number, 'home' | 'away'> = {};
                Object.values(data).forEach((pick: any) => {
                    quickPicks[pick.gameId] = pick.team;
                });
                setPicks(quickPicks);
            }
        } catch (e) {
            console.error('Failed to load picks', e);
        }
    };

    const savePick = async (
        gameId: number,
        team: 'home' | 'away',
        year: number,
        week: number,
        homeTeam: string,
        awayTeam: string,
        spread: number,
        homeScore?: number,
        awayScore?: number
    ) => {
        try {
            const newPickData: PickData = {
                team,
                year,
                week,
                gameId,
                homeTeam,
                awayTeam,
                spread,
            };

            // If scores are provided and valid (not null), calculate result immediately
            if (homeScore != null && awayScore != null) {
                const margin = homeScore - awayScore;
                let result: 'win' | 'loss' | 'push';

                if (team === 'home') {
                    if (margin + spread === 0) {
                        result = 'push';
                    } else if (margin + spread > 0) {
                        result = 'win';
                    } else {
                        result = 'loss';
                    }
                } else {
                    if (margin + spread === 0) {
                        result = 'push';
                    } else if (margin + spread < 0) {
                        result = 'win';
                    } else {
                        result = 'loss';
                    }
                }

                newPickData.result = result;
                newPickData.homeScore = homeScore;
                newPickData.awayScore = awayScore;
            }

            const updatedPickData = { ...pickData, [gameId]: newPickData };
            const updatedPicks = { ...picks, [gameId]: team };

            setPickData(updatedPickData);
            setPicks(updatedPicks);

            await AsyncStorage.setItem('pickData', JSON.stringify(updatedPickData));
        } catch (e) {
            console.error('Failed to save pick', e);
        }
    };

    const updateGameResult = async (gameId: number, homeScore: number, awayScore: number) => {
        const pick = pickData[gameId];
        if (!pick) return;

        const margin = homeScore - awayScore;
        let result: 'win' | 'loss' | 'push';

        if (pick.team === 'home') {
            if (margin + pick.spread === 0) {
                result = 'push';
            } else if (margin + pick.spread > 0) {
                result = 'win';
            } else {
                result = 'loss';
            }
        } else {
            if (margin + pick.spread === 0) {
                result = 'push';
            } else if (margin + pick.spread < 0) {
                result = 'win';
            } else {
                result = 'loss';
            }
        }

        const updatedPick = {
            ...pick,
            result,
            homeScore,
            awayScore,
        };

        const updatedPickData = { ...pickData, [gameId]: updatedPick };
        setPickData(updatedPickData);
        await AsyncStorage.setItem('pickData', JSON.stringify(updatedPickData));
    };

    const getAggregateRecord = (scope: 'week' | 'year' | 'all', year?: number, week?: number) => {
        let wins = 0;
        let losses = 0;
        let pushes = 0;

        Object.values(pickData).forEach((pick) => {
            // Filter based on scope
            if (scope === 'week' && (pick.year !== year || pick.week !== week)) {
                return;
            }
            if (scope === 'year' && pick.year !== year) {
                return;
            }
            // 'all' scope includes everything

            // Only count picks with results
            if (pick.result === 'win') wins++;
            if (pick.result === 'loss') losses++;
            if (pick.result === 'push') pushes++;
        });

        return { wins, losses, pushes };
    };

    return (
        <PicksContext.Provider value={{ picks, pickData, savePick, updateGameResult, getAggregateRecord }}>
            {children}
        </PicksContext.Provider>
    );
};

export const usePicks = () => {
    const context = useContext(PicksContext);
    if (!context) throw new Error('usePicks must be used within a PicksProvider');
    return context;
};
