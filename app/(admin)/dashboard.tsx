import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { getAdminStats } from '@/services/firebaseService';
import { AdminUserManager } from '@/components/AdminUserManager';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function AdminDashboardScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalReports: 0,
    pendingReports: 0,
    approvedReports: 0,
    rejectedReports: 0,
    totalAdmins: 0,
    activeUsers: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const adminStats = await getAdminStats();
      setStats(adminStats);
    } catch (error) {
      console.error('Error loading admin stats:', error);
    }
  };

  const getRoleBadge = () => {
    if (user?.role === 'admin') {
      return { text: 'Admin', emoji: '🛡️', color: '#4169E1' };
    }
    return { text: 'User', emoji: '👤', color: '#32CD32' };
  };

  const roleBadge = getRoleBadge();

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeText}>Welcome back,</Text>
              <Text style={styles.adminName}>{user?.name}</Text>
              <View style={[styles.roleBadge, { backgroundColor: roleBadge.color }]}>
                <Text style={styles.roleEmoji}>{roleBadge.emoji}</Text>
                <Text style={styles.roleText}>{roleBadge.text}</Text>
              </View>
            </View>
          </View>

          {/* Quick Stats */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Ionicons name="people" size={24} color="#4169E1" />
              </View>
              <Text style={styles.statNumber}>{stats.totalUsers}</Text>
              <Text style={styles.statLabel}>Total Users</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Ionicons name="document-text" size={24} color="#FF6B6B" />
              </View>
              <Text style={styles.statNumber}>{stats.totalReports}</Text>
              <Text style={styles.statLabel}>Total Reports</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Ionicons name="time" size={24} color="#FFA500" />
              </View>
              <Text style={styles.statNumber}>{stats.pendingReports}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Ionicons name="checkmark-circle" size={24} color="#32CD32" />
              </View>
              <Text style={styles.statNumber}>{stats.approvedReports}</Text>
              <Text style={styles.statLabel}>Approved</Text>
            </View>
          </View>

          {/* Report Status */}
          <View style={styles.reportStatusCard}>
            <Text style={styles.sectionTitle}>📊 Report Status Overview</Text>
            <View style={styles.statusBars}>
              <View style={styles.statusBar}>
                <Text style={styles.statusLabel}>Pending</Text>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: `${(stats.pendingReports / Math.max(stats.totalReports, 1)) * 100}%`,
                        backgroundColor: '#FFA500'
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.statusCount}>{stats.pendingReports}</Text>
              </View>

              <View style={styles.statusBar}>
                <Text style={styles.statusLabel}>Approved</Text>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: `${(stats.approvedReports / Math.max(stats.totalReports, 1)) * 100}%`,
                        backgroundColor: '#32CD32'
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.statusCount}>{stats.approvedReports}</Text>
              </View>

              <View style={styles.statusBar}>
                <Text style={styles.statusLabel}>Rejected</Text>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: `${(stats.rejectedReports / Math.max(stats.totalReports, 1)) * 100}%`,
                        backgroundColor: '#FF6B6B'
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.statusCount}>{stats.rejectedReports}</Text>
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.actionsCard}>
            <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
            <View style={styles.actionsGrid}>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="document-text-outline" size={32} color="#4169E1" />
                <Text style={styles.actionText}>Review Reports</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="people-outline" size={32} color="#32CD32" />
                <Text style={styles.actionText}>Manage Users</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="analytics-outline" size={32} color="#FF6B6B" />
                <Text style={styles.actionText}>View Analytics</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="settings-outline" size={32} color="#FFA500" />
                <Text style={styles.actionText}>Settings</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* System Info */}
          <View style={styles.systemInfoCard}>
            <Text style={styles.sectionTitle}>🔧 System Information</Text>
            <View style={styles.systemInfo}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Active Users:</Text>
                <Text style={styles.infoValue}>{stats.activeUsers}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Total Admins:</Text>
                <Text style={styles.infoValue}>{stats.totalAdmins}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>System Status:</Text>
                <Text style={[styles.infoValue, { color: '#32CD32' }]}>🟢 Online</Text>
              </View>
            </View>
          </View>

          {/* User Management */}
          <View style={styles.userManagementCard}>
            <Text style={styles.sectionTitle}>👥 User Management</Text>
            <AdminUserManager />
          </View>

          {/* Logout Button */}
          <View style={styles.logoutContainer}>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={() => {
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
              }}
            >
              <Text style={styles.logoutButtonText}>🚪 Logout</Text>
            </TouchableOpacity>
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
    marginBottom: 30,
  },
  welcomeSection: {
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 18,
    color: '#fff',
    opacity: 0.8,
  },
  adminName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  roleEmoji: {
    fontSize: 16,
  },
  roleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: width * 0.4,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statIcon: {
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  reportStatusCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: 16,
  },
  statusBars: {
    gap: 16,
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a2e',
    minWidth: 80,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  statusCount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1a1a2e',
    minWidth: 40,
    textAlign: 'right',
  },
  actionsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  actionButton: {
    flex: 1,
    minWidth: width * 0.4,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a1a2e',
    marginTop: 8,
    textAlign: 'center',
  },
  systemInfoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  systemInfo: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a2e',
  },
  userManagementCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoutButton: {
    backgroundColor: '#DC143C',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    minWidth: 200,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
}); 