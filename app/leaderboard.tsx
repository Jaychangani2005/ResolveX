import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { LeaderboardItem } from '@/components/LeaderboardItem';
import { getLeaderboard, getCommunityStats, LeaderboardEntry } from '@/services/firebaseService';



export default function LeaderboardScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [communityStats, setCommunityStats] = useState({
    totalUsers: 0,
    totalIncidents: 0,
    totalPoints: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [leaderboard, stats] = await Promise.all([
        getLeaderboard(50),
        getCommunityStats()
      ]);
      setLeaderboardData(leaderboard);
      setCommunityStats(stats);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          
          <Text style={[styles.title, { color: colors.primary }]}>
            🏆 Community Leaderboard
          </Text>
          <Text style={[styles.subtitle, { color: colors.text }]}>
            Top contributors making a difference
          </Text>
        </View>

        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>{communityStats.totalPoints.toLocaleString()}</Text>
            <Text style={[styles.statLabel, { color: colors.text }]}>Total Points</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.secondary }]}>{communityStats.totalUsers}</Text>
            <Text style={[styles.statLabel, { color: colors.text }]}>Active Users</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.accent }]}>{communityStats.totalIncidents}</Text>
            <Text style={[styles.statLabel, { color: colors.text }]}>Incidents</Text>
          </View>
        </View>

        <View style={styles.badgesInfo}>
          <Text style={[styles.badgesTitle, { color: colors.primary }]}>Badge System</Text>
          <View style={styles.badgeTypes}>
            <View style={styles.badgeType}>
              <Text style={styles.badgeEmoji}>🌱</Text>
              <Text style={[styles.badgeName, { color: colors.text }]}>Guardian</Text>
              <Text style={[styles.badgeDesc, { color: colors.icon }]}>1000+ points</Text>
            </View>
            <View style={styles.badgeType}>
              <Text style={styles.badgeEmoji}>🌳</Text>
              <Text style={[styles.badgeName, { color: colors.text }]}>Protector</Text>
              <Text style={[styles.badgeDesc, { color: colors.icon }]}>2000+ points</Text>
            </View>
          </View>
        </View>

        <View style={styles.leaderboardSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Top Contributors</Text>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={[styles.loadingText, { color: colors.text }]}>Loading leaderboard...</Text>
            </View>
          ) : leaderboardData.length > 0 ? (
            leaderboardData.map((item, index) => (
              <LeaderboardItem
                key={item.id}
                rank={index + 1}
                name={item.name}
                points={item.points}
                badge={item.badge}
                badgeEmoji={item.badgeEmoji}
              />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.text }]}>No contributors yet</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 0,
    left: 20,
    padding: 10,
    zIndex: 1,
  },
  backButtonText: {
    color: '#2E8B57',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.8,
  },
  statsCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.7,
  },
  badgesInfo: {
    marginBottom: 24,
  },
  badgesTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  badgeTypes: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  badgeType: {
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    minWidth: 120,
  },
  badgeEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  badgeName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  badgeDesc: {
    fontSize: 12,
    textAlign: 'center',
  },
  leaderboardSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    opacity: 0.7,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.7,
  },
}); 