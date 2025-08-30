import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, TextInput } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { detectMangroveArea, getMangroveDetectionSummary, validateCoordinates } from '@/services/mangroveDetectionService';

export function MangroveDetectionDemo() {
  const [latitude, setLatitude] = useState<string>('21.9497');
  const [longitude, setLongitude] = useState<string>('89.1833');
  const [result, setResult] = useState<any>(null);
  
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const testCoordinates = [
    { name: 'Sundarbans (Mangrove)', lat: '21.9497', lon: '89.1833' },
    { name: 'Bhitarkanika (Mangrove)', lat: '20.6', lon: '86.85' },
    { name: 'Mumbai (Not Mangrove)', lat: '19.0760', lon: '72.8777' },
    { name: 'Delhi (Not Mangrove)', lat: '28.7041', lon: '77.1025' },
    { name: 'Pichavaram (Mangrove)', lat: '11.4', lon: '79.75' },
  ];

  const testMangroveDetection = () => {
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    
    if (!validateCoordinates(lat, lon)) {
      Alert.alert('Invalid Coordinates', 'Please enter valid latitude (-90 to 90) and longitude (-180 to 180) values.');
      return;
    }
    
    const detectionResult = detectMangroveArea(lat, lon);
    setResult(detectionResult);
    
    const summary = getMangroveDetectionSummary(detectionResult);
    Alert.alert('Mangrove Detection Result', summary);
  };

  const testPresetCoordinates = (testCase: typeof testCoordinates[0]) => {
    setLatitude(testCase.lat);
    setLongitude(testCase.lon);
    
    const lat = parseFloat(testCase.lat);
    const lon = parseFloat(testCase.lon);
    const detectionResult = detectMangroveArea(lat, lon);
    setResult(detectionResult);
    
    const summary = getMangroveDetectionSummary(detectionResult);
    Alert.alert(`${testCase.name} Test`, summary);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>🌿 Mangrove Detection Demo</Text>
      
      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: colors.text }]}>Latitude:</Text>
        <TextInput
          style={[styles.input, { 
            color: colors.text, 
            borderColor: colors.border || '#e0e0e0',
            backgroundColor: colors.background 
          }]}
          value={latitude}
          onChangeText={setLatitude}
          placeholder="Enter latitude (e.g., 21.9497)"
          placeholderTextColor={colors.text + '80'}
          keyboardType="numeric"
        />
        
        <Text style={[styles.label, { color: colors.text }]}>Longitude:</Text>
        <TextInput
          style={[styles.input, { 
            color: colors.text, 
            borderColor: colors.border || '#e0e0e0',
            backgroundColor: colors.background 
          }]}
          value={longitude}
          onChangeText={setLongitude}
          placeholder="Enter longitude (e.g., 89.1833)"
          placeholderTextColor={colors.text + '80'}
          keyboardType="numeric"
        />
      </View>

      <TouchableOpacity 
        style={[styles.testButton, { backgroundColor: colors.primary }]}
        onPress={testMangroveDetection}
      >
        <Text style={styles.buttonText}>🔍 Test Coordinates</Text>
      </TouchableOpacity>

      <View style={styles.presetContainer}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>Quick Test Cases:</Text>
        {testCoordinates.map((testCase, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.presetButton, { backgroundColor: colors.secondary }]}
            onPress={() => testPresetCoordinates(testCase)}
          >
            <Text style={styles.presetButtonText}>{testCase.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {result && (
        <View style={styles.resultContainer}>
          <Text style={[styles.resultTitle, { color: colors.primary }]}>Detection Result:</Text>
          <Text style={[styles.resultText, { color: colors.text }]}>
            Coordinates: {result.coordinates.latitude.toFixed(6)}, {result.coordinates.longitude.toFixed(6)}
          </Text>
          <Text style={[
            styles.resultStatus, 
            { color: result.isInMangroveArea ? '#4CAF50' : '#F44336' }
          ]}>
            {result.isInMangroveArea ? '✅ Inside Mangrove Area' : '❌ Not in Mangrove Area'}
          </Text>
          {result.isInMangroveArea && (
            <Text style={[styles.resultText, { color: colors.text }]}>
              Region: {result.regionName}
            </Text>
          )}
          {!result.isInMangroveArea && result.distanceToNearestMangrove && (
            <Text style={[styles.resultText, { color: colors.text }]}>
              Nearest: {result.regionName} ({result.distanceToNearestMangrove.toFixed(2)} km away)
            </Text>
          )}
          <Text style={[styles.resultText, { color: colors.text }]}>
            Confidence: {result.confidence}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  testButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  presetContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  presetButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  presetButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  resultContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  resultText: {
    fontSize: 14,
    marginBottom: 8,
  },
  resultStatus: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
});
