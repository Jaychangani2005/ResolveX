import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IncidentReportCard } from '@/components/IncidentReportCard';
import { getAllIncidentsForNGO } from '@/services/firebaseService';
import { useAuth } from '@/contexts/AuthContext';
import { IncidentReport } from '@/services/firebaseService';

export default function NGODashboardScreen() {
  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user } = useAuth();

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

  useEffect(() => {
    loadIncidents();
  }, []);

  // Check if user has NGO permissions
  useEffect(() => {
    if (user && user.role !== 'ngo') {
      Alert.alert('Access Denied', 'You do not have permission to access this area.');
      router.replace('/(tabs)');
    }
  }, [user]);

  if (!user || user.role !== 'ngo') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ThemedView style={styles.centerContainer}>
          <ThemedText style={styles.errorText}>Access Denied</ThemedText>
          <ThemedText style={styles.errorSubtext}>You do not have permission to access this area.</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <ThemedView style={styles.header}>
        <ThemedText style={[styles.title, { color: colors.text }]}>
          🌿 NGO Dashboard
        </ThemedText>
        <ThemedText style={[styles.subtitle, { color: colors.icon }]}>
          Incident Reports Overview
        </ThemedText>
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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {isLoading ? (
          <ThemedView style={styles.centerContainer}>
            <ThemedText style={[styles.loadingText, { color: colors.text }]}>
              Loading incident reports...
            </ThemedText>
          </ThemedView>
        ) : incidents.length === 0 ? (
          <ThemedView style={styles.centerContainer}>
            <ThemedText style={[styles.emptyText, { color: colors.text }]}>
              No incident reports found
            </ThemedText>
            <ThemedText style={[styles.emptySubtext, { color: colors.icon }]}>
              Reports will appear here once users submit them
            </ThemedText>
          </ThemedView>
        ) : (
          incidents.map((incident) => (
            <IncidentReportCard 
              key={incident.id} 
              incident={incident} 
              showUserInfo={true}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
  },
  errorText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  errorSubtext: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
});
