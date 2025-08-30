import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { SMSService } from '@/services/smsService';

export function SMSTestComponent() {
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<{
    smsAvailable: boolean | null;
    contactsLoaded: boolean | null;
    templatesLoaded: boolean | null;
  }>({
    smsAvailable: null,
    contactsLoaded: null,
    templatesLoaded: null,
  });

  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const runSMSTests = async () => {
    setIsLoading(true);
    const results = {
      smsAvailable: false,
      contactsLoaded: false,
      templatesLoaded: false,
    };

    try {
      // Test 1: SMS Availability
      console.log('🧪 Testing SMS availability...');
      results.smsAvailable = await SMSService.isAvailable();
      console.log('✅ SMS Available:', results.smsAvailable);

      // Test 2: Contact Loading
      console.log('🧪 Testing contact loading...');
      try {
        const contacts = await SMSService.loadContacts();
        results.contactsLoaded = contacts.length > 0;
        console.log('✅ Contacts loaded:', contacts.length);
      } catch (error) {
        console.log('❌ Contact loading failed:', error);
        results.contactsLoaded = false;
      }

      // Test 3: Template Loading
      console.log('🧪 Testing template loading...');
      const templates = SMSService.getMessageTemplates();
      results.templatesLoaded = templates.length > 0;
      console.log('✅ Templates loaded:', templates.length);

    } catch (error) {
      console.error('❌ SMS test failed:', error);
    }

    setTestResults(results);
    setIsLoading(false);

    // Show results
    const passedTests = Object.values(results).filter(Boolean).length;
    const totalTests = Object.keys(results).length;
    
    Alert.alert(
      'SMS Test Results',
      `Tests Passed: ${passedTests}/${totalTests}\n\n` +
      `✅ SMS Available: ${results.smsAvailable ? 'Yes' : 'No'}\n` +
      `✅ Contacts: ${results.contactsLoaded ? 'Loaded' : 'Failed'}\n` +
      `✅ Templates: ${results.templatesLoaded ? 'Loaded' : 'Failed'}\n\n` +
      `${passedTests === totalTests ? '🎉 All tests passed!' : '⚠️ Some tests failed. Check console for details.'}`
    );
  };

  const testQuickSMS = async () => {
    try {
      setIsLoading(true);
      
      // Test with a dummy number (won't actually send)
      const testNumber = '+1234567890';
      const testMessage = 'SMS Test from ResolveX App';
      
      console.log('🧪 Testing SMS sending...');
      const result = await SMSService.sendSMSToMultiple([testNumber], testMessage);
      
      console.log('✅ SMS test result:', result);
      
      Alert.alert(
        'SMS Send Test',
        `Result: ${result.success ? 'Success' : 'Failed'}\n` +
        `Message: ${result.message}\n\n` +
        'Note: This was a test with a dummy number. Check console for details.'
      );
      
    } catch (error) {
      console.error('❌ SMS send test failed:', error);
      let errorMessage = 'Unknown error';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      Alert.alert('SMS Test Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: boolean | null) => {
    if (status === null) return '⏳';
    return status ? '✅' : '❌';
  };

  const getStatusColor = (status: boolean | null) => {
    if (status === null) return colors.icon;
    return status ? '#4CAF50' : '#F44336';
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={[styles.title, { color: colors.text }]}>
        📱 SMS Functionality Test
      </ThemedText>
      
      <ThemedText style={[styles.subtitle, { color: colors.icon }]}>
        Test if SMS features are working properly
      </ThemedText>

      {/* Test Results */}
      <View style={styles.resultsContainer}>
        <ThemedText style={[styles.sectionTitle, { color: colors.primary }]}>
          Test Results
        </ThemedText>
        
        <View style={styles.resultItem}>
          <Text style={styles.resultIcon}>{getStatusIcon(testResults.smsAvailable)}</Text>
          <ThemedText style={[styles.resultText, { color: getStatusColor(testResults.smsAvailable) }]}>
            SMS Available: {testResults.smsAvailable === null ? 'Not Tested' : testResults.smsAvailable ? 'Yes' : 'No'}
          </ThemedText>
        </View>
        
        <View style={styles.resultItem}>
          <Text style={styles.resultIcon}>{getStatusIcon(testResults.contactsLoaded)}</Text>
          <ThemedText style={[styles.resultText, { color: getStatusColor(testResults.contactsLoaded) }]}>
            Contacts: {testResults.contactsLoaded === null ? 'Not Tested' : testResults.contactsLoaded ? 'Loaded' : 'Failed'}
          </ThemedText>
        </View>
        
        <View style={styles.resultItem}>
          <Text style={styles.resultIcon}>{getStatusIcon(testResults.templatesLoaded)}</Text>
          <ThemedText style={[styles.resultText, { color: getStatusColor(testResults.templatesLoaded) }]}>
            Templates: {testResults.templatesLoaded === null ? 'Not Tested' : testResults.templatesLoaded ? 'Loaded' : 'Failed'}
          </ThemedText>
        </View>
      </View>

      {/* Test Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.testButton, { backgroundColor: colors.primary }]}
          onPress={runSMSTests}
          disabled={isLoading}
        >
          <Ionicons name="checkmark-circle" size={20} color="#fff" />
          <ThemedText style={styles.buttonText}>
            {isLoading ? 'Running Tests...' : 'Run All Tests'}
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.testButton, { backgroundColor: colors.secondary }]}
          onPress={testQuickSMS}
          disabled={isLoading}
        >
          <Ionicons name="send" size={20} color="#fff" />
          <ThemedText style={styles.buttonText}>
            {isLoading ? 'Testing...' : 'Test SMS Send'}
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <ThemedText style={[styles.sectionTitle, { color: colors.primary }]}>
          How to Use
        </ThemedText>
        
        <ThemedText style={[styles.instructionText, { color: colors.text }]}>
          1. Tap "Run All Tests" to check SMS functionality
        </ThemedText>
        <ThemedText style={[styles.instructionText, { color: colors.text }]}>
          2. Tap "Test SMS Send" to test SMS sending (dummy number)
        </ThemedText>
        <ThemedText style={[styles.instructionText, { color: colors.text }]}>
          3. Check console logs for detailed information
        </ThemedText>
        <ThemedText style={[styles.instructionText, { color: colors.text }]}>
          4. Use the main SMS tab for actual messaging
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
  resultsContainer: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  resultText: {
    fontSize: 16,
    fontWeight: '500',
  },
  buttonContainer: {
    gap: 12,
    marginBottom: 24,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  instructionsContainer: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
  },
  instructionText: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
});
