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
import { submitIncidentReport } from '@/services/firebaseService';
import { LocationInfo } from '@/services/locationService';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface PhotoData {
  uri: string;
  description: string;
  latitude: number;
  longitude: number;
  locationInfo: any;
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
      console.log('📍 LOCATION INFO UPDATED:', info);
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

  const clearPhotoData = useCallback(() => {
    setPhotoData(null);
    setPhotoUri('');
    setLocation(null);
    setLocationInfo(null);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!user) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    // Enhanced validation with detailed error messages
    if (!photoData) {
      Alert.alert('Error', 'Please capture a photo first');
      return;
    }

    if (!photoData.uri) {
      Alert.alert('Error', 'Photo URI is missing');
      return;
    }

    if (!photoData.latitude || !photoData.longitude) {
      Alert.alert('Error', 'GPS location is required. Please ensure location permissions are granted and try again.');
      return;
    }

    // Check if description exists (either from photo data or additional notes)
    const hasDescription = photoData.description?.trim() || description?.trim();
    if (!hasDescription) {
      Alert.alert('Error', 'Please provide a description for the incident');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress('Preparing to submit report...');

    try {
      console.log('🚀 SUBMITTING INCIDENT REPORT...');
      console.log('📸 Photo Data:', photoData);
      console.log('📍 Location Info:', locationInfo);
      console.log('📝 Description:', photoData.description);
      console.log('📝 Additional Notes:', description);

      const locationData = {
        latitude: photoData.latitude,
        longitude: photoData.longitude,
        address: photoData.locationInfo?.fullAddress || locationInfo?.fullAddress || '',
        city: photoData.locationInfo?.city || locationInfo?.city || '',
        state: photoData.locationInfo?.state || locationInfo?.state || '',
        country: photoData.locationInfo?.country || locationInfo?.country || '',
        fullAddress: photoData.locationInfo?.fullAddress || locationInfo?.fullAddress || '',
      };

      // Combine descriptions
      const fullDescription = [
        photoData.description?.trim(),
        description?.trim()
      ].filter(Boolean).join('\n\n');

      console.log('📝 Final Description:', fullDescription);

      setUploadProgress('Uploading photo and location data...');

      const incidentId = await submitIncidentReport(
        user.id,
        user.email,
        user.name,
        photoData.uri,
        locationData,
        fullDescription
      );

      console.log('✅ INCIDENT REPORT SUBMITTED SUCCESSFULLY');
      console.log('📋 Incident ID:', incidentId);

      setUploadProgress('Report submitted successfully!');

      Alert.alert(
        'Success! 🎉',
        'Your incident report has been submitted successfully. Thank you for helping protect mangrove ecosystems!',
        [
          {
            text: 'Continue',
            onPress: () => {
              clearPhotoData();
              router.back();
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('❌ SUBMISSION ERROR:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to submit report. Please try again.';
      
      if (error.message.includes('permission')) {
        errorMessage = 'Permission denied. Please check your internet connection and try again.';
      } else if (error.message.includes('network')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.message.includes('storage')) {
        errorMessage = 'Photo upload failed. Please try again with a smaller image.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [user, photoData, locationInfo, description, clearPhotoData]);

  // Enhanced validation logic
  const canSubmit = useMemo(() => {
    const hasPhoto = photoData && photoData.uri;
    const hasLocation = photoData && photoData.latitude && photoData.longitude;
    const hasDescription = (photoData?.description?.trim() || description?.trim());
    const notSubmitting = !isSubmitting;
    
    const canSubmitResult = hasPhoto && hasLocation && hasDescription && notSubmitting;
    
    // Debug logging
    console.log('🔍 SUBMIT VALIDATION:', {
      hasPhoto,
      hasLocation,
      hasDescription,
      notSubmitting,
      canSubmit: canSubmitResult,
      photoData: photoData ? {
        uri: !!photoData.uri,
        latitude: photoData.latitude,
        longitude: photoData.longitude,
        description: photoData.description?.trim()
      } : null,
      description: description?.trim()
    });
    
    return canSubmitResult;
  }, [photoData, description, isSubmitting]);

  // Enhanced GPS Location Display Component
  const renderGPSLocationDisplay = () => {
    if (!photoData || !photoData.latitude || !photoData.longitude) {
      return null;
    }

    return (
      <View style={styles.enhancedLocationContainer}>
        <LinearGradient
          colors={['#4CAF50', '#45a049']}
          style={styles.locationHeader}
        >
          <View style={styles.locationHeaderContent}>
            <Ionicons name="location" size={24} color="#fff" />
            <Text style={styles.locationHeaderText}>GPS Location Captured</Text>
            <View style={styles.locationStatusBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#fff" />
              <Text style={styles.locationStatusText}>Active</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.locationContent}>
          {/* Coordinates Section */}
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
                  {photoData.latitude.toFixed(6)}°
                </Text>
              </View>
              <View style={styles.coordinateItem}>
                <Text style={[styles.coordinateLabel, { color: colors.secondary }]}>
                  Longitude
                </Text>
                <Text style={[styles.coordinateValue, { color: colors.text }]}>
                  {photoData.longitude.toFixed(6)}°
                </Text>
              </View>
            </View>
          </View>

          {/* Address Section */}
          {photoData.locationInfo?.fullAddress && (
            <View style={styles.addressSection}>
              <Text style={[styles.sectionTitle, { color: colors.primary }]}>
                🏠 Address
              </Text>
              <View style={styles.addressContainer}>
                <Text style={[styles.addressText, { color: colors.text }]}>
                  {photoData.locationInfo.fullAddress}
                </Text>
              </View>
            </View>
          )}

          {/* Location Details Section */}
          {photoData.locationInfo && (
            <View style={styles.detailsSection}>
              <Text style={[styles.sectionTitle, { color: colors.primary }]}>
                📋 Location Details
              </Text>
              <View style={styles.detailsGrid}>
                {photoData.locationInfo.city && (
                  <View style={styles.detailItem}>
                    <Ionicons name="business" size={16} color={colors.secondary} />
                    <Text style={[styles.detailLabel, { color: colors.secondary }]}>City</Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>
                      {photoData.locationInfo.city}
                    </Text>
                  </View>
                )}
                {photoData.locationInfo.state && (
                  <View style={styles.detailItem}>
                    <Ionicons name="map" size={16} color={colors.secondary} />
                    <Text style={[styles.detailLabel, { color: colors.secondary }]}>State</Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>
                      {photoData.locationInfo.state}
                    </Text>
                  </View>
                )}
                {photoData.locationInfo.country && (
                  <View style={styles.detailItem}>
                    <Ionicons name="flag" size={16} color={colors.secondary} />
                    <Text style={[styles.detailLabel, { color: colors.secondary }]}>Country</Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>
                      {photoData.locationInfo.country}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Accuracy Indicator */}
          <View style={styles.accuracySection}>
            <View style={styles.accuracyIndicator}>
              <Ionicons name="cellular" size={16} color="#4CAF50" />
              <Text style={[styles.accuracyText, { color: colors.secondary }]}>
                GPS Accuracy: High
              </Text>
            </View>
            <Text style={[styles.accuracyNote, { color: colors.icon }]}>
              Location captured automatically with photo
            </Text>
          </View>
        </View>
      </View>
    );
  };

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
              <Ionicons name="arrow-back" size={20} color="#2E8B57" />
              <Text style={styles.backButtonText}>Back</Text>
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
            {/* Photo Capture */}
            <PhotoCapture 
              onPhotoSelected={handlePhotoSelected}
              onPhotoData={handlePhotoData}
            />
            
            {/* Enhanced GPS Location Display */}
            {renderGPSLocationDisplay()}
            
            {/* Additional Location Capture (Optional) */}
            <LocationCapture 
              onLocationCaptured={handleLocationCaptured}
              onLocationInfo={handleLocationInfo}
            />
            
            {/* Clear Photo Data Button */}
            {photoData && (
              <TouchableOpacity 
                style={styles.clearButton} 
                onPress={clearPhotoData}
              >
                <Ionicons name="trash-outline" size={18} color="#DC143C" />
                <Text style={styles.clearButtonText}>Clear Photo Data</Text>
              </TouchableOpacity>
            )}
            
            {/* Status Indicator */}
            <View style={styles.statusContainer}>
              <Text style={[styles.statusTitle, { color: colors.primary }]}>
                📋 Report Status
              </Text>
              <View style={styles.statusItems}>
                <View style={styles.statusItem}>
                  <Ionicons 
                    name={photoData?.uri ? "checkmark-circle" : "ellipse-outline"} 
                    size={20} 
                    color={photoData?.uri ? "#4CAF50" : colors.icon} 
                  />
                  <Text style={[styles.statusText, { color: colors.text }]}>
                    Photo captured
                  </Text>
                </View>
                <View style={styles.statusItem}>
                  <Ionicons 
                    name={photoData?.latitude && photoData?.longitude ? "checkmark-circle" : "ellipse-outline"} 
                    size={20} 
                    color={photoData?.latitude && photoData?.longitude ? "#4CAF50" : colors.icon} 
                  />
                  <Text style={[styles.statusText, { color: colors.text }]}>
                    GPS location captured
                  </Text>
                </View>
                <View style={styles.statusItem}>
                  <Ionicons 
                    name={(photoData?.description?.trim() || description?.trim()) ? "checkmark-circle" : "ellipse-outline"} 
                    size={20} 
                    color={(photoData?.description?.trim() || description?.trim()) ? "#4CAF50" : colors.icon} 
                  />
                  <Text style={[styles.statusText, { color: colors.text }]}>
                    Description provided
                  </Text>
                </View>
              </View>
              {canSubmit && (
                <View style={styles.readyIndicator}>
                  <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                  <Text style={[styles.readyText, { color: "#4CAF50" }]}>
                    Ready to submit!
                  </Text>
                </View>
              )}
            </View>

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

            {/* Required Description Field */}
            <View style={styles.requiredDescriptionContainer}>
              <Text style={[styles.requiredLabel, { color: colors.primary }]}>
                📝 Incident Description *
              </Text>
              <TextInput
                style={[styles.requiredDescriptionInput, { 
                  color: colors.text, 
                  borderColor: colors.border || '#e0e0e0',
                  backgroundColor: colors.background 
                }]}
                placeholder="Describe the incident you observed (required)..."
                placeholderTextColor={colors.text + '80'}
                value={photoData?.description || ''}
                onChangeText={(text) => {
                  // Update the photo data description
                  if (photoData) {
                    const updatedPhotoData = {
                      ...photoData,
                      description: text
                    };
                    setPhotoData(updatedPhotoData);
                  }
                }}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              <Text style={[styles.requiredNote, { color: colors.secondary }]}>
                * This field is required to submit the report
              </Text>
            </View>

            {/* Debug Information (Development Only) */}
            {__DEV__ && (
              <View style={styles.debugContainer}>
                <Text style={[styles.debugTitle, { color: colors.primary }]}>
                  🔍 Debug Info (Development)
                </Text>
                <Text style={[styles.debugText, { color: colors.text }]}>
                  Photo URI: {photoData?.uri ? '✅' : '❌'}
                </Text>
                <Text style={[styles.debugText, { color: colors.text }]}>
                  Latitude: {photoData?.latitude ? `✅ ${photoData.latitude.toFixed(6)}` : '❌'}
                </Text>
                <Text style={[styles.debugText, { color: colors.text }]}>
                  Longitude: {photoData?.longitude ? `✅ ${photoData.longitude.toFixed(6)}` : '❌'}
                </Text>
                <Text style={[styles.debugText, { color: colors.text }]}>
                  Photo Description: {photoData?.description?.trim() ? '✅' : '❌'}
                </Text>
                <Text style={[styles.debugText, { color: colors.text }]}>
                  Additional Notes: {description?.trim() ? '✅' : '❌'}
                </Text>
                <Text style={[styles.debugText, { color: colors.text }]}>
                  Can Submit: {canSubmit ? '✅' : '❌'}
                </Text>
                <Text style={[styles.debugText, { color: colors.text }]}>
                  Is Submitting: {isSubmitting ? '✅' : '❌'}
                </Text>
              </View>
            )}

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
    left: 0,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    zIndex: 1,
  },
  backButtonText: {
    color: '#2E8B57',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
  },
  logoutButton: {
    position: 'absolute',
    top: 0,
    right: 0,
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
  enhancedLocationContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
    overflow: 'hidden',
  },
  locationHeader: {
    padding: 16,
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
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  locationStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fff',
  },
  locationStatusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  locationContent: {
    padding: 16,
  },
  coordinatesSection: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  coordinatesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  coordinateItem: {
    alignItems: 'center',
  },
  coordinateLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  coordinateValue: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  addressSection: {
    marginBottom: 15,
  },
  addressContainer: {
    backgroundColor: '#e9ecef',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  addressText: {
    fontSize: 14,
    fontStyle: 'italic',
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
    marginBottom: 8,
    width: '48%', // Two columns
  },
  detailLabel: {
    fontSize: 12,
    marginLeft: 8,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 5,
  },
  accuracySection: {
    alignItems: 'center',
  },
  accuracyIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#4CAF50',
    marginBottom: 8,
  },
  accuracyText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 5,
  },
  accuracyNote: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.7,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(220, 20, 60, 0.1)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DC143C',
    marginBottom: 20,
  },
  clearButtonText: {
    color: '#DC143C',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
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
  debugContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  debugTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  debugText: {
    fontSize: 14,
    marginBottom: 4,
  },
  requiredDescriptionContainer: {
    marginTop: 20,
    marginBottom: 15,
  },
  requiredLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  requiredDescriptionInput: {
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    minHeight: 100,
  },
  requiredNote: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5,
  },
  statusContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
    padding: 16,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  statusItems: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  statusItem: {
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    marginTop: 5,
  },
  readyIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  readyText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
}); 