import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { getAllIncidentsForNGO } from '@/services/firebaseService';
import { IncidentReport } from '@/types/user';
import { formatCoordinates } from '@/services/locationService';
import { IncidentReport } from '@/types/user';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ReportDetailsScreen() {
  const [incident, setIncident] = useState<IncidentReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
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
    if (user && user.role !== 'conservation_ngos') {
      Alert.alert('Access Denied', 'You do not have permission to access this area.');
      router.replace('/(tabs)');
    }
  }, [user]);

  if (!user || user.role !== 'conservation_ngos') {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={isDarkMode ? ['#0f0f23', '#1a1a2e', '#16213e'] : ['#f8f9fa', '#e9ecef', '#dee2e6']}
          style={styles.gradientBackground}
        >
          <View style={styles.centerContainer}>
            <Text style={[styles.errorText, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>Access Denied</Text>
            <Text style={[styles.errorSubtext, { color: isDarkMode ? '#ccc' : '#666' }]}>You do not have permission to access this area.</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={isDarkMode ? ['#0f0f23', '#1a1a2e', '#16213e'] : ['#f8f9fa', '#e9ecef', '#dee2e6']}
          style={styles.gradientBackground}
        >
          <View style={styles.centerContainer}>
            <Text style={[styles.loadingText, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>
              Loading incident details...
            </Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (!incident) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={isDarkMode ? ['#0f0f23', '#1a1a2e', '#16213e'] : ['#f8f9fa', '#e9ecef', '#dee2e6']}
          style={styles.gradientBackground}
        >
          <View style={styles.centerContainer}>
            <Text style={[styles.errorText, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>Incident Not Found</Text>
            <Text style={[styles.errorSubtext, { color: isDarkMode ? '#ccc' : '#666' }]}>The requested incident report could not be found.</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={isDarkMode ? ['#0f0f23', '#1a1a2e', '#16213e'] : ['#f8f9fa', '#e9ecef', '#dee2e6']}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => router.back()}
            >
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            
            <View style={styles.headerContent}>
              <Text style={[styles.title, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>
                📋 Incident Report Details
              </Text>
              <Text style={[styles.subtitle, { color: isDarkMode ? '#ccc' : '#666' }]}>
                Report ID: {incident.id}
              </Text>
            </View>
          </View>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* User Information */}
          <View style={[styles.section, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.95)' }]}>
            <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>
              👤 Reporter Information
            </Text>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: isDarkMode ? '#ccc' : '#666' }]}>Name:</Text>
              <Text style={[styles.infoValue, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>
                {incident.userName}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: isDarkMode ? '#ccc' : '#666' }]}>Email:</Text>
              <Text style={[styles.infoValue, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>
                {incident.userEmail}
              </Text>
            </View>
          </View>

          {/* AI Validation */}
          {incident.aiValidated !== undefined && (
            <View style={[styles.section, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.95)' }]}>
              <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>
                🤖 AI Validation
              </Text>
              <View style={styles.aiValidationRow}>
                <Text style={[styles.infoLabel, { color: isDarkMode ? '#ccc' : '#666' }]}>AI Status:</Text>
                <Text style={[
                  styles.aiValidationValue, 
                  { color: incident.aiValidated ? '#28a745' : '#dc3545' }
                ]}>
                  {incident.aiValidated ? '✅ Validated' : '❌ Not Validated'}
                </Text>
              </View>
              <Text style={[styles.aiDescription, { color: isDarkMode ? '#ccc' : '#666' }]}>
                {incident.aiValidated 
                  ? 'This image has been validated by our AI system as containing relevant environmental incident content.'
                  : 'This image has not been validated by our AI system or was flagged as potentially irrelevant.'
                }
              </Text>
            </View>
          )}

          {/* Description */}
          <View style={[styles.section, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.95)' }]}>
            <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>
              📝 Description
            </Text>
            <Text style={[styles.descriptionText, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>
              {incident.description}
            </Text>
          </View>

          {/* Photo */}
          {incident.photoUrl && (
            <View style={[styles.section, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.95)' }]}>
              <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>
                📸 Incident Photo
              </Text>
              <View style={styles.photoContainer}>
                <Image source={{ uri: incident.photoUrl }} style={styles.photo} />
              </View>
            </View>
          )}

          {/* Location Information */}
          <View style={[styles.section, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.95)' }]}>
            <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>
              📍 Location Details
            </Text>
            
            {/* Full Address */}
            {incident.location.fullAddress && (
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: isDarkMode ? '#ccc' : '#666' }]}>Full Address:</Text>
                <Text style={[styles.infoValue, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>
                  {incident.location.fullAddress}
                </Text>
              </View>
            )}

            {/* City, State, Country */}
            {incident.location.city && (
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: isDarkMode ? '#ccc' : '#666' }]}>City:</Text>
                <Text style={[styles.infoValue, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>
                  {incident.location.city}
                </Text>
              </View>
            )}
            
            {incident.location.state && (
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: isDarkMode ? '#ccc' : '#666' }]}>State:</Text>
                <Text style={[styles.infoValue, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>
                  {incident.location.state}
                </Text>
              </View>
            )}
            
            {incident.location.country && (
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: isDarkMode ? '#ccc' : '#666' }]}>Country:</Text>
                <Text style={[styles.infoValue, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>
                  {incident.location.country}
                </Text>
              </View>
            )}

            {/* Coordinates */}
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: isDarkMode ? '#ccc' : '#666' }]}>Coordinates:</Text>
              <Text style={[styles.coordinatesValue, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>
                {formatCoordinates(incident.location.latitude, incident.location.longitude)}
              </Text>
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
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    position: 'relative',
  },
  backButton: {
    padding: 10,
    marginRight: 16,
    marginTop: 4,
  },
  backButtonText: {
    color: '#2E8B57',
    fontSize: 16,
    fontWeight: '600',
  },
  headerContent: {
    flex: 1,
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
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
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
