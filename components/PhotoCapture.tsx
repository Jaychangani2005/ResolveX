import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert, TextInput, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { detectMangroveArea, getMangroveDetectionSummary, MangroveDetectionResult } from '@/services/mangroveDetectionService';

interface PhotoCaptureProps {
  onPhotoSelected: (uri: string) => void;
  onPhotoData?: (data: {
    uri: string;
    description: string;
    latitude: number;
    longitude: number;
    locationInfo: any;
    mangroveResult?: MangroveDetectionResult;
  }) => void;
  isUploading?: boolean;
}

export function PhotoCapture({ onPhotoSelected, onPhotoData, isUploading = false }: PhotoCaptureProps) {
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [description, setDescription] = useState<string>('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locationInfo, setLocationInfo] = useState<any>(null);
  const [mangroveResult, setMangroveResult] = useState<MangroveDetectionResult | undefined>(undefined);
  const [isCapturingLocation, setIsCapturingLocation] = useState<boolean>(false);
  const [pendingPhotoData, setPendingPhotoData] = useState<string | null>(null);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  // Watch for coordinate changes and call onPhotoData when available
  useEffect(() => {
    if (pendingPhotoData && latitude && longitude && onPhotoData) {
      console.log('✅ Coordinates now available, calling onPhotoData');
      onPhotoData({
        uri: pendingPhotoData,
        description,
        latitude,
        longitude,
        locationInfo,
        mangroveResult
      });
      setPendingPhotoData(null); // Clear pending data
    }
  }, [latitude, longitude, pendingPhotoData, onPhotoData, description, locationInfo, mangroveResult]);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera and photo library permissions to use this feature.');
      return false;
    }
    return true;
  };

  const captureLocation = async () => {
    try {
      setIsCapturingLocation(true);
      
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Location Permission', 'Please grant location permission to capture GPS coordinates.');
        return;
      }

      // Get current position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude: lat, longitude: lng } = location.coords;
      
      // Set coordinates
      setLatitude(lat);
      setLongitude(lng);
      
      // Get address from coordinates
      let locationData: any = null;
      try {
        const reverseGeocodeResult = await Location.reverseGeocodeAsync({
          latitude: lat,
          longitude: lng,
        });

        if (reverseGeocodeResult.length > 0) {
          const loc = reverseGeocodeResult[0];
          locationData = {
            street: loc.street || '',
            city: loc.city || loc.subregion || 'Unknown City',
            state: loc.region || '',
            country: loc.country || '',
            postalCode: loc.postalCode || '',
            fullAddress: `${loc.street || ''}${loc.city ? `, ${loc.city}` : ''}${loc.region ? `, ${loc.region}` : ''}${loc.country ? `, ${loc.country}` : ''}`.replace(/^,\s*/, '').replace(/,\s*$/, '')
          };
          setLocationInfo(locationData);
        }
      } catch (geocodeError) {
        console.warn('Geocoding failed, using coordinates only:', geocodeError);
      }
      
      // Print coordinates to terminal/console
      console.log('📍 PHOTO LOCATION CAPTURED:');
      console.log(`   Latitude: ${lat}`);
      console.log(`   Longitude: ${lng}`);
      console.log(`   Coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      
      if (locationInfo) {
        console.log(`   Address: ${locationInfo.fullAddress}`);
      }
      
      // Store coordinates in separate variables for easy access
      const currentLatitude = lat;
      const currentLongitude = lng;
      
      console.log('📍 STORED COORDINATE VARIABLES:');
      console.log(`   currentLatitude: ${currentLatitude}`);
      console.log(`   currentLongitude: ${currentLongitude}`);
      
      // Perform mangrove detection with captured coordinates
      const mangroveDetection = detectMangroveArea(lat, lng);
      setMangroveResult(mangroveDetection);
      
      console.log('🌿 MANGROVE DETECTION RESULT:');
      console.log(`   Is in mangrove area: ${mangroveDetection.isInMangroveArea}`);
      if (mangroveDetection.isInMangroveArea) {
        console.log(`   Region: ${mangroveDetection.regionName}`);
      } else {
        console.log(`   Nearest mangrove: ${mangroveDetection.regionName} (${mangroveDetection.distanceToNearestMangrove?.toFixed(2)} km away)`);
      }
      
      // Show mangrove detection result to user
      const mangroveSummary = getMangroveDetectionSummary(mangroveDetection);
      Alert.alert(
        'Location Captured!', 
        `GPS coordinates captured successfully!\nLatitude: ${lat.toFixed(6)}\nLongitude: ${lng.toFixed(6)}\n\n${mangroveSummary}`
      );
      
    } catch (error: any) {
      console.error('Location capture error:', error);
      Alert.alert('Location Error', error.message || 'Failed to capture location. Please try again.');
    } finally {
      setIsCapturingLocation(false);
    }
  };

  const takePhoto = async () => {
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) return;

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

              if (!result.canceled && result.assets[0]) {
          const uri = result.assets[0].uri;
          console.log('📸 Photo captured:', uri);
          setPhotoUri(uri);
          onPhotoSelected(uri);
          
          // Set pending photo data - useEffect will handle onPhotoData when coordinates are ready
          setPendingPhotoData(uri);
          
          // Auto-capture location when photo is taken
          console.log('📍 Starting location capture...');
          await captureLocation();
        }
    } catch (error) {
      console.error('❌ Error in takePhoto:', error);
      Alert.alert('Photo Error', 'Failed to take photo. Please try again.');
    }
  };

  const pickPhoto = async () => {
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

              if (!result.canceled && result.assets[0]) {
          const uri = result.assets[0].uri;
          console.log('📸 Photo selected:', uri);
          setPhotoUri(uri);
          onPhotoSelected(uri);
          
          // Set pending photo data - useEffect will handle onPhotoData when coordinates are ready
          setPendingPhotoData(uri);
          
          // Auto-capture location when photo is selected
          console.log('📍 Starting location capture...');
          await captureLocation();
        }
    } catch (error) {
      console.error('❌ Error in pickPhoto:', error);
      Alert.alert('Photo Error', 'Failed to select photo. Please try again.');
    }
  };

  const handleDescriptionChange = (text: string) => {
    setDescription(text);
    
    // Only update parent component if we have all required data
    if (onPhotoData && photoUri && latitude && longitude) {
      onPhotoData({
        uri: photoUri,
        description: text,
        latitude,
        longitude,
        locationInfo,
        mangroveResult
      });
    }
  };

  const clearPhoto = () => {
    setPhotoUri(null);
    setDescription('');
    setLatitude(null);
    setLongitude(null);
    setLocationInfo(null);
    setMangroveResult(undefined);
    setPendingPhotoData(null);
    onPhotoSelected('');
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>Photo & Description</Text>
      
      {photoUri ? (
        <ScrollView 
          style={styles.photoContainer}
          contentContainerStyle={styles.photoContentContainer}
        >
          <Image source={{ uri: photoUri }} style={styles.photo} />
          
          {/* Location Capture Section */}
          <View style={styles.locationSection}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>📍 GPS Location</Text>
            
            {latitude && longitude ? (
              <View style={styles.locationInfo}>
                <Text style={[styles.coordinateText, { color: colors.text }]}>
                  Latitude: {latitude.toFixed(6)}
                </Text>
                <Text style={[styles.coordinateText, { color: colors.text }]}>
                  Longitude: {longitude.toFixed(6)}
                </Text>
                {locationInfo && (
                  <Text style={[styles.addressText, { color: colors.text }]}>
                    Address: {locationInfo.fullAddress}
                  </Text>
                )}
                
                {/* Mangrove Detection Result */}
                {mangroveResult && (
                  <View style={styles.mangroveResultContainer}>
                    <Text style={[styles.mangroveResultTitle, { color: colors.primary }]}>
                      🌿 Mangrove Detection
                    </Text>
                    <Text style={[
                      styles.mangroveResultText, 
                      { 
                        color: mangroveResult.isInMangroveArea ? colors.primary : colors.error 
                      }
                    ]}>
                      {mangroveResult.isInMangroveArea 
                        ? `✅ Inside ${mangroveResult.regionName} mangrove area`
                        : `❌ Not in mangrove area\n   Nearest: ${mangroveResult.regionName} (${mangroveResult.distanceToNearestMangrove?.toFixed(1)} km away)`
                      }
                    </Text>
                  </View>
                )}
              </View>
            ) : (
              <TouchableOpacity 
                style={[
                  styles.captureLocationButton, 
                  { backgroundColor: colors.secondary },
                  { opacity: isCapturingLocation ? 0.7 : 1 }
                ]}
                onPress={captureLocation}
                disabled={isCapturingLocation}
              >
                <Text style={styles.captureLocationText}>
                  {isCapturingLocation ? '📍 Capturing...' : '📍 Capture GPS Location'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Description Section */}
          <View style={styles.descriptionSection}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>📝 Photo Description</Text>
            <TextInput
              style={[styles.descriptionInput, { 
                color: colors.text, 
                borderColor: colors.border || '#e0e0e0',
                backgroundColor: colors.background 
              }]}
              placeholder="Describe what you observed in this photo..."
              placeholderTextColor={colors.text + '80'}
              value={description}
              onChangeText={handleDescriptionChange}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity 
            style={[
              styles.changePhotoButton, 
              { backgroundColor: colors.error },
              { opacity: isUploading ? 0.6 : 1 }
            ]}
            onPress={clearPhoto}
            disabled={isUploading}
          >
            <Text style={styles.changePhotoText}>
              {isUploading ? 'Uploading...' : 'Clear Photo & Data'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.photoButton, { backgroundColor: colors.primary }]}
            onPress={takePhoto}
          >
            <Text style={styles.photoButtonText}>📷 Take Photo</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.photoButton, { backgroundColor: colors.secondary }]}
            onPress={pickPhoto}
          >
            <Text style={styles.photoButtonText}>📁 Upload Photo</Text>
          </TouchableOpacity>
        </View>
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  photoButton: {
    flex: 1,
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
  photoButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  photoContainer: {
    // Remove alignItems from here to fix ScrollView warning
  },
  photoContentContainer: {
    alignItems: 'center',
  },
  photo: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  locationSection: {
    width: '100%',
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  locationInfo: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  coordinateText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  addressText: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
    fontStyle: 'italic',
  },
  captureLocationButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  captureLocationText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  descriptionSection: {
    width: '100%',
    marginBottom: 16,
  },
  descriptionInput: {
    width: '100%',
    minHeight: 100,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  changePhotoButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 8,
  },
  changePhotoText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  mangroveResultContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f0f8f0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d4edda',
  },
  mangroveResultTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  mangroveResultText: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
}); 