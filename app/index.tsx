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

    // Calculate total net money for the current scope
    const totalNet = (wins * 100) - (losses * 110);
    const totalMoneyText = totalNet > 0 ? `+$${totalNet}` : totalNet < 0 ? `-$${Math.abs(totalNet)}` : `$0`;
    const totalMoneyColor = totalNet > 0 ? '#059669' : totalNet < 0 ? '#dc2626' : '#6b7280';

    const handlePick = async (gameId: number, team: 'home' | 'away') => {
        const game = games.find(g => g.id === gameId);
        if (!game) return;

        const spread = game.lines?.[0]?.spread || 0;
        // Pass scores to savePick - it will calculate result automatically in one operation
        await savePick(
            gameId,
            team,
            selectedYear,
            selectedWeek,
            game.homeTeam,
            game.awayTeam,
            spread,
            game.homeScore,
            game.awayScore
        );
    };

    // Filter games based on search query
    const filteredGames = games.filter(game =>
        (game.homeTeam?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (game.awayTeam?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    );

    // Generate week options (1-15)
    const weeks = Array.from({ length: 15 }, (_, i) => i + 1);

    if (gamesLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#00529b" />
                <Text style={styles.loadingText}>Loading games...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={filteredGames}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <GameCard
                        game={item}
                        onPickTeam={(team) => handlePick(item.id, team)}
                        pickedTeam={picks[item.id]}
                        getLogo={getLogo}
                    />
                )}
                contentContainerStyle={{ paddingBottom: 20 }}
                ListHeaderComponent={
                    <View style={styles.header}>
                        <View style={styles.searchContainer}>
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search teams..."
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                placeholderTextColor="#9ca3af"
                            />
                        </View>

                        <View style={styles.headerRow}>
                            <View>
                                <Text style={styles.headerTitle}>CFB Picks</Text>
                                <Link href="/results" asChild>
                                    <TouchableOpacity style={styles.historyButton}>
                                        <Text style={styles.historyButtonText}>View History →</Text>
                                    </TouchableOpacity>
                                </Link>
                            </View>

                            <View style={styles.statsContainer}>
                                {/* Stats Scope Toggles */}
                                <View style={styles.statsScopeSelector}>
                                    <TouchableOpacity
                                        style={[styles.scopeButton, statsScope === 'week' && styles.scopeButtonActive]}
                                        onPress={() => setStatsScope('week')}
                                    >
                                        <Text style={[styles.scopeText, statsScope === 'week' && styles.scopeTextActive]}>Wk</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.scopeButton, statsScope === 'year' && styles.scopeButtonActive]}
                                        onPress={() => setStatsScope('year')}
                                    >
                                        <Text style={[styles.scopeText, statsScope === 'year' && styles.scopeTextActive]}>Yr</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.scopeButton, statsScope === 'all' && styles.scopeButtonActive]}
                                        onPress={() => setStatsScope('all')}
                                    >
                                        <Text style={[styles.scopeText, statsScope === 'all' && styles.scopeTextActive]}>All</Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Win/Loss Record & Money */}
                                <View style={styles.recordContainer}>
                                    <Text style={styles.wins}>{wins}W</Text>
                                    <Text style={styles.losses}>{losses}L</Text>
                                    <Text style={styles.pushes}>{pushes}P</Text>
                                    <Text style={[styles.totalMoney, { color: totalMoneyColor }]}>{totalMoneyText}</Text>
                                </View>
                            </View>
                        </View>

                        {/* Compact Selectors Row */}
                        <View style={styles.selectorRow}>
                            {/* Year Navigator (Left) */}
                            <View style={styles.yearNavigator}>
                                <TouchableOpacity
                                    style={styles.arrowButton}
                                    onPress={() => setSelectedYear(selectedYear - 1)}
                                    disabled={selectedYear <= 2020}
                                >
                                    <Text style={[styles.arrowText, selectedYear <= 2020 && styles.arrowDisabled]}>←</Text>
                                </TouchableOpacity>

                                <View style={styles.yearDisplay}>
                                    <Text style={styles.yearLabel}>Year</Text>
                                    <Text style={styles.yearNumber}>{selectedYear}</Text>
                                </View>

                                <TouchableOpacity
                                    style={styles.arrowButton}
                                    onPress={() => setSelectedYear(selectedYear + 1)}
                                    disabled={selectedYear >= 2025}
                                >
                                    <Text style={[styles.arrowText, selectedYear >= 2025 && styles.arrowDisabled]}>→</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Week Pills (Right - Scrollable) */}
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                style={styles.weekSelector}
                                contentContainerStyle={styles.weekSelectorContent}
                            >
                                {weeks.map((week) => {
                                    const weekStats = getAggregateRecord('week', selectedYear, week);
                                    const total = weekStats.wins + weekStats.losses;
                                    const pct = total > 0 ? Math.round((weekStats.wins / total) * 100) : 0;
                                    const hasPicks = total > 0 || weekStats.pushes > 0;

                                    // Show stats if week has started OR if user has picks
                                    const showStats = isWeekStarted(week) || hasPicks;

                                    // Calculate net money: Wins = +100, Losses = -110
                                    const net = (weekStats.wins * 100) - (weekStats.losses * 110);
                                    const moneyText = net > 0 ? `+$${net}` : net < 0 ? `-$${Math.abs(net)}` : `$0`;
                                    const moneyColor = net > 0 ? '#059669' : net < 0 ? '#dc2626' : '#6b7280';

                                    return (
                                        <View key={week} style={styles.weekItemContainer}>
                                            <Text style={[
                                                styles.weekStatsText,
                                                !showStats && styles.weekStatsTextHidden
                                            ]}>
                                                {showStats ? `${weekStats.wins}-${weekStats.losses} (${pct}%)` : ' '}
                                            </Text>
                                            <Text style={[
                                                styles.weekMoneyText,
                                                !showStats && styles.weekStatsTextHidden,
                                                { color: moneyColor }
                                            ]}>
                                                {showStats ? moneyText : ' '}
                                            </Text>

                                            <TouchableOpacity
                                                style={[
                                                    styles.weekPill,
                                                    selectedWeek === week && styles.weekPillActive
                                                ]}
                                                onPress={() => setSelectedWeek(week)}
                                            >
                                                <Text style={[
                                                    styles.weekText,
                                                    selectedWeek === week && styles.weekTextActive
                                                ]}>Wk {week}</Text>
                                            </TouchableOpacity>
                                        </View>
                                    );
                                })}
                            </ScrollView>
                        </View>
                    </View>
                }
            />
            <StatusBar style="light" />
        </View>
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
    header: {
        marginBottom: 20,
        marginTop: 8,
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
        marginBottom: 16,
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
