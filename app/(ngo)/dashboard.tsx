import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { getAllIncidentsForNGO } from '@/services/firebaseService';
import { IncidentReport } from '@/types/user';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, Image, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export default function NGODashboardScreen() {
  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user, logout } = useAuth();

  const loadIncidents = async () => {
    try {
      setIsLoading(true);
      const allIncidents = await getAllIncidentsForNGO();
      setIncidents(allIncidents);
    } catch (error: any) {
      console.error('Error loading incidents:', error);
      Alert.alert('Error', 'Failed to load incident reports. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadIncidents();
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
            try {
              await logout();
              router.replace('/login');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          }
        }
      ]
    );
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  // Check if user has NGO permissions
  useEffect(() => {
    if (user && user.role !== 'conservation_ngos') {
      Alert.alert('Access Denied', 'You do not have permission to access this area.');
      router.replace('/(tabs)');
    }
  }, [user]);

  if (!user || user.role !== 'conservation_ngos') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.centerContainer}>
          <Text style={[styles.errorText, { color: colors.text }]}>Access Denied</Text>
          <Text style={[styles.errorSubtext, { color: colors.secondary }]}>You do not have permission to access this area.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <ThemedView style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerContent}>
            <ThemedText style={[styles.title, { color: colors.text }]}>
              🌿 NGO Dashboard
            </ThemedText>
            <ThemedText style={[styles.subtitle, { color: colors.icon }]}>
              Incident Reports Overview
            </ThemedText>
          </View>
          
          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/sms')}
            >
              <Ionicons name="chatbubble-ellipses" size={20} color="#fff" />
              <ThemedText style={styles.actionButtonText}>SMS</ThemedText>
            </TouchableOpacity>
            
            {/* Logout Button */}
            <TouchableOpacity 
              style={[styles.logoutButton, { backgroundColor: 'rgba(220, 20, 60, 0.1)' }]}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={20} color="#DC143C" />
              <ThemedText style={styles.logoutButtonText}>Logout</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </ThemedView>

      {/* Statistics */}
      <ThemedView style={styles.statsContainer}>
        <View style={styles.statItem}>
          <ThemedText style={[styles.statNumber, { color: colors.primary }]}>
            {incidents.length}
          </ThemedText>
          <ThemedText style={[styles.statLabel, { color: colors.icon }]}>
            Total Reports
          </ThemedText>
        </View>
        <View style={styles.statItem}>
          <ThemedText style={[styles.statNumber, { color: colors.primary }]}>
            {incidents.filter(incident => incident.aiValidated).length}
          </ThemedText>
          <ThemedText style={[styles.statLabel, { color: colors.icon }]}>
            AI Validated
          </ThemedText>
        </View>
        <View style={styles.statItem}>
          <ThemedText style={[styles.statNumber, { color: colors.primary }]}>
            {incidents.filter(incident => incident.status === 'resolved').length}
          </ThemedText>
          <ThemedText style={[styles.statLabel, { color: colors.icon }]}>
            Resolved
          </ThemedText>
        </View>
      </ThemedView>

      {/* Incidents List */}
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>NGO Dashboard</Text>
          <View style={[styles.roleBadge, { backgroundColor: '#32CD32' }]}>
            <Text style={styles.roleText}>NGO Partner</Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Overview</Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <View style={styles.statIcon}>
                <Ionicons name="document-text" size={24} color={colors.primary} />
              </View>
              <Text style={[styles.statNumber, { color: colors.text }]}>{incidents.length}</Text>
              <Text style={[styles.statLabel, { color: colors.secondary }]}>Total Reports</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <View style={styles.statIcon}>
                <Ionicons name="checkmark-circle" size={24} color="#32CD32" />
              </View>
              <Text style={[styles.statNumber, { color: colors.text }]}>{incidents.filter(incident => incident.aiValidated).length}</Text>
              <Text style={[styles.statLabel, { color: colors.secondary }]}>AI Validated</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#f8f9fa' }]}
              onPress={() => router.push('/report-incident')}
            >
              <Ionicons name="add-circle-outline" size={32} color="#4169E1" />
              <Text style={[styles.actionText, { color: '#1a1a2e' }]}>New Report</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#f8f9fa' }]}
              onPress={() => router.push('/leaderboard')}
            >
              <Ionicons name="trophy-outline" size={32} color="#FFD700" />
              <Text style={[styles.actionText, { color: '#1a1a2e' }]}>Leaderboard</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#f8f9fa' }]}
              onPress={() => router.push('/(tabs)/profile')}
            >
              <Ionicons name="person-outline" size={32} color="#32CD32" />
              <Text style={[styles.actionText, { color: '#1a1a2e' }]}>Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* NGO Information */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>NGO Information</Text>
          <View style={[styles.ngoInfoCard, { backgroundColor: '#fff', borderColor: colors.border }]}>
            <View style={styles.ngoInfo}>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: '#666' }]}>Organization:</Text>
                <Text style={[styles.infoValue, { color: '#1a1a2e' }]}>{user?.name}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: '#666' }]}>Email:</Text>
                <Text style={[styles.infoValue, { color: '#1a1a2e' }]}>{user?.email}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: '#666' }]}>Role:</Text>
                <Text style={[styles.infoValue, { color: '#32CD32' }]}>NGO Partner</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Recent Reports */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Incident Reports</Text>
          
          {isLoading ? (
            <View style={styles.centerContainer}>
              <Text style={[styles.loadingText, { color: colors.text }]}>
                Loading incident reports...
              </Text>
            </View>
          ) : incidents.length === 0 ? (
            <View style={styles.centerContainer}>
              <Ionicons name="document-outline" size={64} color={colors.secondary} />
              <Text style={[styles.emptyText, { color: colors.secondary }]}>
                No incident reports found
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.secondary }]}>
                Reports will appear here once users submit them
              </Text>
            </View>
          ) : (
            <View style={styles.incidentsList}>
              {incidents.slice(0, 5).map((incident) => (
                <TouchableOpacity 
                  key={incident.id} 
                  style={[styles.incidentCard, { backgroundColor: colors.background, borderColor: colors.border }]}
                  onPress={() => router.push(`/incident-details/${incident.id}`)}
                  activeOpacity={0.7}
                >
                  <View style={styles.incidentHeader}>
                    <View style={styles.incidentInfo}>
                      <Text style={[styles.userName, { color: colors.text }]}>{incident.userName}</Text>
                      <Text style={[styles.incidentDate, { color: colors.secondary }]}>
                        {new Date(incident.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                    <View style={styles.aiValidationContainer}>
                      <Ionicons 
                        name={incident.aiValidated ? "checkmark-circle" : "time-outline"} 
                        size={16} 
                        color={incident.aiValidated ? "#32CD32" : "#FFA500"} 
                      />
                      <Text style={[styles.aiValidationText, { color: incident.aiValidated ? "#32CD32" : "#FFA500" }]}>
                        {incident.aiValidated ? 'AI Validated' : 'Pending AI'}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.incidentDescription, { color: colors.text }]} numberOfLines={2}>
                    {incident.description}
                  </Text>
                  {incident.photoUrl && (
                    <View style={styles.photoContainer}>
                      <Image source={{ uri: incident.photoUrl }} style={styles.incidentPhoto} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
              {incidents.length > 5 && (
                <TouchableOpacity 
                  style={[styles.viewAllButton, { backgroundColor: colors.primary }]}
                  onPress={() => router.push('/(ngo)/reports')}
                >
                  <Text style={styles.viewAllText}>
                    View All Reports ({incidents.length})
                  </Text>
                </TouchableOpacity>
              )}
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
  scrollView: {
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DC143C',
    backgroundColor: 'rgba(220, 20, 60, 0.1)',
  },
  logoutButtonText: {
    color: '#DC143C',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    minWidth: 100,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  ngoInfoCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ngoInfo: {
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
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
    fontWeight: '500',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  incidentsList: {
    gap: 12,
  },
  incidentCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  incidentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  incidentInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  incidentDate: {
    fontSize: 12,
  },
  aiValidationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  aiValidationText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  incidentDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  photoContainer: {
    marginBottom: 12,
  },
  incidentPhoto: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  viewAllButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  viewAllText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
});
