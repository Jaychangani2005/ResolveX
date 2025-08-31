import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { SMSService } from '@/services/smsService';

interface SMSQuickSendProps {
  phoneNumbers?: string[];
  defaultMessage?: string;
  includeLocation?: boolean;
  buttonText?: string;
  buttonIcon?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function SMSQuickSend({
  phoneNumbers = [],
  defaultMessage = '',
  includeLocation = false,
  buttonText = 'Send SMS',
  buttonIcon = 'send',
  onSuccess,
  onError
}: SMSQuickSendProps) {
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState(defaultMessage);
  const [isLoading, setIsLoading] = useState(false);
  const [includeLocationInMessage, setIncludeLocationInMessage] = useState(includeLocation);
  
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleSendSMS = async () => {
    if (!message.trim()) {
      Alert.alert('Error', 'Please enter a message to send.');
      return;
    }

    if (phoneNumbers.length === 0) {
      Alert.alert('Error', 'No phone numbers provided.');
      return;
    }

    try {
      setIsLoading(true);
      
      let result;
      if (includeLocationInMessage) {
        result = await SMSService.sendSMSWithLocation(phoneNumbers, message, true);
      } else {
        result = await SMSService.sendSMSToMultiple(phoneNumbers, message);
      }
      
      if (result.success) {
        Alert.alert('Success', result.message);
        setShowModal(false);
        setMessage('');
        onSuccess?.();
      } else {
        Alert.alert('Error', result.message);
        onError?.(result.message);
      }
    } catch (error: any) {
      console.error('Error sending SMS:', error);
      const errorMessage = error.message || 'Failed to send SMS';
      Alert.alert('Error', errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = () => {
    setMessage(defaultMessage);
    setShowModal(true);
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={openModal}
      >
        <Ionicons name={buttonIcon as any} size={20} color="#fff" />
        <ThemedText style={styles.buttonText}>{buttonText}</ThemedText>
      </TouchableOpacity>

      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={[styles.modalTitle, { color: colors.text }]}>
                📱 Quick SMS
              </ThemedText>
              <TouchableOpacity
                onPress={() => setShowModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.content}>
              <ThemedText style={[styles.label, { color: colors.text }]}>
                Message:
              </ThemedText>
              <TextInput
                style={[styles.messageInput, {
                  color: colors.text,
                  borderColor: colors.border || '#e0e0e0',
                  backgroundColor: colors.background
                }]}
                placeholder="Type your message..."
                placeholderTextColor={colors.text + '80'}
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              <View style={styles.locationToggle}>
                <ThemedText style={[styles.locationText, { color: colors.text }]}>
                  📍 Include location
                </ThemedText>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    { backgroundColor: includeLocationInMessage ? colors.primary : colors.border }
                  ]}
                  onPress={() => setIncludeLocationInMessage(!includeLocationInMessage)}
                >
                  <Ionicons 
                    name={includeLocationInMessage ? "checkmark" : "close"} 
                    size={16} 
                    color="#fff" 
                  />
                </TouchableOpacity>
              </View>

              <ThemedText style={[styles.recipients, { color: colors.icon }]}>
                Recipients: {phoneNumbers.join(', ')}
              </ThemedText>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.cancelButton, { borderColor: colors.border }]}
                  onPress={() => setShowModal(false)}
                >
                  <ThemedText style={[styles.cancelButtonText, { color: colors.text }]}>
                    Cancel
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.sendButton,
                    { backgroundColor: colors.primary },
                    { opacity: (!message.trim() || isLoading) ? 0.6 : 1 }
                  ]}
                  onPress={handleSendSMS}
                  disabled={!message.trim() || isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <>
                      <Ionicons name="send" size={16} color="#fff" />
                      <ThemedText style={styles.sendButtonText}>Send</ThemedText>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ThemedView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 0,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  messageInput: {
    width: '100%',
    minHeight: 100,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  locationToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationText: {
    fontSize: 16,
    fontWeight: '500',
  },
  toggleButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recipients: {
    fontSize: 14,
    marginBottom: 20,
    fontStyle: 'italic',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  sendButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
