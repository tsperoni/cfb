import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, ScrollView, TextInput, LayoutAnimation, Platform, UIManager } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { useSeasonStats } from '../src/hooks/useSeasonStats';
import { useTeamLogos } from '../src/hooks/useTeamLogos';
import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

export default function Stats() {
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedWeek, setSelectedWeek] = useState<number | undefined>(undefined);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedTeam, setExpandedTeam] = useState<string | null>(null);

    // Pass selectedWeek as maxWeek to filter stats up to that point
    const { stats, loading, error, refresh } = useSeasonStats(selectedYear, selectedWeek);
    const { getLogo } = useTeamLogos();
    const router = useRouter();

    const filteredStats = stats.filter(teamStat =>
        teamStat.team.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleExpand = (team: string) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedTeam(expandedTeam === team ? null : team);
    };

    const renderItem = ({ item, index }: { item: any, index: number }) => {
        const logoUrl = getLogo(item.team);
        const marginColor = item.avgMargin > 0 ? '#059669' : item.avgMargin < 0 ? '#dc2626' : '#6b7280';
        const marginPrefix = item.avgMargin > 0 ? '+' : '';
        const isExpanded = expandedTeam === item.team;

        return (
            <View>
                <TouchableOpacity
                    style={[styles.row, isExpanded && styles.rowExpanded]}
                    onPress={() => toggleExpand(item.team)}
                    activeOpacity={0.7}
                >
                    <View style={styles.rankCol}>
                        <Text style={styles.rankText}>{index + 1}</Text>
                    </View>
                    <View style={styles.teamCol}>
                        <Text style={styles.teamText} numberOfLines={1}>{item.team}</Text>
                    </View>
                    <View style={styles.recordCol}>
                        <Text style={styles.recordText}>
                            {item.wins}-{item.losses}-{item.pushes}
                        </Text>
                        <Text style={styles.winPctText}>
                            {item.games > 0 ? Math.round(((item.wins + item.pushes * 0.5) / item.games) * 100) : 0}%
                        </Text>
                    </View>
                    <View style={styles.marginCol}>
                        <Text style={[styles.marginText, { color: marginColor }]}>
                            {marginPrefix}{item.avgMargin.toFixed(1)}
                        </Text>
                        <Ionicons
                            name={isExpanded ? "chevron-up" : "chevron-down"}
                            size={16}
                            color="#9ca3af"
                            style={{ marginTop: 4 }}
                        />
                    </View>
                    <View style={styles.domCol}>
                        <Text style={styles.domText}>
                            {item.dominanceScore.toFixed(1)}
                        </Text>
                    </View>
                </TouchableOpacity>

                {isExpanded && (
                    <View style={styles.historyContainer}>
                        <View style={styles.historyHeader}>
                            <Text style={[styles.historyHeaderText, { width: 30 }]}>WK</Text>
                            <Text style={[styles.historyHeaderText, { flex: 1 }]}>OPP</Text>
                            <Text style={[styles.historyHeaderText, { width: 45, textAlign: 'center' }]}>SPR</Text>
                            <Text style={[styles.historyHeaderText, { width: 45, textAlign: 'center' }]}>RES</Text>
                            <Text style={[styles.historyHeaderText, { width: 45, textAlign: 'right' }]}>DIFF</Text>
                            <Text style={[styles.historyHeaderText, { width: 45, textAlign: 'right' }]}>MAR</Text>
                            <Text style={[styles.historyHeaderText, { width: 45, textAlign: 'right' }]}>REL</Text>
                        </View>
                        {item.history.map((game: any, i: number) => {
                            const relativeMargin = game.spread !== 0 ? (game.margin / Math.abs(game.spread)).toFixed(1) : '0.0';

                            return (
                                <View key={i} style={styles.historyRow}>
                                    <Text style={[styles.historyText, { width: 30 }]}>{game.week}</Text>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.historyText} numberOfLines={1}>{game.opponent}</Text>
                                        <Text style={styles.historySubText}>{game.score}</Text>
                                    </View>
                                    <Text style={[styles.historyText, { width: 45, textAlign: 'center' }]}>
                                        {game.spread > 0 ? '+' : ''}{game.spread}
                                    </Text>
                                    <View style={{ width: 45, alignItems: 'center' }}>
                                        <Text style={[
                                            styles.resultBadge,
                                            game.result === 'win' ? styles.resultWin :
                                                game.result === 'loss' ? styles.resultLoss : styles.resultPush
                                        ]}>
                                            {game.result.toUpperCase().charAt(0)}
                                        </Text>
                                    </View>
                                    <Text style={[
                                        styles.historyText,
                                        { width: 45, textAlign: 'right' },
                                        { color: game.scoreDiff > 0 ? '#059669' : game.scoreDiff < 0 ? '#dc2626' : '#6b7280' }
                                    ]}>
                                        {game.scoreDiff > 0 ? '+' : ''}{game.scoreDiff}
                                    </Text>
                                    <Text style={[
                                        styles.historyText,
                                        { width: 45, textAlign: 'right', fontWeight: 'bold' },
                                        { color: game.margin > 0 ? '#059669' : game.margin < 0 ? '#dc2626' : '#6b7280' }
                                    ]}>
                                        {game.margin > 0 ? '+' : ''}{game.margin}
                                    </Text>
                                    <Text style={[
                                        styles.historyText,
                                        { width: 45, textAlign: 'right' },
                                        { color: parseFloat(relativeMargin) > 0 ? '#059669' : parseFloat(relativeMargin) < 0 ? '#dc2626' : '#6b7280' }
                                    ]}>
                                        {parseFloat(relativeMargin) > 0 ? '+' : ''}{relativeMargin}
                                    </Text>
                                </View>
                            );
                        })}
                    </View>
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerTopRow}>
                    <View style={styles.titleRow}>
                        <Text style={styles.headerTitle}>ATS Standings</Text>
                        <TouchableOpacity onPress={refresh} style={styles.refreshButton} disabled={loading}>
                            {loading ? (
                                <ActivityIndicator size="small" color="#3b82f6" />
                            ) : (
                                <Ionicons name="refresh" size={20} color="#3b82f6" />
                            )}
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                        style={styles.smartPicksButton}
                        onPress={() => router.push('/smart-picks')}
                    >
                        <Ionicons name="bulb" size={18} color="#ffffff" />
                        <Text style={styles.smartPicksButtonText}>Smart Picks</Text>
                    </TouchableOpacity>
                </View>

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

            <View style={styles.filterContainer}>
                <Text style={styles.filterLabel}>Through Week:</Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.weekFilterContent}
                >
                    {Array.from({ length: 18 }, (_, i) => i + 1).map((week) => (
                        <TouchableOpacity
                            key={week}
                            style={[styles.weekPill, selectedWeek === week && styles.weekPillActive]}
                            onPress={() => setSelectedWeek(week)}
                        >
                            <Text style={[styles.weekText, selectedWeek === week && styles.weekTextActive]}>
                                {week}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <View style={styles.tableHeader}>
                <Text style={[styles.headerText, styles.rankCol]}>#</Text>
                <Text style={[styles.headerText, styles.teamCol]}>Team</Text>
                <Text style={[styles.headerText, styles.recordCol]}>ATS Record</Text>
                <Text style={[styles.headerText, styles.marginCol]}>Avg Margin</Text>
                <Text style={[styles.headerText, styles.domCol]}>DOM</Text>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#3b82f6" />
                    <Text style={styles.loadingText}>Calculating stats...</Text>
                </View>
            ) : error ? (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredStats}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.team}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}
            <StatusBar style="light" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 16,
    },
    header: {
        marginBottom: 12,
    },
    headerTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    refreshButton: {
        padding: 4,
    },
    searchContainer: {
        marginTop: 0,
    },
    searchInput: {
        backgroundColor: '#ffffff',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        fontSize: 14,
        color: '#1f2937',
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    smartPicksButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#3b82f6',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 6,
    },
    smartPicksButtonText: {
        color: '#ffffff',
        fontWeight: '600',
        fontSize: 14,
    },
    filterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        backgroundColor: '#ffffff',
        padding: 12,
        borderRadius: 8,
    },
    filterLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6b7280',
        marginRight: 12,
    },
    weekFilterContent: {
        gap: 8,
        paddingRight: 16,
    },
    weekPill: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: '#f3f4f6',
        minWidth: 40,
        alignItems: 'center',
    },
    weekPillActive: {
        backgroundColor: '#3b82f6',
    },
    weekText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#6b7280',
    },
    weekTextActive: {
        color: '#ffffff',
    },
    tableHeader: {
        flexDirection: 'row',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        paddingHorizontal: 12,
    },
    headerText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6b7280',
        textTransform: 'uppercase',
    },
    listContent: {
        paddingBottom: 20,
        backgroundColor: '#ffffff',
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
    },
    row: {
        flexDirection: 'row',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
        alignItems: 'center',
        paddingHorizontal: 12,
    },
    rowExpanded: {
        backgroundColor: '#f9fafb',
        borderBottomColor: 'transparent',
    },
    rankCol: {
        width: 40,
        alignItems: 'center',
    },
    teamCol: {
        flex: 1,
        paddingRight: 8,
    },
    recordCol: {
        width: 100,
        alignItems: 'center',
    },
    marginCol: {
        width: 80,
        alignItems: 'flex-end',
    },
    domCol: {
        width: 50,
        alignItems: 'flex-end',
        paddingRight: 4,
    },
    rankText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#9ca3af',
    },
    teamText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1f2937',
    },
    recordText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
    winPctText: {
        fontSize: 11,
        color: '#9ca3af',
    },
    marginText: {
        fontSize: 15,
        fontWeight: 'bold',
    },
    domText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#3b82f6',
    },
    historyContainer: {
        backgroundColor: '#f9fafb',
        paddingHorizontal: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    historyHeader: {
        flexDirection: 'row',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        marginBottom: 4,
    },
    historyHeaderText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#9ca3af',
    },
    historyRow: {
        flexDirection: 'row',
        paddingVertical: 8,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    historyText: {
        fontSize: 13,
        color: '#4b5563',
    },
    historySubText: {
        fontSize: 11,
        color: '#9ca3af',
    },
    resultBadge: {
        fontSize: 10,
        fontWeight: '700',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        overflow: 'hidden',
    },
    resultWin: {
        backgroundColor: '#d1fae5',
        color: '#059669',
    },
    resultLoss: {
        backgroundColor: '#fee2e2',
        color: '#dc2626',
    },
    resultPush: {
        backgroundColor: '#f3f4f6',
        color: '#6b7280',
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        marginTop: 12,
        color: '#6b7280',
    },
    errorContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    errorText: {
        color: '#dc2626',
    },
});
