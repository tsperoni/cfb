import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { usePicks } from '../src/context/PicksContext';
import { useTeamLogos } from '../src/hooks/useTeamLogos';
import { Stack } from 'expo-router';
import { useMemo, useState } from 'react';

export default function Results() {
    const { pickData } = usePicks();
    const { getLogo } = useTeamLogos();
    const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
    const [expandedTeam, setExpandedTeam] = useState<string | null>(null);

    // Extract available years from pickData
    const availableYears = useMemo(() => {
        const years = new Set<number>();
        Object.values(pickData).forEach(pick => {
            if (pick.year) years.add(pick.year);
        });
        // Always include current year if no picks yet
        if (years.size === 0) years.add(new Date().getFullYear());
        return Array.from(years).sort((a, b) => b - a);
    }, [pickData]);

    const stats = useMemo(() => {
        const teamStats: Record<string, {
            wins: number;
            losses: number;
            pushes: number;
            money: number;
            team: string;
            picks: any[];
        }> = {};
        let totalWins = 0;
        let totalLosses = 0;
        let totalPushes = 0;

        Object.values(pickData).forEach(pick => {
            if (!pick.result) return;
            // Filter by year if not 'all'
            if (selectedYear !== 'all' && pick.year !== selectedYear) return;

            const pickedTeamName = pick.team === 'home' ? pick.homeTeam : pick.awayTeam;

            if (!teamStats[pickedTeamName]) {
                teamStats[pickedTeamName] = { wins: 0, losses: 0, pushes: 0, money: 0, team: pickedTeamName, picks: [] };
            }

            teamStats[pickedTeamName].picks.push(pick);

            if (pick.result === 'win') {
                teamStats[pickedTeamName].wins++;
                teamStats[pickedTeamName].money += 100;
                totalWins++;
            } else if (pick.result === 'loss') {
                teamStats[pickedTeamName].losses++;
                teamStats[pickedTeamName].money -= 110;
                totalLosses++;
            } else if (pick.result === 'push') {
                teamStats[pickedTeamName].pushes++;
                totalPushes++;
            }
        });

        // Sort picks by week for each team
        Object.values(teamStats).forEach(stat => {
            stat.picks.sort((a, b) => b.week - a.week);
        });

        const sortedTeams = Object.values(teamStats).sort((a, b) => b.money - a.money);
        const totalMoney = (totalWins * 100) - (totalLosses * 110);

        return {
            teams: sortedTeams,
            total: { wins: totalWins, losses: totalLosses, pushes: totalPushes, money: totalMoney },
            bestTeam: sortedTeams.length > 0 ? sortedTeams[0] : null,
            worstTeam: sortedTeams.length > 0 ? sortedTeams[sortedTeams.length - 1] : null,
        };
    }, [pickData, selectedYear]);

    const formatMoney = (amount: number) => {
        const color = amount > 0 ? '#059669' : amount < 0 ? '#dc2626' : '#6b7280';
        const text = amount > 0 ? `+$${amount}` : amount < 0 ? `-$${Math.abs(amount)}` : `$0`;
        return { text, color };
    };

    const renderTeamRow = ({ item }: { item: typeof stats.teams[0] }) => {
        const money = formatMoney(item.money);
        const logo = getLogo(item.team);
        const isExpanded = expandedTeam === item.team;

        return (
            <TouchableOpacity
                style={[styles.teamRow, isExpanded && styles.teamRowExpanded]}
                onPress={() => setExpandedTeam(isExpanded ? null : item.team)}
                activeOpacity={0.7}
            >
                <View style={styles.teamRowHeader}>
                    <View style={styles.teamInfo}>
                        {logo && <Image source={{ uri: logo }} style={styles.logo} />}
                        <Text style={styles.teamName}>{item.team}</Text>
                    </View>
                    <View style={styles.statsRight}>
                        <Text style={styles.recordText}>{item.wins}-{item.losses}-{item.pushes}</Text>
                        <Text style={[styles.moneyText, { color: money.color }]}>{money.text}</Text>
                    </View>
                </View>

                {isExpanded && (
                    <View style={styles.picksList}>
                        <View style={styles.picksHeader}>
                            <Text style={styles.pickHeaderLabel}>Year</Text>
                            <Text style={styles.pickHeaderLabel}>Week</Text>
                            <Text style={[styles.pickHeaderLabel, { flex: 2 }]}>Opponent</Text>
                            <Text style={styles.pickHeaderLabel}>Result</Text>
                            <Text style={styles.pickHeaderLabel}>Score</Text>
                        </View>
                        {item.picks.map((pick) => {
                            const isHome = pick.team === 'home';
                            const opponent = isHome ? pick.awayTeam : pick.homeTeam;
                            const resultColor = pick.result === 'win' ? '#059669' : pick.result === 'loss' ? '#dc2626' : '#6b7280';

                            const hScore = pick.homeScore || 0;
                            const aScore = pick.awayScore || 0;
                            const margin = isHome ? (hScore - aScore) : (aScore - hScore);
                            const marginText = margin > 0 ? `+${margin}` : margin;

                            const score = `${hScore}-${aScore} (${marginText})`;
                            const spreadText = pick.spread > 0 ? `+${pick.spread}` : pick.spread;

                            return (
                                <View key={pick.gameId} style={styles.pickRow}>
                                    <Text style={styles.pickText}>{pick.year}</Text>
                                    <Text style={styles.pickText}>Wk {pick.week}</Text>
                                    <Text style={[styles.pickText, { flex: 2 }]} numberOfLines={1}>vs {opponent}</Text>
                                    <Text style={[styles.pickText, { color: resultColor, fontWeight: '600' }]}>
                                        {pick.result?.toUpperCase()} ({spreadText})
                                    </Text>
                                    <Text style={styles.pickText}>{score}</Text>
                                </View>
                            );
                        })}
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    const totalMoney = formatMoney(stats.total.money);

    return (
        <View style={styles.container}>


            {/* Year Filter */}
            <View style={styles.filterContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContent}>
                    <TouchableOpacity
                        style={[styles.filterChip, selectedYear === 'all' && styles.filterChipActive]}
                        onPress={() => setSelectedYear('all')}
                    >
                        <Text style={[styles.filterText, selectedYear === 'all' && styles.filterTextActive]}>All Years</Text>
                    </TouchableOpacity>
                    {availableYears.map(year => (
                        <TouchableOpacity
                            key={year}
                            style={[styles.filterChip, selectedYear === year && styles.filterChipActive]}
                            onPress={() => setSelectedYear(year)}
                        >
                            <Text style={[styles.filterText, selectedYear === year && styles.filterTextActive]}>{year}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Total Performance</Text>
                <View style={styles.summaryRow}>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Record</Text>
                        <Text style={styles.summaryValue}>{stats.total.wins}-{stats.total.losses}-{stats.total.pushes}</Text>
                    </View>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Net Money</Text>
                        <Text style={[styles.summaryValue, { color: totalMoney.color }]}>{totalMoney.text}</Text>
                    </View>
                </View>
            </View>

            {stats.bestTeam && stats.worstTeam && stats.teams.length > 1 && (
                <View style={styles.highlightsRow}>
                    <View style={[styles.highlightCard, { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' }]}>
                        <Text style={[styles.highlightLabel, { color: '#047857' }]}>Best Team</Text>
                        <View style={styles.highlightContent}>
                            <Text style={styles.highlightTeam}>{stats.bestTeam.team}</Text>
                            <Text style={[styles.highlightMoney, { color: '#059669' }]}>
                                {formatMoney(stats.bestTeam.money).text}
                            </Text>
                        </View>
                    </View>
                    <View style={[styles.highlightCard, { backgroundColor: '#fef2f2', borderColor: '#fecaca' }]}>
                        <Text style={[styles.highlightLabel, { color: '#b91c1c' }]}>Worst Team</Text>
                        <View style={styles.highlightContent}>
                            <Text style={styles.highlightTeam}>{stats.worstTeam.team}</Text>
                            <Text style={[styles.highlightMoney, { color: '#dc2626' }]}>
                                {formatMoney(stats.worstTeam.money).text}
                            </Text>
                        </View>
                    </View>
                </View>
            )}

            <Text style={styles.sectionTitle}>Performance by Team</Text>

            <FlatList
                data={stats.teams}
                renderItem={renderTeamRow}
                keyExtractor={item => item.team}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>No finished bets yet.</Text>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 16,
    },
    filterContainer: {
        marginBottom: 16,
    },
    filterContent: {
        gap: 8,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#e5e7eb',
        borderWidth: 1,
        borderColor: '#d1d5db',
    },
    filterChipActive: {
        backgroundColor: '#3b82f6',
        borderColor: '#2563eb',
    },
    filterText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4b5563',
    },
    filterTextActive: {
        color: '#ffffff',
    },
    summaryCard: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    summaryTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6b7280',
        marginBottom: 12,
        textTransform: 'uppercase',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    summaryItem: {
        alignItems: 'center',
    },
    summaryLabel: {
        fontSize: 12,
        color: '#9ca3af',
        marginBottom: 4,
    },
    summaryValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    highlightsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    highlightCard: {
        flex: 1,
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
    },
    highlightLabel: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
        marginBottom: 8,
    },
    highlightContent: {
        alignItems: 'flex-start',
    },
    highlightTeam: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 2,
    },
    highlightMoney: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 12,
    },
    listContent: {
        paddingBottom: 20,
    },
    teamRow: {
        backgroundColor: '#ffffff',
        borderRadius: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        overflow: 'hidden',
    },
    teamRowExpanded: {
        borderColor: '#3b82f6',
        borderWidth: 2,
    },
    teamRowHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
    },
    teamInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    logo: {
        width: 32,
        height: 32,
        borderRadius: 4,
    },
    teamName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
    },
    statsRight: {
        alignItems: 'flex-end',
    },
    recordText: {
        fontSize: 13,
        color: '#6b7280',
        marginBottom: 2,
    },
    moneyText: {
        fontSize: 15,
        fontWeight: 'bold',
    },
    emptyText: {
        textAlign: 'center',
        color: '#9ca3af',
        marginTop: 20,
    },
    picksList: {
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        backgroundColor: '#f9fafb',
        padding: 12,
    },
    picksHeader: {
        flexDirection: 'row',
        marginBottom: 8,
        paddingBottom: 4,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    pickHeaderLabel: {
        flex: 1,
        fontSize: 11,
        fontWeight: '600',
        color: '#6b7280',
        textTransform: 'uppercase',
    },
    pickRow: {
        flexDirection: 'row',
        paddingVertical: 6,
    },
    pickText: {
        flex: 1,
        fontSize: 13,
        color: '#374151',
    },
});
