import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { getGovernmentRecentActivity, getGovernmentStats } from '@/services/firebaseService';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function GovernmentDashboardScreen() {
  const [stats, setStats] = useState({
    totalReports: 0,
    pendingReports: 0,
    resolvedReports: 0,
    totalUsers: 0,
    mangroveAreas: 8,
    recentReports: 0,
    weeklyUsers: 0,
    activeUsers: 0,
    totalPoints: 0,
    averagePointsPerUser: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user, logout } = useAuth();

  useEffect(() => {
    // Load dashboard statistics
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      console.log('🏛️ Loading government dashboard data...');
      
      // Fetch stats and recent activity in parallel
      const [statsData, activityData] = await Promise.all([
        getGovernmentStats(),
        getGovernmentRecentActivity()
      ]);
      
      setStats(statsData);
      setRecentActivity(activityData);
      
      console.log('✅ Government dashboard data loaded successfully');
    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
      Alert.alert(
        'Error',
        'Failed to load dashboard data. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
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

  const navigateTo = (route: string) => {
    router.push(route);
  };



  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading dashboard...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={[styles.welcomeText, { color: colors.text }]}>
              Welcome back, {user?.name || 'Government Official'}
            </Text>
            <Text style={[styles.roleText, { color: colors.primary }]}>
              🏛️ Government Dashboard
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={[styles.smsButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/sms')}
            >
              <Ionicons name="chatbubble-ellipses" size={20} color="#fff" />
              <Text style={styles.smsButtonText}>SMS</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color="#DC143C" />
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>
            📊 Quick Statistics
          </Text>
          
                     <View style={styles.statsGrid}>
             <View style={[styles.statCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
               <Text style={[styles.statNumber, { color: colors.primary }]}>{stats.totalReports}</Text>
               <Text style={[styles.statLabel, { color: colors.text }]}>Total Reports</Text>
             </View>
             
             <View style={[styles.statCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
               <Text style={[styles.statNumber, { color: '#2196F3' }]}>{stats.totalUsers}</Text>
               <Text style={[styles.statLabel, { color: colors.text }]}>Total Users</Text>
             </View>
             
             <View style={[styles.statCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
               <Text style={[styles.statNumber, { color: '#9C27B0' }]}>{stats.activeUsers}</Text>
               <Text style={[styles.statLabel, { color: colors.text }]}>Active Users</Text>
             </View>
             
             <View style={[styles.statCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
               <Text style={[styles.statNumber, { color: '#FF5722' }]}>{stats.recentReports}</Text>
               <Text style={[styles.statLabel, { color: colors.text }]}>Last 24h</Text>
             </View>
             
             <View style={[styles.statCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
               <Text style={[styles.statNumber, { color: '#FFC107' }]}>{stats.totalPoints}</Text>
               <Text style={[styles.statLabel, { color: colors.text }]}>Total Points</Text>
             </View>
             
             <View style={[styles.statCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
               <Text style={[styles.statNumber, { color: '#00BCD4' }]}>{stats.mangroveAreas}</Text>
               <Text style={[styles.statLabel, { color: colors.text }]}>Mangrove Areas</Text>
             </View>
           </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>
            ⚡ Quick Actions
          </Text>
          
          <View style={styles.actionGrid}>
            <TouchableOpacity 
              style={[styles.actionCard, { backgroundColor: colors.primary }]}
              onPress={() => navigateTo('/(government)/reports')}
            >
              <Ionicons name="document-text-outline" size={32} color="#fff" />
              <Text style={styles.actionText}>View Reports</Text>
              <Text style={styles.actionSubtext}>Review incident reports</Text>
            </TouchableOpacity>
            
                         <TouchableOpacity 
               style={[styles.actionCard, { backgroundColor: '#4CAF50' }]}
               onPress={() => navigateTo('/(government)/settings')}
             >
               <Ionicons name="settings-outline" size={32} color="#fff" />
               <Text style={styles.actionText}>Settings</Text>
               <Text style={styles.actionSubtext}>Configure system</Text>
             </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.activityContainer}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>
            📋 Recent Activity
          </Text>
          
          <View style={[styles.activityCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
            {recentActivity.length > 0 ? (
              recentActivity.slice(0, 5).map((activity, index) => (
                <View key={index} style={styles.activityItem}>
                  <Text style={[styles.activityText, { color: colors.text }]}>
                    • {activity.action}
                  </Text>
                  <Text style={[styles.activityDetails, { color: colors.textSecondary || colors.text }]}>
                    {activity.details} • {activity.timestamp.toLocaleDateString()}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={[styles.activityText, { color: colors.textSecondary || colors.text }]}>
                No recent activity
              </Text>
            )}
          </View>
        </View>

        {/* System Status */}
        <View style={styles.statusContainer}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>
            🟢 System Status
          </Text>
          
          <View style={[styles.statusCard, { backgroundColor: '#E8F5E8', borderColor: '#4CAF50' }]}>
            <Text style={[styles.statusText, { color: '#2E7D32' }]}>
              All systems operational
            </Text>
            <Text style={[styles.statusSubtext, { color: '#4CAF50' }]}>
              Last updated: {new Date().toLocaleTimeString()}
            </Text>
          </View>
        </View>
             </ScrollView>
     </View>
   );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  headerContent: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  roleText: {
    fontSize: 16,
    fontWeight: '600',
  },
  smsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  smsButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(220, 20, 60, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DC143C',
  },
  logoutButtonText: {
    color: '#DC143C',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsContainer: {
    marginBottom: 30,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  actionsContainer: {
    marginBottom: 30,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionCard: {
    width: '48%',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  actionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  actionSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    textAlign: 'center',
  },
  activityContainer: {
    marginBottom: 30,
  },
  activityCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityText: {
    fontSize: 14,
    marginBottom: 4,
    lineHeight: 20,
  },
  activityDetails: {
    fontSize: 12,
    marginBottom: 8,
    lineHeight: 16,
    opacity: 0.7,
  },
  activityItem: {
    marginBottom: 8,
  },
  statusContainer: {
    marginBottom: 30,
  },
  statusCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusSubtext: {
    fontSize: 12,
  },
});
