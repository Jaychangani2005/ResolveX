import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ActionButton } from '@/components/ActionButton';
import { useAuth } from '@/contexts/AuthContext';
import { getCommunityStats } from '@/services/firebaseService';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user, logout } = useAuth();
  const [communityStats, setCommunityStats] = useState({
    totalIncidents: 0,
    totalUsers: 0,
    totalSites: 0,
  });

  useEffect(() => {
    loadCommunityStats();
  }, []);

  const loadCommunityStats = async () => {
    try {
      const stats = await getCommunityStats();
      setCommunityStats({
        totalIncidents: stats.totalIncidents,
        totalUsers: stats.totalUsers,
        totalSites: Math.floor(stats.totalIncidents / 10) + 50, // Estimate based on incidents
      });
    } catch (error) {
      console.error('Error loading community stats:', error);
    }
  };

  const handleReportIncident = () => {
    router.push('/report-incident');
  };

  const handleLeaderboard = () => {
    router.push('/leaderboard');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login');
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[colors.primary, colors.secondary, colors.accent]}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Logout Button - Top Right */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#fff" />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Floating Elements */}
          <View style={styles.floatingElements}>
            <View style={[styles.floatingCircle, styles.circle1]} />
            <View style={[styles.floatingCircle, styles.circle2]} />
            <View style={[styles.floatingCircle, styles.circle3]} />
          </View>

          <View style={styles.header}>
            <Text style={styles.title}>
              🌱 Community Mangrove Watch
            </Text>
            <Text style={styles.subtitle}>
              Protecting our coastal ecosystems together
            </Text>
            
            {user && (
              <View style={styles.welcomeCard}>
                <Text style={styles.welcomeText}>Welcome back, {user.name}! 👋</Text>
                <View style={styles.userStats}>
                  <Text style={styles.userPoints}>{user.points} points</Text>
                  <Text style={styles.userBadge}>{user.badgeEmoji} {user.badge}</Text>
                </View>
              </View>
            )}
          </View>

        <View style={styles.content}>
          <View style={styles.infoCard}>
            <Text style={[styles.infoTitle, { color: colors.primary }]}>
              Welcome to the Community Mangrove Watch!
            </Text>
            <Text style={[styles.infoText, { color: colors.text }]}>
              Join our community of environmental stewards. Report incidents, track your contributions, and help protect our precious mangrove ecosystems.
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <ActionButton
              title="📸 Report Incident"
              onPress={handleReportIncident}
              variant="primary"
              style={styles.mainButton}
            />
            
            <ActionButton
              title="🏆 Leaderboard"
              onPress={handleLeaderboard}
              variant="secondary"
              style={styles.mainButton}
            />
            
            <ActionButton
              title="👤 Profile"
              onPress={() => router.push('/profile')}
              variant="secondary"
              style={styles.mainButton}
            />
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.primary }]}>{communityStats.totalIncidents.toLocaleString()}</Text>
              <Text style={[styles.statLabel, { color: colors.text }]}>Incidents Reported</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.secondary }]}>{communityStats.totalUsers.toLocaleString()}</Text>
              <Text style={[styles.statLabel, { color: colors.text }]}>Active Contributors</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.accent }]}>{communityStats.totalSites.toLocaleString()}</Text>
              <Text style={[styles.statLabel, { color: colors.text }]}>Mangrove Sites</Text>
            </View>
          </View>
        </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  logoutButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(220, 20, 60, 0.8)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  floatingElements: {
    position: 'absolute',
    width: width,
    height: height,
  },
  floatingCircle: {
    position: 'absolute',
    borderRadius: 100,
    opacity: 0.1,
  },
  circle1: {
    width: 120,
    height: 120,
    top: height * 0.1,
    right: -60,
    backgroundColor: '#fff',
  },
  circle2: {
    width: 80,
    height: 80,
    top: height * 0.3,
    left: -40,
    backgroundColor: '#fff',
  },
  circle3: {
    width: 60,
    height: 60,
    top: height * 0.6,
    right: -30,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.9,
    color: '#fff',
    marginBottom: 20,
  },
  welcomeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 16,
    backdropFilter: 'blur(10px)',
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  userStats: {
    flexDirection: 'row',
    gap: 20,
  },
  userPoints: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    opacity: 0.9,
  },
  userBadge: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    opacity: 0.9,
  },
  content: {
    flex: 1,
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 20,
    borderRadius: 16,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
    color: '#2E8B57',
  },
  infoText: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    opacity: 0.8,
    color: '#333',
  },
  buttonContainer: {
    gap: 20,
    marginBottom: 40,
  },
  mainButton: {
    minWidth: 250,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#2E8B57',
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.7,
    color: '#333',
  },
});
