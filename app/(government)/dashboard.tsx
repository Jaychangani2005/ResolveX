import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function GovernmentDashboardScreen() {
  const [stats, setStats] = useState({
    totalReports: 0,
    pendingReports: 0,
    resolvedReports: 0,
    totalUsers: 0,
    mangroveAreas: 8,
  });

  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user, logout } = useAuth();

  useEffect(() => {
    // Load dashboard statistics
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      // TODO: Implement actual data fetching from Firestore
      // For now, using mock data
      setStats({
        totalReports: 156,
        pendingReports: 23,
        resolvedReports: 133,
        totalUsers: 89,
        mangroveAreas: 8,
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    }
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView}>
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
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#DC143C" />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
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
              <Text style={[styles.statNumber, { color: '#FF9800' }]}>{stats.pendingReports}</Text>
              <Text style={[styles.statLabel, { color: colors.text }]}>Pending</Text>
            </View>
            
            <View style={[styles.statCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Text style={[styles.statNumber, { color: '#4CAF50' }]}>{stats.resolvedReports}</Text>
              <Text style={[styles.statLabel, { color: colors.text }]}>Resolved</Text>
            </View>
            
            <View style={[styles.statCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Text style={[styles.statNumber, { color: '#2196F3' }]}>{stats.totalUsers}</Text>
              <Text style={[styles.statLabel, { color: colors.text }]}>Active Users</Text>
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
              style={[styles.actionCard, { backgroundColor: '#FF9800' }]}
              onPress={() => navigateTo('/(government)/analytics')}
            >
              <Ionicons name="analytics-outline" size={32} color="#fff" />
              <Text style={styles.actionText}>Analytics</Text>
              <Text style={styles.actionSubtext}>View statistics</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionCard, { backgroundColor: '#4CAF50' }]}
              onPress={() => navigateTo('/(government)/settings')}
            >
              <Ionicons name="settings-outline" size={32} color="#fff" />
              <Text style={styles.actionText}>Settings</Text>
              <Text style={styles.actionSubtext}>Configure system</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionCard, { backgroundColor: '#2196F3' }]}
              onPress={() => Alert.alert('Coming Soon', 'Export functionality will be available soon!')}
            >
              <Ionicons name="download-outline" size={32} color="#fff" />
              <Text style={styles.actionText}>Export Data</Text>
              <Text style={styles.actionSubtext}>Download reports</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.activityContainer}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>
            📋 Recent Activity
          </Text>
          
          <View style={[styles.activityCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Text style={[styles.activityText, { color: colors.text }]}>
              • 5 new incident reports submitted in the last 24 hours
            </Text>
            <Text style={[styles.activityText, { color: colors.text }]}>
              • 3 reports resolved by admin team
            </Text>
            <Text style={[styles.activityText, { color: colors.text }]}>
              • 12 new users registered this week
            </Text>
            <Text style={[styles.activityText, { color: colors.text }]}>
              • System maintenance completed successfully
            </Text>
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
    </SafeAreaView>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  headerContent: {
    flex: 1,
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
    marginBottom: 8,
    lineHeight: 20,
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
