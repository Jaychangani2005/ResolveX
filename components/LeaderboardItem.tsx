import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface LeaderboardItemProps {
  rank: number;
  name: string;
  points: number;
  badge: string;
  badgeEmoji: string;
}

export function LeaderboardItem({ rank, name, points, badge, badgeEmoji }: LeaderboardItemProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return { backgroundColor: '#FFD700', color: '#000' }; // Gold
      case 2:
        return { backgroundColor: '#C0C0C0', color: '#000' }; // Silver
      case 3:
        return { backgroundColor: '#CD7F32', color: '#fff' }; // Bronze
      default:
        return { backgroundColor: colors.accent, color: '#fff' };
    }
  };

  const rankStyle = getRankStyle(rank);

  return (
    <View style={styles.container}>
      <View style={[styles.rankContainer, { backgroundColor: rankStyle.backgroundColor }]}>
        <Text style={[styles.rankText, { color: rankStyle.color }]}>{rank}</Text>
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={[styles.name, { color: colors.text }]}>{name}</Text>
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeEmoji}>{badgeEmoji}</Text>
          <Text style={[styles.badgeText, { color: colors.secondary }]}>{badge}</Text>
        </View>
      </View>
      
      <View style={styles.pointsContainer}>
        <Text style={[styles.points, { color: colors.primary }]}>{points}</Text>
        <Text style={[styles.pointsLabel, { color: colors.icon }]}>pts</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  rankContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  rankText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  pointsContainer: {
    alignItems: 'center',
  },
  points: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  pointsLabel: {
    fontSize: 12,
    marginTop: 2,
  },
}); 