import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
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

export default function ReportIncidentScreen() {
  const [description, setDescription] = useState('');
  const [photoUri, setPhotoUri] = useState('');
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationInfo, setLocationInfo] = useState<LocationInfo | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user } = useAuth();

  const handlePhotoSelected = (uri: string) => {
    setPhotoUri(uri);
  };

  const handleLocationCaptured = (loc: { latitude: number; longitude: number } | null) => {
    setLocation(loc);
  };

  const handleLocationInfo = (info: LocationInfo | null) => {
    setLocationInfo(info);
  };

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to submit reports.');
      return;
    }

    if (!photoUri) {
      Alert.alert('Photo Required', 'Please take or upload a photo to continue.');
      return;
    }

    if (!location) {
      Alert.alert('Location Required', 'Please capture GPS location to continue.');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Description Required', 'Please enter a description of the incident.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit to Firebase with enhanced location data
      const enhancedLocation = {
        ...location,
        ...(locationInfo && {
          address: locationInfo.address,
          city: locationInfo.city,
          state: locationInfo.state,
          country: locationInfo.country,
          fullAddress: locationInfo.fullAddress,
        }),
      };
      
      await submitIncidentReport(
        user.id,
        user.email,
        user.name,
        photoUri, // In a real app, you'd upload this to Firebase Storage first
        enhancedLocation,
        description.trim()
      );
      
      // Show location details in success message
      const locationDetails = locationInfo 
        ? `\n\n📍 Location: ${locationInfo.fullAddress}`
        : `\n\n📍 Coordinates: ${location?.latitude.toFixed(6)}, ${location?.longitude.toFixed(6)}`;
      
      Alert.alert(
        'Success!',
        `Your incident report has been submitted successfully. You earned 50 points! Thank you for helping protect our mangrove ecosystems!${locationDetails}`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form and go back to home
              setDescription('');
              setPhotoUri('');
              setLocation(null);
              setLocationInfo(null);
              router.back();
            }
          }
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = photoUri && location && description.trim() && !isSubmitting;

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
            
            <Text style={[styles.title, { color: colors.primary }]}>
              📸 Report Incident
            </Text>
            <Text style={[styles.subtitle, { color: colors.text }]}>
              Help us monitor and protect mangrove ecosystems
            </Text>
          </View>

          <View style={styles.form}>
            <PhotoCapture onPhotoSelected={handlePhotoSelected} />
            
                         <LocationCapture 
               onLocationCaptured={handleLocationCaptured}
               onLocationInfo={handleLocationInfo}
             />
            
            <FormInput
              label="Description"
              placeholder="Describe what you observed..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              style={{ minHeight: 100 }}
            />

            <View style={styles.submitContainer}>
              <ActionButton
                title={isSubmitting ? "Submitting..." : "Submit Report"}
                onPress={handleSubmit}
                variant="primary"
                style={[
                  styles.submitButton,
                  { opacity: canSubmit ? 1 : 0.6 }
                ]}
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
}); 