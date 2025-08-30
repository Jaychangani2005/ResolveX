import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, TouchableOpacity, Text, View } from 'react-native';
import { SMSMessaging } from '@/components/SMSMessaging';
import { ReportSubmissionVerifier } from '@/components/ReportSubmissionVerifier';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';

export default function SMSScreen() {
  const [activeTab, setActiveTab] = useState<'sms' | 'verifier'>('sms');
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'sms' && { backgroundColor: colors.primary }
          ]}
          onPress={() => setActiveTab('sms')}
        >
          <Ionicons 
            name="chatbubbles" 
            size={20} 
            color={activeTab === 'sms' ? '#fff' : colors.text} 
          />
          <Text style={[
            styles.tabText,
            { color: activeTab === 'sms' ? '#fff' : colors.text }
          ]}>
            SMS Messaging
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'verifier' && { backgroundColor: colors.primary }
          ]}
          onPress={() => setActiveTab('verifier')}
        >
          <Ionicons 
            name="checkmark-circle" 
            size={20} 
            color={activeTab === 'verifier' ? '#fff' : colors.text} 
          />
          <Text style={[
            styles.tabText,
            { color: activeTab === 'verifier' ? '#fff' : colors.text }
          ]}>
            Report Verifier
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'sms' ? (
        <SMSMessaging />
      ) : (
        <ReportSubmissionVerifier />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 10,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    gap: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
