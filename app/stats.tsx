import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, ActivityIndicator, ScrollView } from 'react-native';
import { useGames } from '../src/hooks/useGames';
import { useTeamLogos } from '../src/hooks/useTeamLogos';
import { useState, useMemo } from 'react';
import { Stack } from 'expo-router';

interface TeamStats {
    team: string;
    wins: number;
    losses: number;
    pushes: number;
    games: any[];
}

export default function Stats() {
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [expandedTeam, setExpandedTeam] = useState<string | null>(null);

    // Fetch ALL games for the year (week undefined)
    const { games, loading } = useGames(selectedYear);
    const { getLogo } = useTeamLogos();

    const stats = useMemo(() => {
        const teamStats: Record<string, TeamStats> = {};

        games.forEach(game => {
            // Skip if game not finished or no line
            if (typeof game.homeScore !== 'number' || typeof game.awayScore !== 'number') return;
            const line = game.lines?.[0];
            if (!line) return;

            const spread = line.spread;
            const homeMargin = game.homeScore - game.awayScore;

            // Initialize teams if needed
            if (!teamStats[game.homeTeam]) teamStats[game.homeTeam] = { team: game.homeTeam, wins: 0, losses: 0, pushes: 0, games: [] };
            if (!teamStats[game.awayTeam]) teamStats[game.awayTeam] = { team: game.awayTeam, wins: 0, losses: 0, pushes: 0, games: [] };

            // Calculate Home Result (ATS)
            // Home covers if margin + spread > 0 (e.g. -7 spread, wins by 10. -7 + 10 = 3 > 0)
            let homeResult = 'push';
            if (homeMargin + spread > 0) homeResult = 'win';
            else if (homeMargin + spread < 0) homeResult = 'loss';

            // Calculate Away Result (ATS)
            // Away covers if -(margin + spread) > 0 OR just opposite of home
            let awayResult = 'push';
            if (homeResult === 'win') awayResult = 'loss';
            else if (homeResult === 'loss') awayResult = 'win';

            // Update Home Stats
            if (homeResult === 'win') teamStats[game.homeTeam].wins++;
            else if (homeResult === 'loss') teamStats[game.homeTeam].losses++;
            else teamStats[game.homeTeam].pushes++;

            teamStats[game.homeTeam].games.push({
                week: game.week,
                opponent: game.awayTeam,
                result: homeResult,
                score: `${game.homeScore}-${game.awayScore}`,
                spread: spread,
                margin: homeMargin
            });

            // Update Away Stats
            if (awayResult === 'win') teamStats[game.awayTeam].wins++;
            else if (awayResult === 'loss') teamStats[game.awayTeam].losses++;
            else teamStats[game.awayTeam].pushes++;

            teamStats[game.awayTeam].games.push({
                week: game.week,
                opponent: game.homeTeam,
                result: awayResult,
                score: `${game.awayScore}-${game.homeScore}`,
                spread: -spread,
                margin: -homeMargin
            });
        });

        // Convert to array and sort
        return Object.values(teamStats).sort((a, b) => {
            // Sort by Win % first
            const aTotal = a.wins + a.losses;
            const bTotal = b.wins + b.losses;
            const aPct = aTotal > 0 ? a.wins / aTotal : 0;
            const bPct = bTotal > 0 ? b.wins / bTotal : 0;

            if (aPct !== bPct) return bPct - aPct;
            // Then by total wins
            return b.wins - a.wins;
        });
    }, [games]);

    const renderTeamRow = ({ item }: { item: TeamStats }) => {
        const logo = getLogo(item.team);
        const isExpanded = expandedTeam === item.team;
        const total = item.wins + item.losses;
        const pct = total > 0 ? Math.round((item.wins / total) * 100) : 0;

        return (
            <TouchableOpacity
                style={[styles.teamRow, isExpanded && styles.teamRowExpanded]}
                onPress={() => setExpandedTeam(isExpanded ? null : item.team)}
                activeOpacity={0.7}
            >
                <View style={styles.teamRowHeader}>
                    <View style={styles.teamInfo}>
                        <Text style={styles.rank}>#{stats.indexOf(item) + 1}</Text>
                        {logo && <Image source={{ uri: logo }} style={styles.logo} />}
                        <View>
                            <Text style={styles.teamName}>{item.team}</Text>
                            <Text style={styles.recordText}>{item.wins}-{item.losses}-{item.pushes} ATS</Text>
                        </View>
                    </View>
                    <View style={styles.statsRight}>
                        <Text style={styles.pctText}>{pct}%</Text>
                    </View>
                </View>

                {isExpanded && (
                    <View style={styles.picksList}>
                        <View style={styles.picksHeader}>
                            <Text style={styles.pickHeaderLabel}>Wk</Text>
                            <Text style={[styles.pickHeaderLabel, { flex: 2 }]}>Opponent</Text>
                            <Text style={styles.pickHeaderLabel}>Result</Text>
                            <Text style={styles.pickHeaderLabel}>Score</Text>
                        </View>
                        {item.games.sort((a, b) => b.week - a.week).map((game, idx) => {
                            const resultColor = game.result === 'win' ? '#059669' : game.result === 'loss' ? '#dc2626' : '#6b7280';
                            const spreadText = game.spread > 0 ? `+${game.spread}` : game.spread;
                            const marginText = game.margin > 0 ? `+${game.margin}` : game.margin;

                            return (
                                <View key={idx} style={styles.pickRow}>
                                    <Text style={styles.pickText}>{game.week}</Text>
                                    <Text style={[styles.pickText, { flex: 2 }]} numberOfLines={1}>vs {game.opponent}</Text>
                                    <Text style={[styles.pickText, { color: resultColor, fontWeight: '600' }]}>
                                        {game.result.toUpperCase()} ({spreadText})
                                    </Text>
                                    <Text style={styles.pickText}>{game.score} ({marginText})</Text>
                                </View>
                            );
                        })}
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#00529b" />
            </View>
        );
    }

    return (
        <View style={styles.container}>


            <View style={styles.header}>
                <Text style={styles.headerTitle}>ATS Standings</Text>
                <Text style={styles.headerSubtitle}>{selectedYear} Season</Text>
            </View>

            <FlatList
                data={stats}
                renderItem={renderTeamRow}
                keyExtractor={item => item.team}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>No games found.</Text>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#6b7280',
        marginTop: 2,
    },
    listContent: {
        padding: 16,
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
        flex: 1,
    },
    rank: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#9ca3af',
        width: 24,
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
    recordText: {
        fontSize: 12,
        color: '#6b7280',
    },
    statsRight: {
        alignItems: 'flex-end',
    },
    pctText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
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
