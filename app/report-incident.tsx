import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ActionButton } from '@/components/ActionButton';
import { PhotoCapture } from '@/components/PhotoCapture';
import { LocationCapture } from '@/components/LocationCapture';
import { FormInput } from '@/components/FormInput';
import { MangroveDetectionDemo } from '@/components/MangroveDetectionDemo';
import { submitIncidentReport } from '@/services/firebaseService';
import { LocationInfo } from '@/services/locationService';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { MangroveDetectionResult } from '@/services/mangroveDetectionService';

interface PhotoData {
  uri: string;
  description: string;
  latitude: number;
  longitude: number;
  locationInfo: any;
  mangroveResult?: MangroveDetectionResult;
}

export default function ReportIncidentScreen() {
  const [description, setDescription] = useState('');
  const [photoUri, setPhotoUri] = useState('');
  const [photoData, setPhotoData] = useState<PhotoData | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationInfo, setLocationInfo] = useState<LocationInfo | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user, logout } = useAuth();

  // Memoized handlers to prevent unnecessary re-renders
  const handlePhotoSelected = useCallback((uri: string) => {
    setPhotoUri(uri);
  }, []);

  const handlePhotoData = useCallback((data: PhotoData) => {
    setPhotoData(data);
    setPhotoUri(data.uri);
    
    // Print photo data to terminal/console
    console.log('📸 PHOTO DATA UPDATED:');
    console.log(`   Photo URI: ${data.uri}`);
    console.log(`   Description: ${data.description}`);
    console.log(`   Latitude: ${data.latitude}`);
    console.log(`   Longitude: ${data.longitude}`);
    console.log(`   Location Info:`, data.locationInfo);
    
    // Log mangrove detection result if available
    if (data.mangroveResult) {
      console.log('🌿 MANGROVE DETECTION DATA:');
      console.log(`   Is in mangrove area: ${data.mangroveResult.isInMangroveArea}`);
      if (data.mangroveResult.isInMangroveArea) {
        console.log(`   Region: ${data.mangroveResult.regionName}`);
        console.log(`   Confidence: ${data.mangroveResult.confidence}`);
      } else {
        console.log(`   Nearest mangrove: ${data.mangroveResult.regionName}`);
        console.log(`   Distance: ${data.mangroveResult.distanceToNearestMangrove?.toFixed(2)} km`);
      }
    }
    
    // Store coordinates in separate variables
    const photoLatitude = data.latitude;
    const photoLongitude = data.longitude;
    
    console.log('📸 STORED PHOTO COORDINATE VARIABLES:');
    console.log(`   photoLatitude: ${photoLatitude}`);
    console.log(`   photoLongitude: ${photoLongitude}`);
  }, []);

  const handleLocationCaptured = useCallback((loc: { latitude: number; longitude: number } | null) => {
    setLocation(loc);
    
    if (loc) {
      console.log('📍 LOCATION CAPTURED IN REPORT:');
      console.log(`   Latitude: ${loc.latitude}`);
      console.log(`   Longitude: ${loc.longitude}`);
    }
  }, []);

  const handleLocationInfo = useCallback((info: LocationInfo | null) => {
    setLocationInfo(info);
    
    if (info) {
      console.log('📍 LOCATION INFO UPDATED:');
      console.log(`   Full Address: ${info.fullAddress}`);
      console.log(`   City: ${info.city}`);
      console.log(`   State: ${info.state}`);
      console.log(`   Country: ${info.country}`);
    }
  }, []);

  const handleLogout = useCallback(() => {
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
  }, [logout]);

  const handleSubmit = useCallback(async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to submit reports.');
      return;
    }

    if (!photoUri || !photoData) {
      Alert.alert('Photo Required', 'Please take or upload a photo with description to continue.');
      return;
    }

    if (!photoData.latitude || !photoData.longitude) {
      Alert.alert('Location Required', 'Please ensure GPS location is captured with the photo.');
      return;
    }

    if (!photoData.description.trim()) {
      Alert.alert('Description Required', 'Please enter a description of the incident.');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress('Creating incident report...');

    try {
      // Prepare enhanced location data combining photo location and additional location info
      const enhancedLocation = {
        latitude: photoData.latitude,
        longitude: photoData.longitude,
        ...(photoData.locationInfo && {
          address: photoData.locationInfo.street,
          city: photoData.locationInfo.city,
          state: photoData.locationInfo.state,
          country: photoData.locationInfo.country,
          fullAddress: photoData.locationInfo.fullAddress,
        }),
        ...(locationInfo && {
          // Override with more detailed location info if available
          address: locationInfo.address,
          city: locationInfo.city,
          state: locationInfo.state,
          country: locationInfo.country,
          fullAddress: locationInfo.fullAddress,
        }),
      };

      // Print final location data to terminal
      console.log('📍 FINAL LOCATION DATA FOR FIRESTORE:');
      console.log(`   Latitude: ${enhancedLocation.latitude}`);
      console.log(`   Longitude: ${enhancedLocation.longitude}`);
      console.log(`   Full Address: ${enhancedLocation.fullAddress}`);
      console.log(`   City: ${enhancedLocation.city}`);
      console.log(`   State: ${enhancedLocation.state}`);
      console.log(`   Country: ${enhancedLocation.country}`);

      setUploadProgress('Uploading photo to cloud storage...');
      
      // Submit to Firebase with enhanced location data
      const reportId = await submitIncidentReport(
        user.id,
        user.email,
        user.name,
        photoUri,
        enhancedLocation,
        photoData.description.trim()
      );
      
      setUploadProgress('Finalizing report...');
      
      console.log('✅ INCIDENT REPORT SUBMITTED TO FIRESTORE:');
      console.log(`   Report ID: ${reportId}`);
      console.log(`   User ID: ${user.id}`);
      console.log(`   Photo Description: ${photoData.description}`);
      console.log(`   Location: ${enhancedLocation.latitude}, ${enhancedLocation.longitude}`);

      // Show location details in success message
      const locationDetails = enhancedLocation.fullAddress 
        ? `\n\n📍 Location: ${enhancedLocation.fullAddress}`
        : `\n\n📍 Coordinates: ${enhancedLocation.latitude.toFixed(6)}, ${enhancedLocation.longitude.toFixed(6)}`;
      
      Alert.alert(
        'Success!',
        `Your incident report has been submitted successfully. You earned 10 points! Thank you for helping protect our mangrove ecosystems!${locationDetails}`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form and go back to home
              setDescription('');
              setPhotoUri('');
              setPhotoData(null);
              setLocation(null);
              setLocationInfo(null);
              setUploadProgress('');
              router.back();
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('❌ SUBMISSION ERROR:', error);
      Alert.alert('Error', error.message || 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [user, photoUri, photoData, locationInfo]);

  // Memoized validation to prevent unnecessary re-renders
  const canSubmit = useMemo(() => {
    return photoUri && photoData && photoData.latitude && photoData.longitude && photoData.description.trim() && !isSubmitting;
  }, [photoUri, photoData, isSubmitting]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => router.back()}
            >
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            
            {/* Logout Button - Top Right */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color="#DC143C" />
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
            
            <Text style={[styles.title, { color: colors.primary }]}>
              📸 Report Incident
            </Text>
            <Text style={[styles.subtitle, { color: colors.text }]}>
              Help us monitor and protect mangrove ecosystems
            </Text>
          </View>

          <View style={styles.form}>
            {/* Mangrove Detection Demo */}
            <MangroveDetectionDemo />
            
            <PhotoCapture 
              onPhotoSelected={handlePhotoSelected}
              onPhotoData={handlePhotoData}
            />
            
            {/* Additional Location Capture (Optional) */}
            <LocationCapture 
              onLocationCaptured={handleLocationCaptured}
              onLocationInfo={handleLocationInfo}
            />
            
            {/* Additional Description Field (Optional) */}
            <FormInput
              label="Additional Notes (Optional)"
              placeholder="Add any additional observations or context..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              style={{ minHeight: 80 }}
            />

            <View style={styles.submitContainer}>
              {uploadProgress ? (
                <View style={styles.progressContainer}>
                  <Text style={[styles.progressText, { color: colors.primary }]}>
                    {uploadProgress}
                  </Text>
                </View>
              ) : null}
              
              <ActionButton
                title={isSubmitting ? "Submitting..." : "Submit Report"}
                onPress={handleSubmit}
                variant="primary"
                style={{
                  ...styles.submitButton,
                  opacity: canSubmit ? 1 : 0.6
                }}
                disabled={!canSubmit}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 0,
    left: 20,
    padding: 10,
    zIndex: 1,
  },
  backButtonText: {
    color: '#2E8B57',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    position: 'absolute',
    top: 0,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(220, 20, 60, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DC143C',
    zIndex: 1,
  },
  logoutButtonText: {
    color: '#DC143C',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.8,
  },
  form: {
    flex: 1,
  },
  submitContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
  submitButton: {
    minWidth: 200,
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
}); 