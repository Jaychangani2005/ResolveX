import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { getIncidents } from '@/services/firebaseService';
import { IncidentReport } from '@/types/user';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function IncidentDetailsScreen() {
  const [incident, setIncident] = useState<IncidentReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();

  useEffect(() => {
    const loadIncident = async () => {
      try {
        setIsLoading(true);
        const allIncidents = await getIncidents(1000);
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

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.centerContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading incident details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!incident) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.centerContainer}>
          <Text style={[styles.errorText, { color: colors.text }]}>Incident Not Found</Text>
          <Text style={[styles.errorSubtext, { color: colors.textSecondary || colors.text }]}>
            The requested incident report could not be found.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>


      <ScrollView style={styles.scrollView}>
        {/* Basic Incident Information */}
        <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            📋 Incident Information
          </Text>
          
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary || colors.text }]}>Report ID:</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{incident.id}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary || colors.text }]}>Reported By:</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{incident.userName || 'Anonymous'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary || colors.text }]}>Email:</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{incident.userEmail}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary || colors.text }]}>Date Reported:</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {new Date(incident.createdAt).toLocaleDateString()}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary || colors.text }]}>AI Validation:</Text>
            <View style={styles.aiValidationContainer}>
              <Ionicons 
                name={incident.aiValidated ? "checkmark-circle" : "time-outline"} 
                size={16} 
                color={incident.aiValidated ? "#32CD32" : "#FFA500"} 
              />
              <Text style={[styles.aiValidationText, { color: incident.aiValidated ? "#32CD32" : "#FFA500" }]}>
                {incident.aiValidated ? 'Validated' : 'Pending Validation'}
              </Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            📝 Description
          </Text>
          <Text style={[styles.descriptionText, { color: colors.text }]}>
            {incident.description}
          </Text>
        </View>

        {/* Location */}
        <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            📍 Location
          </Text>
          <Text style={[styles.locationText, { color: colors.text }]}>
            {incident.location?.city || 'Unknown city'}, {incident.location?.state || 'Unknown state'}
          </Text>
          <Text style={[styles.locationText, { color: colors.textSecondary || colors.text }]}>
            {incident.location?.country || 'Unknown country'}
          </Text>
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
  infoCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
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
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  aiValidationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiValidationText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
  },
  locationText: {
    fontSize: 14,
    marginBottom: 4,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
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
