import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function ReportsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user, logout } = useAuth();
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      // Simulate loading reports
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    }
  }, [user]);

  // Only admin can access this screen
  if (!user || user.role !== 'admin') {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#1a1a2e', '#16213e', '#0f3460']}
          style={styles.gradientBackground}
        >
          <View style={styles.accessDenied}>
            <Text style={styles.accessDeniedText}>🚫 Access Denied</Text>
            <Text style={styles.accessDeniedSubtext}>
              Only Administrators can view reports.
            </Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
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

  const mockReports = [
    {
      id: '1',
      title: 'Mangrove Deforestation',
      status: 'pending',
      priority: 'high',
      location: 'Mumbai Coast',
      reporter: 'John Doe',
      date: '2024-12-15'
    },
    {
      id: '2',
      title: 'Illegal Fishing Activity',
      status: 'reviewed',
      priority: 'medium',
      location: 'Goa Beach',
      reporter: 'Jane Smith',
      date: '2024-12-14'
    },
    {
      id: '3',
      title: 'Pollution Incident',
      status: 'resolved',
      priority: 'low',
      location: 'Kerala Backwaters',
      reporter: 'Mike Johnson',
      date: '2024-12-13'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return { text: 'Pending', emoji: '⏳', color: '#FFA500' };
      case 'reviewed':
        return { text: 'Reviewed', emoji: '👀', color: '#4169E1' };
      case 'resolved':
        return { text: 'Resolved', emoji: '✅', color: '#32CD32' };
      default:
        return { text: 'Unknown', emoji: '❓', color: '#666' };
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return { text: 'High', color: '#DC143C' };
      case 'medium':
        return { text: 'Medium', color: '#FFA500' };
      case 'low':
        return { text: 'Low', color: '#32CD32' };
      default:
        return { text: 'Unknown', color: '#666' };
    }
  };

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
            <Text style={styles.title}>📊 Incident Reports</Text>
            <Text style={styles.subtitle}>
              Review and manage community incident reports
            </Text>
          </View>

          {/* Quick Stats */}
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Ionicons name="document-text" size={24} color="#4169E1" />
              <Text style={styles.statNumber}>{mockReports.length}</Text>
              <Text style={styles.statLabel}>Total Reports</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="time" size={24} color="#FFA500" />
              <Text style={styles.statNumber}>
                {mockReports.filter(r => r.status === 'pending').length}
              </Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="checkmark-circle" size={24} color="#32CD32" />
              <Text style={styles.statNumber}>
                {mockReports.filter(r => r.status === 'resolved').length}
              </Text>
              <Text style={styles.statLabel}>Resolved</Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actionsCard}>
            <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
            
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="filter-outline" size={32} color="#4169E1" />
              <Text style={styles.actionText}>Filter Reports</Text>
              <Text style={styles.actionSubtext}>Filter by status, priority, or location</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="search-outline" size={32} color="#32CD32" />
              <Text style={styles.actionText}>Search Reports</Text>
              <Text style={styles.actionSubtext}>Find specific incident reports</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="download-outline" size={32} color="#FFA500" />
              <Text style={styles.actionText}>Export Data</Text>
              <Text style={styles.actionSubtext}>Download reports for analysis</Text>
            </TouchableOpacity>
          </View>

          {/* Reports List */}
          <View style={styles.reportsCard}>
            <Text style={styles.sectionTitle}>📋 Recent Reports</Text>
            
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading reports...</Text>
              </View>
            ) : mockReports.length > 0 ? (
              <View style={styles.reportsList}>
                {mockReports.map((report) => {
                  const statusBadge = getStatusBadge(report.status);
                  const priorityBadge = getPriorityBadge(report.priority);
                  
                  return (
                    <View key={report.id} style={styles.reportItem}>
                      <View style={styles.reportHeader}>
                        <Text style={styles.reportTitle}>{report.title}</Text>
                        <View style={styles.reportBadges}>
                          <View style={[styles.badge, { backgroundColor: statusBadge.color }]}>
                            <Text style={styles.badgeText}>
                              {statusBadge.emoji} {statusBadge.text}
                            </Text>
                          </View>
                          <View style={[styles.badge, { backgroundColor: priorityBadge.color }]}>
                            <Text style={styles.badgeText}>
                              {priorityBadge.text}
                            </Text>
                          </View>
                        </View>
                      </View>
                      
                      <View style={styles.reportDetails}>
                        <View style={styles.detailRow}>
                          <Ionicons name="location-outline" size={16} color="#666" />
                          <Text style={styles.detailText}>{report.location}</Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Ionicons name="person-outline" size={16} color="#666" />
                          <Text style={styles.detailText}>{report.reporter}</Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Ionicons name="calendar-outline" size={16} color="#666" />
                          <Text style={styles.detailText}>{report.date}</Text>
                        </View>
                      </View>
                      
                      <View style={styles.reportActions}>
                        <TouchableOpacity style={styles.actionBtn}>
                          <Ionicons name="eye-outline" size={16} color="#4169E1" />
                          <Text style={styles.actionBtnText}>View</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionBtn}>
                          <Ionicons name="checkmark-outline" size={16} color="#32CD32" />
                          <Text style={styles.actionBtnText}>Approve</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionBtn}>
                          <Ionicons name="close-outline" size={16} color="#DC143C" />
                          <Text style={styles.actionBtnText}>Reject</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No reports found</Text>
                <Text style={styles.emptySubtext}>Reports will appear here once submitted</Text>
              </View>
            )}
          </View>

          {/* Logout Button */}
          <View style={styles.logoutContainer}>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
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
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
    textAlign: 'center',
  },
  statsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  actionsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a2e',
    marginLeft: 12,
    flex: 1,
  },
  actionSubtext: {
    fontSize: 12,
    color: '#666',
    marginLeft: 12,
  },
  reportsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  reportsList: {
    gap: 16,
  },
  reportItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a2e',
    flex: 1,
    marginRight: 12,
  },
  reportBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  reportDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
  },
  reportActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    gap: 4,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
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
  accessDenied: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  accessDeniedText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  accessDeniedSubtext: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
    textAlign: 'center',
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