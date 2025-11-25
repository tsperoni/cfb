import { useState, useEffect } from 'react';
import { getCalendar, CalendarWeek } from '../api/cfb';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEY_PREFIX = 'cfb_calendar_';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export const useCalendar = (year: number) => {
    const [calendar, setCalendar] = useState<CalendarWeek[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadCalendar = async () => {
            try {
                const cacheKey = `${CACHE_KEY_PREFIX}${year}`;

                // Check cache first
                const cached = await AsyncStorage.getItem(cacheKey);
                if (cached) {
                    const { timestamp, data } = JSON.parse(cached);
                    if (Date.now() - timestamp < CACHE_DURATION) {
                        setCalendar(data);
                        setLoading(false);
                        return;
                    }
                }

                // Fetch from API
                const data = await getCalendar(year);
                setCalendar(data);

                // Cache the result
                await AsyncStorage.setItem(cacheKey, JSON.stringify({
                    timestamp: Date.now(),
                    data
                }));

            } catch (error) {
                console.error('Error loading calendar:', error);
            } finally {
                setLoading(false);
            }
        };

        loadCalendar();
    }, [year]);

    const isWeekStarted = (week: number) => {
        const weekData = calendar.find(w => w.week === week && w.seasonType === 'regular');
        if (!weekData) return false;
        return new Date() >= new Date(weekData.firstGameStart);
    };

    const getCurrentWeek = () => {
        if (calendar.length === 0) return 1;

        const now = new Date();
        // Find the week that contains the current date
        const current = calendar.find(w => {
            const start = new Date(w.startDate);
            const end = new Date(w.endDate);
            return now >= start && now <= end;
        });

        if (current) return current.week;

        // If not found, check if before season
        const firstWeek = calendar[0];
        if (now < new Date(firstWeek.startDate)) return 1;

        // If after season, return last week
        const lastWeek = calendar[calendar.length - 1];
        if (now > new Date(lastWeek.endDate)) return lastWeek.week;

        return 1;
    };

    return { calendar, isWeekStarted, getCurrentWeek, loading };
};
