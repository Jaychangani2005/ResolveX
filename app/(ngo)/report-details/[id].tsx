import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { getAllIncidentsForNGO } from '@/services/firebaseService';
import { useAuth } from '@/contexts/AuthContext';
import { IncidentReport } from '@/services/firebaseService';
import { formatCoordinates } from '@/services/locationService';

export default function ReportDetailsScreen() {
  const [incident, setIncident] = useState<IncidentReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return '#28a745';
      case 'reviewed':
        return '#ffc107';
      default:
        return '#6c757d';
    }
  };

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case 'resolved':
        return '✅';
      case 'reviewed':
        return '👀';
      default:
        return '⏳';
    }
  };

  useEffect(() => {
    const loadIncident = async () => {
      try {
        setIsLoading(true);
        const allIncidents = await getAllIncidentsForNGO();
        const foundIncident = allIncidents.find(inc => inc.id === id);
        
        if (foundIncident) {
          setIncident(foundIncident);
        } else {
          Alert.alert('Error', 'Incident report not found.');
          router.back();
        }
      } catch (error: any) {
        console.error('Error loading incident:', error);
        Alert.alert('Error', 'Failed to load incident details.');
        router.back();
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadIncident();
    }
  }, [id]);

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

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ThemedView style={styles.centerContainer}>
          <ThemedText style={[styles.loadingText, { color: colors.text }]}>
            Loading incident details...
          </ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  if (!incident) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ThemedView style={styles.centerContainer}>
          <ThemedText style={styles.errorText}>Incident Not Found</ThemedText>
          <ThemedText style={styles.errorSubtext}>The requested incident report could not be found.</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <ThemedView style={styles.header}>
        <ThemedText style={[styles.title, { color: colors.text }]}>
          📋 Incident Report Details
        </ThemedText>
        <ThemedText style={[styles.subtitle, { color: colors.icon }]}>
          Report ID: {incident.id}
        </ThemedText>
      </ThemedView>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Status Section */}
        <ThemedView style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: colors.primary }]}>
            📊 Status Information
          </ThemedText>
          <View style={styles.statusRow}>
            <ThemedText style={[styles.statusLabel, { color: colors.text }]}>Status:</ThemedText>
            <Text style={[styles.statusValue, { color: getStatusColor(incident.status) }]}>
              {getStatusEmoji(incident.status)} {incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
            </Text>
          </View>
          <View style={styles.statusRow}>
            <ThemedText style={[styles.statusLabel, { color: colors.text }]}>Reported:</ThemedText>
            <ThemedText style={[styles.statusValue, { color: colors.text }]}>
              {formatDate(incident.createdAt)}
            </ThemedText>
          </View>
          <View style={styles.statusRow}>
            <ThemedText style={[styles.statusLabel, { color: colors.text }]}>Last Updated:</ThemedText>
            <ThemedText style={[styles.statusValue, { color: colors.text }]}>
              {formatDate(incident.updatedAt)}
            </ThemedText>
          </View>
        </ThemedView>

        {/* User Information */}
        <ThemedView style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: colors.primary }]}>
            👤 Reporter Information
          </ThemedText>
          <View style={styles.infoRow}>
            <ThemedText style={[styles.infoLabel, { color: colors.text }]}>Name:</ThemedText>
            <ThemedText style={[styles.infoValue, { color: colors.text }]}>
              {incident.userName}
            </ThemedText>
          </View>
          <View style={styles.infoRow}>
            <ThemedText style={[styles.infoLabel, { color: colors.text }]}>Email:</ThemedText>
            <ThemedText style={[styles.infoValue, { color: colors.text }]}>
              {incident.userEmail}
            </ThemedText>
          </View>
          <View style={styles.infoRow}>
            <ThemedText style={[styles.infoLabel, { color: colors.text }]}>User ID:</ThemedText>
            <ThemedText style={[styles.infoValue, { color: colors.text }]}>
              {incident.userId}
            </ThemedText>
          </View>
        </ThemedView>

        {/* AI Validation */}
        {incident.aiValidated !== undefined && (
          <ThemedView style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: colors.primary }]}>
              🤖 AI Validation
            </ThemedText>
            <View style={styles.aiValidationRow}>
              <ThemedText style={[styles.infoLabel, { color: colors.text }]}>AI Status:</ThemedText>
              <Text style={[
                styles.aiValidationValue, 
                { color: incident.aiValidated ? '#28a745' : '#dc3545' }
              ]}>
                {incident.aiValidated ? '✅ Validated' : '❌ Not Validated'}
              </Text>
            </View>
            <ThemedText style={[styles.aiDescription, { color: colors.icon }]}>
              {incident.aiValidated 
                ? 'This image has been validated by our AI system as containing relevant environmental incident content.'
                : 'This image has not been validated by our AI system or was flagged as potentially irrelevant.'
              }
            </ThemedText>
          </ThemedView>
        )}

        {/* Description */}
        <ThemedView style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: colors.primary }]}>
            📝 Description
          </ThemedText>
          <ThemedText style={[styles.descriptionText, { color: colors.text }]}>
            {incident.description}
          </ThemedText>
        </ThemedView>

        {/* Photo */}
        {incident.photoUrl && (
          <ThemedView style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: colors.primary }]}>
              📸 Incident Photo
            </ThemedText>
            <View style={styles.photoContainer}>
              <Image source={{ uri: incident.photoUrl }} style={styles.photo} />
            </View>
          </ThemedView>
        )}

        {/* Location Information */}
        <ThemedView style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: colors.primary }]}>
            📍 Location Details
          </ThemedText>
          
          {/* Full Address */}
          {incident.location.fullAddress && (
            <View style={styles.infoRow}>
              <ThemedText style={[styles.infoLabel, { color: colors.text }]}>Full Address:</ThemedText>
              <ThemedText style={[styles.infoValue, { color: colors.text }]}>
                {incident.location.fullAddress}
              </ThemedText>
            </View>
          )}

          {/* City, State, Country */}
          {incident.location.city && (
            <View style={styles.infoRow}>
              <ThemedText style={[styles.infoLabel, { color: colors.text }]}>City:</ThemedText>
              <ThemedText style={[styles.infoValue, { color: colors.text }]}>
                {incident.location.city}
              </ThemedText>
            </View>
          )}
          
          {incident.location.state && (
            <View style={styles.infoRow}>
              <ThemedText style={[styles.infoLabel, { color: colors.text }]}>State:</ThemedText>
              <ThemedText style={[styles.infoValue, { color: colors.text }]}>
                {incident.location.state}
              </ThemedText>
            </View>
          )}
          
          {incident.location.country && (
            <View style={styles.infoRow}>
              <ThemedText style={[styles.infoLabel, { color: colors.text }]}>Country:</ThemedText>
              <ThemedText style={[styles.infoValue, { color: colors.text }]}>
                {incident.location.country}
              </ThemedText>
            </View>
          )}

          {/* Coordinates */}
          <View style={styles.infoRow}>
            <ThemedText style={[styles.infoLabel, { color: colors.text }]}>Coordinates:</ThemedText>
            <ThemedText style={[styles.coordinatesValue, { color: colors.text }]}>
              {formatCoordinates(incident.location.latitude, incident.location.longitude)}
            </ThemedText>
          </View>
        </ThemedView>
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    flex: 2,
    textAlign: 'right',
  },
  aiValidationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  aiValidationValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  aiDescription: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
  },
  photoContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: 250,
    borderRadius: 12,
  },
  coordinatesValue: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'monospace',
    flex: 2,
    textAlign: 'right',
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
