import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { useGames } from '../src/hooks/useGames';
import { GameCard } from '../src/components/GameCard';
import { usePicks } from '../src/context/PicksContext';
import { useTeamLogos } from '../src/hooks/useTeamLogos';
import { useCalendar } from '../src/hooks/useCalendar';
import { Link } from 'expo-router';

export default function Home() {
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedWeek, setSelectedWeek] = useState(1);
    const [statsScope, setStatsScope] = useState<'week' | 'year' | 'all'>('week');
    const [searchQuery, setSearchQuery] = useState('');
    const [initialized, setInitialized] = useState(false);

    const { games, loading: gamesLoading, error } = useGames(selectedYear, selectedWeek);
    const { picks, savePick, updateGameResult, getAggregateRecord } = usePicks();
    const { getLogo } = useTeamLogos();
    const { isWeekStarted, getCurrentWeek, loading: calendarLoading } = useCalendar(selectedYear);

    useEffect(() => {
        if (!calendarLoading && !initialized && getCurrentWeek) {
            const current = getCurrentWeek();
            setSelectedWeek(current);
            setInitialized(true);
        }
    }, [calendarLoading, initialized, getCurrentWeek]);

    // Get stats based on scope - properly aggregates across weeks/years
    const stats = getAggregateRecord(statsScope, selectedYear, selectedWeek);
    const { wins, losses, pushes } = stats;

    const handlePickTeam = (game: any, team: 'home' | 'away', spread: number) => {
        savePick(
            game.id,
            team,
            game.season,
            game.week,
            game.homeTeam,
            game.awayTeam,
            spread,
            game.homeScore,
            game.awayScore
        );
    };

    const filteredGames = games.filter(game => {
        const query = searchQuery.toLowerCase();
        return (
            game.homeTeam.toLowerCase().includes(query) ||
            game.awayTeam.toLowerCase().includes(query)
        );
    });

    return (
        <View style={styles.container}>
            <FlatList
                data={filteredGames}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <GameCard
                        game={item}
                        onPickTeam={(team, spread) => handlePickTeam(item, team, spread)}
                        pickedTeam={picks[item.id]}
                        getLogo={getLogo}
                    />
                )}
                contentContainerStyle={{ paddingBottom: 20 }}
                ListHeaderComponent={
                    <View style={styles.statsHeader}>
                        <View style={styles.headerRow}>
                            <View>
                                <Text style={styles.headerTitle}>CFB Picks</Text>
                                <View style={styles.searchContainer}>
                                    <TextInput
                                        style={styles.searchInput}
                                        placeholder="Search teams..."
                                        value={searchQuery}
                                        onChangeText={setSearchQuery}
                                        placeholderTextColor="#9ca3af"
                                    />
                                </View>
                            </View>
                            <View style={styles.statsContainer}>
                                <View style={styles.statsScopeSelector}>
                                    {(['week', 'year', 'all'] as const).map((scope) => (
                                        <TouchableOpacity
                                            key={scope}
                                            style={[styles.scopeButton, statsScope === scope && styles.scopeButtonActive]}
                                            onPress={() => setStatsScope(scope)}
                                        >
                                            <Text style={[styles.scopeText, statsScope === scope && styles.scopeTextActive]}>
                                                {scope.toUpperCase()}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                                <View style={styles.recordContainer}>
                                    <Text style={styles.wins}>{wins}W</Text>
                                    <Text style={styles.losses}>{losses}L</Text>
                                    <Text style={styles.pushes}>{pushes}P</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.selectorRow}>
                            <View style={styles.yearNavigator}>
                                <TouchableOpacity
                                    style={styles.arrowButton}
                                    onPress={() => setSelectedYear(y => y - 1)}
                                >
                                    <Text style={styles.arrowText}>←</Text>
                                </TouchableOpacity>
                                <View style={styles.yearDisplay}>
                                    <Text style={styles.yearLabel}>SEASON</Text>
                                    <Text style={styles.yearNumber}>{selectedYear}</Text>
                                </View>
                                <TouchableOpacity
                                    style={styles.arrowButton}
                                    onPress={() => setSelectedYear(y => y + 1)}
                                >
                                    <Text style={styles.arrowText}>→</Text>
                                </TouchableOpacity>
                            </View>

                            <ScrollView
                                horizontal
                                style={styles.weekSelector}
                                contentContainerStyle={styles.weekSelectorContent}
                                showsHorizontalScrollIndicator={false}
                            >
                                {Array.from({ length: 18 }, (_, i) => i + 1).map((week) => {
                                    const weekStats = getAggregateRecord('week', selectedYear, week);
                                    const hasStats = weekStats.wins > 0 || weekStats.losses > 0 || weekStats.pushes > 0;

                                    const total = weekStats.wins + weekStats.losses + weekStats.pushes;
                                    const winPct = total > 0 ? Math.round((weekStats.wins / total) * 100) : 0;
                                    const money = (weekStats.wins * 100) - (weekStats.losses * 110);
                                    const moneyStr = money > 0 ? `+$${money}` : money < 0 ? `-$${Math.abs(money)}` : `$0`;
                                    const moneyColor = money > 0 ? '#059669' : money < 0 ? '#dc2626' : '#6b7280';

                                    return (
                                        <TouchableOpacity
                                            key={week}
                                            style={styles.weekItemContainer}
                                            onPress={() => setSelectedWeek(week)}
                                        >
                                            <Text style={[styles.weekStatsText, !hasStats && styles.weekStatsTextHidden]}>
                                                {hasStats ? `${weekStats.wins}-${weekStats.losses}-${weekStats.pushes} (${winPct}%)` : '0-0-0 (0%)'}
                                            </Text>
                                            <Text style={[styles.weekMoneyText, { color: hasStats ? moneyColor : 'transparent' }]}>
                                                {moneyStr}
                                            </Text>
                                            <View style={[styles.weekPill, selectedWeek === week && styles.weekPillActive]}>
                                                <Text style={[styles.weekText, selectedWeek === week && styles.weekTextActive]}>
                                                    Week {week}
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>
                        </View >
                    </View >
                }
            />
            < StatusBar style="light" />
        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        color: '#666',
        marginTop: 16,
        fontSize: 14,
    },

    statsHeader: {
        marginBottom: 20,
        backgroundColor: '#ffffff',
        padding: 16,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    searchContainer: {
        marginTop: 8,
        width: 200,
    },
    searchInput: {
        backgroundColor: '#f3f4f6',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 15,
        color: '#1f2937',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    headerTitle: {
        color: '#1a202c',
        fontSize: 24,
        fontWeight: 'bold',
    },
    statsContainer: {
        alignItems: 'flex-end',
    },
    statsScopeSelector: {
        flexDirection: 'row',
        gap: 4,
        marginBottom: 8,
    },
    scopeButton: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        backgroundColor: '#f3f4f6',
        minWidth: 32,
        alignItems: 'center',
    },
    scopeButtonActive: {
        backgroundColor: '#3b82f6',
    },
    scopeText: {
        color: '#6b7280',
        fontSize: 11,
        fontWeight: '600',
    },
    scopeTextActive: {
        color: '#ffffff',
    },
    recordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    wins: {
        color: '#059669',
        fontWeight: '600',
        fontSize: 15,
    },
    losses: {
        color: '#dc2626',
        fontWeight: '600',
        fontSize: 15,
    },
    pushes: {
        color: '#6b7280',
        fontWeight: '600',
        fontSize: 15,
    },
    totalMoney: {
        fontWeight: 'bold',
        fontSize: 15,
        marginLeft: 4,
    },
    selectorRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
    },
    yearNavigator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    arrowButton: {
        width: 32,
        height: 32,
        borderRadius: 6,
        backgroundColor: '#f3f4f6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    arrowText: {
        color: '#3b82f6',
        fontSize: 18,
        fontWeight: 'bold',
    },
    arrowDisabled: {
        color: '#d1d5db',
    },
    yearDisplay: {
        alignItems: 'center',
        paddingHorizontal: 12,
    },
    yearLabel: {
        color: '#9ca3af',
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    yearNumber: {
        color: '#1f2937',
        fontSize: 20,
        fontWeight: 'bold',
    },
    weekSelector: {
        flex: 1,
        marginLeft: 16,
    },
    weekSelectorContent: {
        gap: 6,
        paddingRight: 4,
        alignItems: 'flex-end', // Align items to bottom so pills line up
    },
    weekItemContainer: {
        alignItems: 'center',
    },
    weekPill: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: '#f3f4f6',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 64,
    },
    weekPillActive: {
        backgroundColor: '#3b82f6',
    },
    weekStatsText: {
        fontSize: 10,
        color: '#6b7280',
        marginBottom: 0,
        fontWeight: '500',
        height: 14,
    },
    weekMoneyText: {
        fontSize: 10,
        fontWeight: '600',
        marginBottom: 4,
        height: 14,
    },
    weekStatsTextHidden: {
        opacity: 0,
    },
    weekText: {
        color: '#6b7280',
        fontSize: 13,
        fontWeight: '600',
    },
    weekTextActive: {
        color: '#ffffff',
    },
    historyButton: {
        marginTop: 4,
    },
    historyButtonText: {
        color: '#3b82f6',
        fontSize: 14,
        fontWeight: '600',
    },
});
