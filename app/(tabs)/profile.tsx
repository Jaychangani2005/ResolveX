import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '@/contexts/AuthContext';
import { ActionButton } from '@/components/ActionButton';
import { IncidentReportCard } from '@/components/IncidentReportCard';
import { UserProfileManager } from '@/components/UserProfileManager';
import { getUserIncidents } from '@/services/firebaseService';
import { IncidentReport } from '@/types/user';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user, logout } = useAuth();
  const [userIncidents, setUserIncidents] = useState<IncidentReport[]>([]);
  const [isLoadingIncidents, setIsLoadingIncidents] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserIncidents();
    }
  }, [user]);

  const loadUserIncidents = async () => {
    try {
      setIsLoadingIncidents(true);
      const incidents = await getUserIncidents(user!.id);
      setUserIncidents(incidents);
    } catch (error) {
      console.error('Error loading user incidents:', error);
    } finally {
      setIsLoadingIncidents(false);
    }
  };

  if (!user) {
    router.replace('/login');
    return null;
  }

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

  const getProgressPercentage = () => {
    if (user.points >= 2000) return 100;
    if (user.points >= 1000) return ((user.points - 1000) / 1000) * 100;
    return (user.points / 1000) * 100;
  };

  const getNextBadge = () => {
    if (user.points >= 2000) return { name: 'Master', emoji: '👑', points: 'Max Level' };
    if (user.points >= 1000) return { name: 'Protector', emoji: '🌳', points: '2000 points' };
    return { name: 'Guardian', emoji: '🌱', points: '1000 points' };
  };

  const nextBadge = getNextBadge();

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarEmoji}>👤</Text>
            </View>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
          </View>

          {/* Stats Card */}
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{user.points}</Text>
              <Text style={styles.statLabel}>Total Points</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{user.badgeEmoji}</Text>
              <Text style={styles.statLabel}>{user.badge}</Text>
            </View>
          </View>

          {/* Progress Card */}
          <View style={styles.progressCard}>
            <Text style={styles.progressTitle}>Progress to Next Badge</Text>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${getProgressPercentage()}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {user.points} / {nextBadge.points === 'Max Level' ? '2000+' : nextBadge.points}
              </Text>
            </View>
            <View style={styles.nextBadgeContainer}>
              <Text style={styles.nextBadgeEmoji}>{nextBadge.emoji}</Text>
              <Text style={styles.nextBadgeText}>{nextBadge.name}</Text>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.actionsCard}>
            <Text style={styles.actionsTitle}>Quick Actions</Text>
            <View style={styles.actionsGrid}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => router.push('/report-incident')}
              >
                <Text style={styles.actionEmoji}>📸</Text>
                <Text style={styles.actionText}>Report Incident</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => router.push('/leaderboard')}
              >
                <Text style={styles.actionEmoji}>🏆</Text>
                <Text style={styles.actionText}>View Leaderboard</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Profile Management */}
          <View style={styles.profileManagementCard}>
            <Text style={styles.profileManagementTitle}>Profile Management</Text>
            <UserProfileManager />
          </View>

          {/* User's Incident Reports */}
          <View style={styles.incidentsCard}>
            <Text style={styles.incidentsTitle}>Your Incident Reports</Text>
            {isLoadingIncidents ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading your reports...</Text>
              </View>
            ) : userIncidents.length > 0 ? (
              <View style={styles.incidentsList}>
                {userIncidents.slice(0, 3).map((incident) => (
                  <IncidentReportCard 
                    key={incident.id} 
                    incident={incident}
                    showUserInfo={false}
                  />
                ))}
                {userIncidents.length > 3 && (
                  <TouchableOpacity 
                    style={styles.viewAllButton}
                    onPress={() => router.push('/my-incidents')}
                  >
                    <Text style={styles.viewAllText}>View All Reports ({userIncidents.length})</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No incident reports yet</Text>
                <Text style={styles.emptySubtext}>Start by reporting your first incident!</Text>
              </View>
            )}
          </View>

          {/* Logout Button */}
          <View style={styles.logoutContainer}>
            <ActionButton
              title="🚪 Logout"
              onPress={handleLogout}
              variant="secondary"
              style={styles.logoutButton}
            />
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
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  avatarEmoji: {
    fontSize: 48,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  statsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E8B57',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e0e0e0',
  },
  progressCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2E8B57',
    marginBottom: 16,
    textAlign: 'center',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2E8B57',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  nextBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  nextBadgeEmoji: {
    fontSize: 20,
  },
  nextBadgeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E8B57',
  },
  actionsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  actionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2E8B57',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  actionEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2E8B57',
    textAlign: 'center',
  },
  profileManagementCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  profileManagementTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2E8B57',
    marginBottom: 16,
    textAlign: 'center',
  },
  logoutContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoutButton: {
    minWidth: 200,
    backgroundColor: '#DC143C',
  },
  incidentsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  incidentsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2E8B57',
    marginBottom: 16,
    textAlign: 'center',
  },
  incidentsList: {
    gap: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  viewAllButton: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginTop: 8,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E8B57',
  },
}); 