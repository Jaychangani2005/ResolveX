import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { IncidentReport } from '@/types/user';
import { formatCoordinates } from '@/services/locationService';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

interface IncidentReportCardProps {
  incident: IncidentReport;
  showUserInfo?: boolean;
}

export function IncidentReportCard({ incident, showUserInfo = false }: IncidentReportCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user } = useAuth();

  const handleCardPress = () => {
    if (user?.role === 'conservation_ngos') {
      router.push(`/(ngo)/report-details/${incident.id}`);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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

  const CardContainer = user?.role === 'conservation_ngos' ? TouchableOpacity : View;
  const cardProps = user?.role === 'conservation_ngos' ? { onPress: handleCardPress, activeOpacity: 0.7 } : {};

  return (
    <CardContainer style={styles.container} {...cardProps}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.statusContainer}>
          <Text style={[styles.statusText, { color: getStatusColor(incident.status) }]}>
            {getStatusEmoji(incident.status)} {incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
          </Text>
        </View>
        <Text style={[styles.dateText, { color: colors.icon }]}>
          {formatDate(incident.createdAt)}
        </Text>
      </View>

      {/* User Info (optional) */}
      {showUserInfo && (
        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: colors.primary }]}>
            {incident.userName}
          </Text>
          <Text style={[styles.userEmail, { color: colors.icon }]}>
            {incident.userEmail}
          </Text>
        </View>
      )}

      {/* Photo */}
      {incident.photoUrl && (
        <View style={styles.photoContainer}>
          <Image source={{ uri: incident.photoUrl }} style={styles.photo} />
        </View>
      )}

      {/* Description */}
      <View style={styles.descriptionContainer}>
        <Text style={[styles.descriptionLabel, { color: colors.text }]}>Description:</Text>
        <Text style={[styles.descriptionText, { color: colors.text }]}>
          {incident.description}
        </Text>
      </View>

      {/* AI Validation Status */}
      {incident.aiValidated !== undefined && (
        <View style={styles.aiValidationContainer}>
          <Text style={[styles.aiValidationLabel, { color: colors.primary }]}>
            🤖 AI Validation Status:
          </Text>
          <View style={styles.aiValidationRow}>
            <Text style={[
              styles.aiValidationText, 
              { color: incident.aiValidated ? '#28a745' : '#dc3545' }
            ]}>
              {incident.aiValidated ? '✅ Validated' : '❌ Not Validated'}
            </Text>
          </View>
        </View>
      )}

      {/* Location Information */}
      <View style={styles.locationContainer}>
        <Text style={[styles.locationLabel, { color: colors.primary }]}>📍 Location Details:</Text>
        
        {/* Full Address */}
        {incident.location.fullAddress && (
          <View style={styles.addressRow}>
            <Text style={[styles.addressLabel, { color: colors.secondary }]}>Address:</Text>
            <Text style={[styles.addressText, { color: colors.text }]}>
              {incident.location.fullAddress}
            </Text>
          </View>
        )}

        {/* City, State, Country */}
        {(incident.location.city || incident.location.state || incident.location.country) && (
          <View style={styles.locationDetails}>
            {incident.location.city && (
              <View style={styles.locationRow}>
                <Text style={[styles.locationLabel, { color: colors.secondary }]}>City:</Text>
                <Text style={[styles.locationValue, { color: colors.text }]}>
                  {incident.location.city}
                </Text>
              </View>
            )}
            {incident.location.state && (
              <View style={styles.locationRow}>
                <Text style={[styles.locationLabel, { color: colors.secondary }]}>State:</Text>
                <Text style={[styles.locationValue, { color: colors.text }]}>
                  {incident.location.state}
                </Text>
              </View>
            )}
            {incident.location.country && (
              <View style={styles.locationRow}>
                <Text style={[styles.locationLabel, { color: colors.secondary }]}>Country:</Text>
                <Text style={[styles.locationValue, { color: colors.text }]}>
                  {incident.location.country}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Coordinates */}
        <View style={styles.coordinatesRow}>
          <Text style={[styles.coordinatesLabel, { color: colors.secondary }]}>Coordinates:</Text>
          <Text style={[styles.coordinatesText, { color: colors.text }]}>
            {formatCoordinates(incident.location.latitude, incident.location.longitude)}
          </Text>
        </View>
      </View>
    </CardContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  dateText: {
    fontSize: 12,
    fontWeight: '500',
  },
  userInfo: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    fontWeight: '500',
  },
  photoContainer: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  descriptionContainer: {
    marginBottom: 20,
  },
  descriptionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
  },
  aiValidationContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    marginBottom: 16,
  },
  aiValidationLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  aiValidationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiValidationText: {
    fontSize: 16,
    fontWeight: '600',
  },
  locationContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  locationLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  addressRow: {
    marginBottom: 12,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22,
  },
  locationDetails: {
    marginBottom: 12,
  },
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  coordinatesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  coordinatesLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  coordinatesText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
}); 