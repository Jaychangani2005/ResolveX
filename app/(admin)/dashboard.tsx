import { AdminUserManager } from '@/components/AdminUserManager';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { getAdminStats, getIncidents, getUsers } from '@/services/firebaseService';
import { IncidentReport, User } from '@/types/user';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export default function AdminDashboardScreen() {
  const { user, logout } = useAuth();
  const { isDarkMode } = useTheme();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalReports: 0,
    pendingReports: 0,
    approvedReports: 0,
    rejectedReports: 0,
    totalAdmins: 0,
    activeUsers: 0,
  });
  const [showUserModal, setShowUserModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [showApprovedModal, setShowApprovedModal] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [reports, setReports] = useState<IncidentReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      const adminStats = await getAdminStats();
      setStats(adminStats);
    } catch (error) {
      console.error('Error loading admin stats:', error);
    }
  };

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const allUsers = await getUsers(100);
      setUsers(allUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadReports = async () => {
    try {
      setIsLoading(true);
      const allReports = await getIncidents(100);
      setReports(allReports);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleBadge = () => {
<<<<<<< HEAD
    if (user?.role === 'admin') {
      return { text: 'Admin', emoji: '🛡️', color: '#4169E1' };
=======
    if (user?.role === 'super_user') {
      return { text: 'Super User', color: '#FFD700' };
    } else if (user?.role === 'admin') {
      return { text: 'Admin', color: '#4169E1' };
>>>>>>> 6e807afbab16fcaf40d5ab16717b91870ecc77e6
    }
    return { text: 'User', color: '#32CD32' };
  };

  const roleBadge = getRoleBadge();

  const handleStatPress = async (statType: string) => {
    switch (statType) {
      case 'users':
        await loadUsers();
        setShowUserModal(true);
        break;
      case 'reports':
        await loadReports();
        setShowReportModal(true);
        break;
      case 'pending':
        await loadReports();
        setShowPendingModal(true);
        break;
      case 'approved':
        await loadReports();
        setShowApprovedModal(true);
        break;
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'reports':
        router.push('/(admin)/reports');
        break;
      case 'users':
        router.push('/(admin)/users');
        break;
      case 'settings':
        router.push('/(admin)/settings');
        break;
    }
  };

  const renderUserModal = () => (
    <Modal
      visible={showUserModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowUserModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: isDarkMode ? '#1a1a2e' : '#fff' }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>All Users ({users.length})</Text>
            <TouchableOpacity onPress={() => setShowUserModal(false)}>
              <Ionicons name="close" size={24} color={isDarkMode ? '#fff' : '#666'} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalScroll}>
            {users.map((user) => (
              <View key={user.id} style={[styles.modalItem, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }]}>
                <View style={styles.modalItemHeader}>
                  <Text style={[styles.modalItemTitle, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>{user.name}</Text>
                  <Text style={[styles.modalItemRole, { color: roleBadge.color }]}>
                    {user.role.toUpperCase()}
                  </Text>
                </View>
                <Text style={[styles.modalItemSubtitle, { color: isDarkMode ? '#ccc' : '#666' }]}>{user.email}</Text>
                <View style={styles.modalItemMeta}>
                  <Text style={[styles.modalItemMetaText, { color: isDarkMode ? '#ccc' : '#666' }]}>Points: {user.points}</Text>
                  <Text style={[styles.modalItemMetaText, { color: isDarkMode ? '#ccc' : '#666' }]}>
                    Status: {user.isActive ? 'Active' : 'Inactive'}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderReportModal = () => (
    <Modal
      visible={showReportModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowReportModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: isDarkMode ? '#1a1a2e' : '#fff' }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>All Reports ({reports.length})</Text>
            <TouchableOpacity onPress={() => setShowReportModal(false)}>
              <Ionicons name="close" size={24} color={isDarkMode ? '#fff' : '#666'} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalScroll}>
            {reports.map((report) => (
              <View key={report.id} style={[styles.modalItem, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }]}>
                <View style={styles.modalItemHeader}>
                  <Text style={[styles.modalItemTitle, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>{report.userName}</Text>
                  <Text style={[styles.modalItemStatus, { 
                    color: report.status === 'approved' ? '#32CD32' : 
                           report.status === 'pending' ? '#FFA500' : '#FF6B6B' 
                  }]}>
                    {report.status.toUpperCase()}
                  </Text>
                </View>
                <Text style={[styles.modalItemSubtitle, { color: isDarkMode ? '#ccc' : '#666' }]}>{report.description}</Text>
                <Text style={[styles.modalItemMetaText, { color: isDarkMode ? '#ccc' : '#666' }]}>
                  {new Date(report.createdAt).toLocaleDateString()}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderPendingModal = () => (
    <Modal
      visible={showPendingModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowPendingModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: isDarkMode ? '#1a1a2e' : '#fff' }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>Pending Reports ({reports.filter(r => r.status === 'pending').length})</Text>
            <TouchableOpacity onPress={() => setShowPendingModal(false)}>
              <Ionicons name="close" size={24} color={isDarkMode ? '#fff' : '#666'} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalScroll}>
            {reports.filter(r => r.status === 'pending').map((report) => (
              <View key={report.id} style={[styles.modalItem, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }]}>
                <View style={styles.modalItemHeader}>
                  <Text style={[styles.modalItemTitle, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>{report.userName}</Text>
                  <Text style={[styles.modalItemStatus, { color: '#FFA500' }]}>
                    PENDING
                  </Text>
                </View>
                <Text style={[styles.modalItemSubtitle, { color: isDarkMode ? '#ccc' : '#666' }]}>{report.description}</Text>
                <Text style={[styles.modalItemMetaText, { color: isDarkMode ? '#ccc' : '#666' }]}>
                  {new Date(report.createdAt).toLocaleDateString()}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderApprovedModal = () => (
    <Modal
      visible={showApprovedModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowApprovedModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: isDarkMode ? '#1a1a2e' : '#fff' }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>Approved Reports ({reports.filter(r => r.status === 'approved').length})</Text>
            <TouchableOpacity onPress={() => setShowApprovedModal(false)}>
              <Ionicons name="close" size={24} color={isDarkMode ? '#fff' : '#666'} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalScroll}>
            {reports.filter(r => r.status === 'approved').map((report) => (
              <View key={report.id} style={[styles.modalItem, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }]}>
                <View style={styles.modalItemHeader}>
                  <Text style={[styles.modalItemTitle, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>{report.userName}</Text>
                  <Text style={[styles.modalItemStatus, { color: '#32CD32' }]}>
                    APPROVED
                  </Text>
                </View>
                <Text style={[styles.modalItemSubtitle, { color: isDarkMode ? '#ccc' : '#666' }]}>{report.description}</Text>
                <Text style={[styles.modalItemMetaText, { color: isDarkMode ? '#ccc' : '#666' }]}>
                  {new Date(report.createdAt).toLocaleDateString()}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={isDarkMode ? ['#0f0f23', '#1a1a2e', '#16213e'] : ['#f8f9fa', '#e9ecef', '#dee2e6']}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.welcomeSection}>
              <Text style={[styles.welcomeText, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>Welcome back,</Text>
              <Text style={[styles.adminName, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>{user?.name}</Text>
              <View style={[styles.roleBadge, { backgroundColor: roleBadge.color }]}>
                <Text style={styles.roleText}>{roleBadge.text}</Text>
              </View>
            </View>
          </View>

          {/* Quick Stats */}
          <View style={styles.statsGrid}>
            <TouchableOpacity style={[styles.statCard, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.95)' }]} onPress={() => handleStatPress('users')}>
              <View style={styles.statIcon}>
                <Ionicons name="people" size={24} color="#4169E1" />
              </View>
              <Text style={[styles.statNumber, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>{stats.totalUsers}</Text>
              <Text style={[styles.statLabel, { color: isDarkMode ? '#ccc' : '#666' }]}>Total Users</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.statCard, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.95)' }]} onPress={() => handleStatPress('reports')}>
              <View style={styles.statIcon}>
                <Ionicons name="document-text" size={24} color="#FF6B6B" />
              </View>
              <Text style={[styles.statNumber, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>{stats.totalReports}</Text>
              <Text style={[styles.statLabel, { color: isDarkMode ? '#ccc' : '#666' }]}>Total Reports</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.statCard, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.95)' }]} onPress={() => handleStatPress('pending')}>
              <View style={styles.statIcon}>
                <Ionicons name="time" size={24} color="#FFA500" />
              </View>
              <Text style={[styles.statNumber, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>{stats.pendingReports}</Text>
              <Text style={[styles.statLabel, { color: isDarkMode ? '#ccc' : '#666' }]}>Pending</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.statCard, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.95)' }]} onPress={() => handleStatPress('approved')}>
              <View style={styles.statIcon}>
                <Ionicons name="checkmark-circle" size={24} color="#32CD32" />
              </View>
              <Text style={[styles.statNumber, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>{stats.approvedReports}</Text>
              <Text style={[styles.statLabel, { color: isDarkMode ? '#ccc' : '#666' }]}>Approved</Text>
            </TouchableOpacity>
          </View>

          {/* Report Status */}
          <View style={[styles.reportStatusCard, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.95)' }]}>
            <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>Report Status Overview</Text>
            <View style={styles.statusBars}>
              <View style={styles.statusBar}>
                <Text style={[styles.statusLabel, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>Pending</Text>
                <View style={[styles.progressBar, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : '#e0e0e0' }]}>
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
                <Text style={[styles.statusCount, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>{stats.pendingReports}</Text>
              </View>

              <View style={styles.statusBar}>
                <Text style={[styles.statusLabel, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>Approved</Text>
                <View style={[styles.progressBar, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : '#e0e0e0' }]}>
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
                <Text style={[styles.statusCount, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>{stats.approvedReports}</Text>
              </View>

              <View style={styles.statusBar}>
                <Text style={[styles.statusLabel, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>Rejected</Text>
                <View style={[styles.progressBar, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : '#e0e0e0' }]}>
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
                <Text style={[styles.statusCount, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>{stats.rejectedReports}</Text>
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={[styles.actionsCard, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.95)' }]}>
            <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>Quick Actions</Text>
            <View style={styles.actionsGrid}>
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#f8f9fa' }]}
                onPress={() => handleQuickAction('reports')}
              >
                <Ionicons name="document-text-outline" size={32} color="#4169E1" />
                <Text style={[styles.actionText, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>Review Reports</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#f8f9fa' }]}
                onPress={() => handleQuickAction('users')}
              >
                <Ionicons name="people-outline" size={32} color="#32CD32" />
                <Text style={[styles.actionText, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>Manage Users</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#f8f9fa' }]}
                onPress={() => handleQuickAction('settings')}
              >
                <Ionicons name="settings-outline" size={32} color="#FFA500" />
                <Text style={[styles.actionText, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>Settings</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* System Info */}
          <View style={[styles.systemInfoCard, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.95)' }]}>
            <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>System Information</Text>
            <View style={styles.systemInfo}>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: isDarkMode ? '#ccc' : '#666' }]}>Active Users:</Text>
                <Text style={[styles.infoValue, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>{stats.activeUsers}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: isDarkMode ? '#ccc' : '#666' }]}>Total Admins:</Text>
                <Text style={[styles.infoValue, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>{stats.totalAdmins}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: isDarkMode ? '#ccc' : '#666' }]}>System Status:</Text>
                <Text style={[styles.infoValue, { color: '#32CD32' }]}>Online</Text>
              </View>
            </View>
          </View>

          {/* User Management */}
          <View style={[styles.userManagementCard, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.95)' }]}>
            <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>User Management</Text>
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
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>

      {/* Modals */}
      {renderUserModal()}
      {renderReportModal()}
      {renderPendingModal()}
      {renderApprovedModal()}
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
    opacity: 0.8,
  },
  adminName: {
    fontSize: 28,
    fontWeight: 'bold',
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
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  reportStatusCard: {
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
    minWidth: 80,
  },
  progressBar: {
    flex: 1,
    height: 8,
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
    minWidth: 40,
    textAlign: 'right',
  },
  actionsCard: {
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
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  systemInfoCard: {
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
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  userManagementCard: {
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalScroll: {
    maxHeight: 400,
  },
  modalItem: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalItemTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalItemRole: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  modalItemStatus: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  modalItemSubtitle: {
    fontSize: 14,
    marginBottom: 8,
  },
  modalItemMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalItemMetaText: {
    fontSize: 12,
  },
}); 