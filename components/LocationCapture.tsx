import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { getCurrentLocationWithAddress, LocationInfo, formatCoordinates } from '@/services/locationService';

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
      <Text style={[styles.label, { color: colors.text }]}>GPS Location</Text>
      
             {location ? (
         <View style={styles.locationContainer}>
           {/* Address Display */}
           {locationInfo && (
             <View style={styles.addressContainer}>
               <Text style={[styles.addressLabel, { color: colors.primary }]}>📍 Location Address:</Text>
               <Text style={[styles.addressText, { color: colors.text }]}>
                 {locationInfo.fullAddress}
               </Text>
             </View>
           )}
           
           {/* Coordinates Display */}
           <View style={styles.coordinatesContainer}>
             <Text style={[styles.coordinateLabel, { color: colors.secondary }]}>Coordinates:</Text>
             <Text style={[styles.coordinateValue, { color: colors.text }]}>
               {formatCoordinates(location.latitude, location.longitude)}
             </Text>
           </View>
           
           {/* City and Country */}
           {locationInfo && (
             <View style={styles.locationDetails}>
               <View style={styles.locationDetail}>
                 <Text style={[styles.detailLabel, { color: colors.secondary }]}>City:</Text>
                 <Text style={[styles.detailValue, { color: colors.text }]}>
                   {locationInfo.city}
                 </Text>
               </View>
               {locationInfo.state && (
                 <View style={styles.locationDetail}>
                   <Text style={[styles.detailLabel, { color: colors.secondary }]}>State:</Text>
                   <Text style={[styles.detailValue, { color: colors.text }]}>
                     {locationInfo.state}
                   </Text>
                 </View>
               )}
               <View style={styles.locationDetail}>
                 <Text style={[styles.detailLabel, { color: colors.secondary }]}>Country:</Text>
                 <Text style={[styles.detailValue, { color: colors.text }]}>
                   {locationInfo.country}
                 </Text>
               </View>
             </View>
           )}
           
           <TouchableOpacity 
             style={[styles.clearButton, { backgroundColor: colors.error }]}
             onPress={clearLocation}
           >
             <Text style={styles.clearButtonText}>Clear Location</Text>
           </TouchableOpacity>
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
          <Text style={styles.captureButtonText}>
            {isLoading ? '📍 Capturing...' : '📍 Capture GPS Location'}
          </Text>
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
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  captureButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  locationContainer: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  addressContainer: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  addressText: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22,
  },
  coordinatesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  coordinateLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  coordinateValue: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  locationDetails: {
    marginBottom: 16,
  },
  locationDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  clearButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
}); 