import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { useSmartPicks, SmartPick } from '../src/hooks/useSmartPicks';
import { useTeamLogos } from '../src/hooks/useTeamLogos';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function SmartPicks() {
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedWeek, setSelectedWeek] = useState(10); // Default to a mid-season week for demo

    const { picks, loading } = useSmartPicks(selectedYear, selectedWeek);
    const { getLogo } = useTeamLogos();
    const router = useRouter();

    const getRecommendationColor = (rec: string) => {
        if (rec.includes('Strong')) return '#059669'; // Green
        if (rec.includes('Lean')) return '#3b82f6'; // Blue
        return '#6b7280'; // Gray
    };

    const renderPick = ({ item }: { item: SmartPick }) => {
        const homeLogo = getLogo(item.game.homeTeam);
        const awayLogo = getLogo(item.game.awayTeam);
        const recColor = getRecommendationColor(item.recommendation);

        // Format spread if available
        const spread = item.game.lines && item.game.lines.length > 0
            ? item.game.lines[0].formattedSpread
            : 'No Line';

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.matchupText}>
                        {item.game.awayTeam} @ {item.game.homeTeam}
                    </Text>
                    <Text style={styles.spreadText}>{spread}</Text>
                </View>

                <View style={styles.statsRow}>
                    <View style={styles.teamStat}>
                        <Text style={styles.teamName}>{item.game.awayTeam}</Text>
                        <Text style={styles.domScore}>
                            DOM: {item.awayTeamStats?.dominanceScore.toFixed(1) || 'N/A'}
                        </Text>
                    </View>

                    <View style={styles.vsContainer}>
                        <Text style={styles.vsText}>VS</Text>
                    </View>

                    <View style={styles.teamStat}>
                        <Text style={styles.teamName}>{item.game.homeTeam}</Text>
                        <Text style={styles.domScore}>
                            DOM: {item.homeTeamStats?.dominanceScore.toFixed(1) || 'N/A'}
                        </Text>
                    </View>
                </View>

                <View style={[styles.recommendationBadge, { backgroundColor: recColor }]}>
                    <Text style={styles.recommendationText}>
                        {item.recommendation.toUpperCase()}
                    </Text>
                    {item.recommendation !== 'Toss Up' && (
                        <Text style={styles.confidenceText}>
                            (Delta: {Math.abs(item.delta).toFixed(1)})
                        </Text>
                    )}
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1f2937" />
                </TouchableOpacity>
                <Text style={styles.title}>Smart Picks</Text>
            </View>

            <View style={styles.filterContainer}>
                <Text style={styles.filterLabel}>Week:</Text>
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

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#3b82f6" />
                    <Text style={styles.loadingText}>Analyzing matchups...</Text>
                </View>
            ) : (
                <FlatList
                    data={picks}
                    renderItem={renderPick}
                    keyExtractor={(item) => item.game.id.toString()}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}
            <StatusBar style="dark" />
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
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    backButton: {
        marginRight: 12,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
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
    listContent: {
        paddingBottom: 20,
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
        paddingBottom: 8,
    },
    matchupText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1f2937',
    },
    spreadText: {
        fontSize: 14,
        color: '#6b7280',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    teamStat: {
        flex: 1,
        alignItems: 'center',
    },
    vsContainer: {
        width: 40,
        alignItems: 'center',
    },
    vsText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#9ca3af',
    },
    teamName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 4,
        textAlign: 'center',
    },
    domScore: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#3b82f6',
    },
    recommendationBadge: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 8,
        borderRadius: 8,
        gap: 8,
    },
    recommendationText: {
        color: '#ffffff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    confidenceText: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: 12,
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
});
