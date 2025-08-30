import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { getCurrentLocationWithAddress, LocationInfo, formatCoordinates } from '@/services/locationService';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface LocationCaptureProps {
  onLocationCaptured: (location: { latitude: number; longitude: number } | null) => void;
  onLocationInfo?: (locationInfo: LocationInfo | null) => void;
}

export function LocationCapture({ onLocationCaptured, onLocationInfo }: LocationCaptureProps) {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationInfo, setLocationInfo] = useState<LocationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const captureLocation = async () => {
    setIsLoading(true);
    
    try {
      const locationInfo = await getCurrentLocationWithAddress();
      
      const newLocation = {
        latitude: locationInfo.coordinates.latitude,
        longitude: locationInfo.coordinates.longitude,
      };

      setLocation(newLocation);
      setLocationInfo(locationInfo);
      onLocationCaptured(newLocation);
      
      // Notify parent component about location info if callback provided
      if (onLocationInfo) {
        onLocationInfo(locationInfo);
      }
    } catch (error: any) {
      Alert.alert(
        'Location Error',
        error.message || 'Failed to capture location. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const clearLocation = () => {
    setLocation(null);
    setLocationInfo(null);
    onLocationCaptured(null);
    if (onLocationInfo) {
      onLocationInfo(null);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>Additional GPS Location (Optional)</Text>
      
      {location ? (
        <View style={styles.enhancedLocationContainer}>
          <LinearGradient
            colors={['#2196F3', '#1976D2']}
            style={styles.locationHeader}
          >
            <View style={styles.locationHeaderContent}>
              <Ionicons name="location" size={20} color="#fff" />
              <Text style={styles.locationHeaderText}>Additional Location</Text>
              <View style={styles.locationStatusBadge}>
                <Ionicons name="checkmark-circle" size={14} color="#fff" />
                <Text style={styles.locationStatusText}>Captured</Text>
              </View>
            </View>
          </LinearGradient>

          <View style={styles.locationContent}>
            {/* Address Display */}
            {locationInfo && (
              <View style={styles.addressSection}>
                <Text style={[styles.sectionTitle, { color: colors.primary }]}>
                  🏠 Address
                </Text>
                <View style={styles.addressContainer}>
                  <Text style={[styles.addressText, { color: colors.text }]}>
                    {locationInfo.fullAddress}
                  </Text>
                </View>
              </View>
            )}
            
            {/* Coordinates Display */}
            <View style={styles.coordinatesSection}>
              <Text style={[styles.sectionTitle, { color: colors.primary }]}>
                📍 Coordinates
              </Text>
              <View style={styles.coordinatesGrid}>
                <View style={styles.coordinateItem}>
                  <Text style={[styles.coordinateLabel, { color: colors.secondary }]}>
                    Latitude
                  </Text>
                  <Text style={[styles.coordinateValue, { color: colors.text }]}>
                    {location.latitude.toFixed(6)}°
                  </Text>
                </View>
                <View style={styles.coordinateItem}>
                  <Text style={[styles.coordinateLabel, { color: colors.secondary }]}>
                    Longitude
                  </Text>
                  <Text style={[styles.coordinateValue, { color: colors.text }]}>
                    {location.longitude.toFixed(6)}°
                  </Text>
                </View>
              </View>
            </View>
            
            {/* Location Details */}
            {locationInfo && (
              <View style={styles.detailsSection}>
                <Text style={[styles.sectionTitle, { color: colors.primary }]}>
                  📋 Details
                </Text>
                <View style={styles.detailsGrid}>
                  {locationInfo.city && (
                    <View style={styles.detailItem}>
                      <Ionicons name="business" size={14} color={colors.secondary} />
                      <Text style={[styles.detailLabel, { color: colors.secondary }]}>City</Text>
                      <Text style={[styles.detailValue, { color: colors.text }]}>
                        {locationInfo.city}
                      </Text>
                    </View>
                  )}
                  {locationInfo.state && (
                    <View style={styles.detailItem}>
                      <Ionicons name="map" size={14} color={colors.secondary} />
                      <Text style={[styles.detailLabel, { color: colors.secondary }]}>State</Text>
                      <Text style={[styles.detailValue, { color: colors.text }]}>
                        {locationInfo.state}
                      </Text>
                    </View>
                  )}
                  {locationInfo.country && (
                    <View style={styles.detailItem}>
                      <Ionicons name="flag" size={14} color={colors.secondary} />
                      <Text style={[styles.detailLabel, { color: colors.secondary }]}>Country</Text>
                      <Text style={[styles.detailValue, { color: colors.text }]}>
                        {locationInfo.country}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}
            
            <TouchableOpacity 
              style={[styles.clearButton, { backgroundColor: colors.error }]}
              onPress={clearLocation}
            >
              <Ionicons name="trash-outline" size={16} color="#fff" />
              <Text style={styles.clearButtonText}>Clear Location</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity 
          style={[
            styles.captureButton, 
            { 
              backgroundColor: colors.primary,
              opacity: isLoading ? 0.7 : 1 
            }
          ]}
          onPress={captureLocation}
          disabled={isLoading}
        >
          <LinearGradient
            colors={['#2196F3', '#1976D2']}
            style={styles.buttonGradient}
          >
            <Ionicons name="location" size={20} color="#fff" />
            <Text style={styles.captureButtonText}>
              {isLoading ? '📍 Capturing...' : '📍 Capture Additional Location'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  captureButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    gap: 10,
  },
  captureButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  enhancedLocationContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    overflow: 'hidden',
  },
  locationHeader: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  locationHeaderText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  locationStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fff',
  },
  locationStatusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  locationContent: {
    padding: 16,
  },
  addressSection: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  addressContainer: {
    backgroundColor: '#e9ecef',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  addressText: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  coordinatesSection: {
    marginBottom: 15,
  },
  coordinatesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  coordinateItem: {
    alignItems: 'center',
    flex: 1,
  },
  coordinateLabel: {
    fontSize: 11,
    marginBottom: 4,
  },
  coordinateValue: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  detailsSection: {
    marginBottom: 15,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    width: '48%',
  },
  detailLabel: {
    fontSize: 11,
    marginLeft: 6,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-end',
    gap: 6,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
}); 