import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  ScrollView,
  Modal,
  FlatList,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '@/contexts/AuthContext';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SMSService, Contact, MessageTemplate, SMSHistoryItem } from '@/services/smsService';

type TabType = 'compose' | 'history' | 'templates';

export function SMSMessaging() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showContactPicker, setShowContactPicker] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('compose');
  const [includeLocation, setIncludeLocation] = useState(false);
  const [manualPhoneNumbers, setManualPhoneNumbers] = useState('');
  const [smsHistory, setSmsHistory] = useState<SMSHistoryItem[]>([]);
  const [showManualInput, setShowManualInput] = useState(false);
  
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user } = useAuth();

  // Get message templates from service
  const messageTemplates = SMSService.getMessageTemplates();

  useEffect(() => {
    loadContacts();
    loadSMSHistory();
  }, []);

  useEffect(() => {
    const filtered = SMSService.filterContacts(contacts, searchQuery);
    setFilteredContacts(filtered);
  }, [searchQuery, contacts]);

  const loadContacts = async () => {
    try {
      setIsLoading(true);
      
      const contactsData = await SMSService.loadContacts();
      setContacts(contactsData);
      setFilteredContacts(contactsData);
    } catch (error: any) {
      console.error('Error loading contacts:', error);
      Alert.alert(
        'Permission Required',
        error.message || 'Failed to load contacts. Please try again.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Retry', onPress: loadContacts }
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const loadSMSHistory = () => {
    const history = SMSService.getSMSHistory();
    setSmsHistory(history);
  };

  const sendSMS = async () => {
    if (!message.trim()) {
      Alert.alert('Error', 'Please enter a message to send.');
      return;
    }

    const allPhoneNumbers: string[] = [];
    
    // Add selected contacts' phone numbers
    const contactNumbers = selectedContacts.flatMap(contact => contact.phoneNumbers);
    allPhoneNumbers.push(...contactNumbers);
    
    // Add manual phone numbers
    if (manualPhoneNumbers.trim()) {
      const manualNumbers = SMSService.parsePhoneNumbers(manualPhoneNumbers);
      allPhoneNumbers.push(...manualNumbers);
    }

    if (allPhoneNumbers.length === 0) {
      Alert.alert('Error', 'Please select at least one contact or enter phone numbers to send SMS to.');
      return;
    }

    try {
      setIsLoading(true);
      
      let result;
      if (includeLocation) {
        result = await SMSService.sendSMSWithLocation(allPhoneNumbers, message, true);
      } else {
        result = await SMSService.sendSMSToMultiple(allPhoneNumbers, message);
      }
      
      if (result.success) {
        Alert.alert(
          'SMS Sent',
          result.message,
          [{ text: 'OK' }]
        );
        
        // Clear form
        setMessage('');
        setSelectedContacts([]);
        setManualPhoneNumbers('');
        loadSMSHistory(); // Refresh history
      } else {
        Alert.alert(
          'SMS Failed',
          result.message,
          [{ text: 'OK' }]
        );
      }
      
    } catch (error: any) {
      console.error('Error sending SMS:', error);
      Alert.alert('Error', error.message || 'Failed to send SMS. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleContactSelection = (contact: Contact) => {
    const isSelected = selectedContacts.some(c => c.id === contact.id);
    if (isSelected) {
      setSelectedContacts(selectedContacts.filter(c => c.id !== contact.id));
    } else {
      setSelectedContacts([...selectedContacts, contact]);
    }
  };

  const selectTemplate = (template: MessageTemplate) => {
    setMessage(template.content);
    setShowTemplates(false);
  };

  const getContactDisplayName = (contact: Contact) => {
    let displayName = contact.name;
    if (contact.organization) {
      displayName += ` (${contact.organization})`;
    }
    if (contact.jobTitle) {
      displayName += ` - ${contact.jobTitle}`;
    }
    return displayName;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'urgent': return '🚨';
      case 'general': return '📝';
      case 'report': return '📸';
      case 'inquiry': return '❓';
      default: return '💬';
    }
  };

  const renderTabButton = (tab: TabType, title: string, icon: string) => (
    <TouchableOpacity
      style={[
        styles.tabButton,
        { backgroundColor: activeTab === tab ? colors.primary : colors.background },
        { borderColor: colors.border || '#e0e0e0' }
      ]}
      onPress={() => setActiveTab(tab)}
    >
      <Text style={styles.tabIcon}>{icon}</Text>
      <ThemedText style={[
        styles.tabText,
        { color: activeTab === tab ? '#fff' : colors.text }
      ]}>
        {title}
      </ThemedText>
    </TouchableOpacity>
  );

  const renderComposeTab = () => (
    <ScrollView style={styles.tabContent}>
      <ThemedText style={[styles.subtitle, { color: colors.icon }]}>
        Send messages to NGOs and government officials
      </ThemedText>

      {/* Message Input */}
      <View style={styles.messageSection}>
        <View style={styles.messageHeader}>
          <ThemedText style={[styles.sectionTitle, { color: colors.primary }]}>
            💬 Message
          </ThemedText>
          <TouchableOpacity
            style={[styles.templateButton, { backgroundColor: colors.secondary }]}
            onPress={() => setShowTemplates(true)}
          >
            <ThemedText style={styles.templateButtonText}>📋 Templates</ThemedText>
          </TouchableOpacity>
        </View>
        
        <TextInput
          style={[styles.messageInput, {
            color: colors.text,
            borderColor: colors.border || '#e0e0e0',
            backgroundColor: colors.background
          }]}
          placeholder="Type your message here..."
          placeholderTextColor={colors.text + '80'}
          value={message}
          onChangeText={setMessage}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />

        {/* Location Toggle */}
        <View style={styles.locationToggle}>
          <ThemedText style={[styles.locationText, { color: colors.text }]}>
            📍 Include current location
          </ThemedText>
          <Switch
            value={includeLocation}
            onValueChange={setIncludeLocation}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={includeLocation ? '#fff' : colors.text}
          />
        </View>
      </View>

      {/* Manual Phone Numbers Input */}
      <View style={styles.manualInputSection}>
        <View style={styles.manualInputHeader}>
          <ThemedText style={[styles.sectionTitle, { color: colors.primary }]}>
            📱 Manual Phone Numbers
          </ThemedText>
          <TouchableOpacity
            style={[styles.toggleButton, { backgroundColor: colors.secondary }]}
            onPress={() => setShowManualInput(!showManualInput)}
          >
            <ThemedText style={styles.toggleButtonText}>
              {showManualInput ? 'Hide' : 'Add'}
            </ThemedText>
          </TouchableOpacity>
        </View>
        
        {showManualInput && (
          <TextInput
            style={[styles.manualInput, {
              color: colors.text,
              borderColor: colors.border || '#e0e0e0',
              backgroundColor: colors.background
            }]}
            placeholder="Enter phone numbers (separated by commas)"
            placeholderTextColor={colors.text + '80'}
            value={manualPhoneNumbers}
            onChangeText={setManualPhoneNumbers}
            multiline
            numberOfLines={3}
          />
        )}
      </View>

      {/* Selected Contacts */}
      {selectedContacts.length > 0 && (
        <View style={styles.selectedContactsSection}>
          <ThemedText style={[styles.sectionTitle, { color: colors.primary }]}>
            📞 Selected Contacts ({selectedContacts.length})
          </ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {selectedContacts.map((contact) => (
              <View key={contact.id} style={[styles.selectedContactChip, { backgroundColor: colors.primary }]}>
                <ThemedText style={styles.selectedContactText}>
                  {contact.name}
                </ThemedText>
                <TouchableOpacity
                  onPress={() => toggleContactSelection(contact)}
                  style={styles.removeContactButton}
                >
                  <Ionicons name="close-circle" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Contact Picker Button */}
      <TouchableOpacity
        style={[styles.contactPickerButton, { backgroundColor: colors.secondary }]}
        onPress={() => setShowContactPicker(true)}
      >
        <ThemedText style={styles.contactPickerButtonText}>
          👥 {selectedContacts.length > 0 ? 'Manage Contacts' : 'Select Contacts'}
        </ThemedText>
      </TouchableOpacity>

      {/* Send SMS Button */}
      <TouchableOpacity
        style={[
          styles.sendButton,
          { backgroundColor: colors.primary },
          { opacity: ((selectedContacts.length === 0 && !manualPhoneNumbers.trim()) || !message.trim() || isLoading) ? 0.6 : 1 }
        ]}
        onPress={sendSMS}
        disabled={(selectedContacts.length === 0 && !manualPhoneNumbers.trim()) || !message.trim() || isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <ThemedText style={styles.sendButtonText}>
            📤 Send SMS
          </ThemedText>
        )}
      </TouchableOpacity>
    </ScrollView>
  );

  const renderHistoryTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.historyHeader}>
        <ThemedText style={[styles.sectionTitle, { color: colors.primary }]}>
          📋 SMS History
        </ThemedText>
        <TouchableOpacity
          style={[styles.clearButton, { backgroundColor: colors.secondary }]}
          onPress={() => {
            Alert.alert(
              'Clear History',
              'Are you sure you want to clear all SMS history?',
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Clear', 
                  style: 'destructive',
                  onPress: () => {
                    SMSService.clearSMSHistory();
                    loadSMSHistory();
                  }
                }
              ]
            );
          }}
        >
          <ThemedText style={styles.clearButtonText}>Clear</ThemedText>
        </TouchableOpacity>
      </View>

      {smsHistory.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📱</Text>
          <ThemedText style={[styles.emptyText, { color: colors.icon }]}>
            No SMS history yet
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={smsHistory}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={[styles.historyItem, { borderColor: colors.border || '#e0e0e0' }]}>
              <View style={styles.historyHeader}>
                <ThemedText style={[styles.historyDate, { color: colors.text }]}>
                  {item.timestamp.toLocaleDateString()} {item.timestamp.toLocaleTimeString()}
                </ThemedText>
                <View style={[
                  styles.statusIndicator,
                  { backgroundColor: item.success ? '#4CAF50' : '#F44336' }
                ]}>
                  <Text style={styles.statusText}>
                    {item.success ? '✓' : '✗'}
                  </Text>
                </View>
              </View>
              <ThemedText style={[styles.historyMessage, { color: colors.text }]}>
                {item.message}
              </ThemedText>
              <ThemedText style={[styles.historyRecipients, { color: colors.icon }]}>
                To: {item.recipients.join(', ')}
              </ThemedText>
              {item.failedNumbers && item.failedNumbers.length > 0 && (
                <ThemedText style={[styles.historyFailed, { color: '#F44336' }]}>
                  Failed: {item.failedNumbers.join(', ')}
                </ThemedText>
              )}
            </View>
          )}
        />
      )}
    </View>
  );

  const renderTemplatesTab = () => (
    <View style={styles.tabContent}>
      <ThemedText style={[styles.subtitle, { color: colors.icon }]}>
        Pre-built message templates for common scenarios
      </ThemedText>

      <FlatList
        data={messageTemplates}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.templateItem, { borderColor: colors.border || '#e0e0e0' }]}
            onPress={() => selectTemplate(item)}
          >
            <View style={styles.templateHeader}>
              <Text style={styles.templateIcon}>{getCategoryIcon(item.category)}</Text>
              <ThemedText style={[styles.templateTitle, { color: colors.text }]}>
                {item.title}
              </ThemedText>
            </View>
            <ThemedText style={[styles.templateContent, { color: colors.icon }]}>
              {item.content}
            </ThemedText>
          </TouchableOpacity>
        )}
      />
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={[styles.title, { color: colors.text }]}>
        📱 SMS Messaging
      </ThemedText>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {renderTabButton('compose', 'Compose', '✏️')}
        {renderTabButton('history', 'History', '📋')}
        {renderTabButton('templates', 'Templates', '📝')}
      </View>

      {/* Tab Content */}
      {activeTab === 'compose' && renderComposeTab()}
      {activeTab === 'history' && renderHistoryTab()}
      {activeTab === 'templates' && renderTemplatesTab()}

      {/* Contact Picker Modal */}
      <Modal
        visible={showContactPicker}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <ThemedText style={[styles.modalTitle, { color: colors.text }]}>
              Select Contacts
            </ThemedText>
            <TouchableOpacity
              onPress={() => setShowContactPicker(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <TextInput
            style={[styles.searchInput, {
              color: colors.text,
              borderColor: colors.border || '#e0e0e0',
              backgroundColor: colors.background
            }]}
            placeholder="Search contacts..."
            placeholderTextColor={colors.text + '80'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          {/* Contacts List */}
          <FlatList
            data={filteredContacts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const isSelected = selectedContacts.some(c => c.id === item.id);
              return (
                <TouchableOpacity
                  style={[
                    styles.contactItem,
                    { borderColor: colors.border || '#e0e0e0' },
                    isSelected && { backgroundColor: colors.primary + '20' }
                  ]}
                  onPress={() => toggleContactSelection(item)}
                >
                  <View style={styles.contactInfo}>
                    <ThemedText style={[styles.contactName, { color: colors.text }]}>
                      {getContactDisplayName(item)}
                    </ThemedText>
                    <ThemedText style={[styles.contactPhone, { color: colors.icon }]}>
                      {item.phoneNumbers[0]}
                    </ThemedText>
                  </View>
                  <View style={[
                    styles.selectionIndicator,
                    { backgroundColor: isSelected ? colors.primary : colors.border || '#e0e0e0' }
                  ]}>
                    {isSelected && <Ionicons name="checkmark" size={16} color="#fff" />}
                  </View>
                </TouchableOpacity>
              );
            }}
            refreshing={isLoading}
            onRefresh={loadContacts}
          />
        </SafeAreaView>
      </Modal>

      {/* Templates Modal */}
      <Modal
        visible={showTemplates}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <ThemedText style={[styles.modalTitle, { color: colors.text }]}>
              Message Templates
            </ThemedText>
            <TouchableOpacity
              onPress={() => setShowTemplates(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={messageTemplates}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.templateItem, { borderColor: colors.border || '#e0e0e0' }]}
                onPress={() => selectTemplate(item)}
              >
                <View style={styles.templateHeader}>
                  <Text style={styles.templateIcon}>{getCategoryIcon(item.category)}</Text>
                  <ThemedText style={[styles.templateTitle, { color: colors.text }]}>
                    {item.title}
                  </ThemedText>
                </View>
                <ThemedText style={[styles.templateContent, { color: colors.icon }]}>
                  {item.content}
                </ThemedText>
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </Modal>
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
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRightWidth: 1,
  },
  tabIcon: {
    fontSize: 16,
    marginBottom: 4,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
  },
  messageSection: {
    marginBottom: 20,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  templateButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  templateButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  messageInput: {
    width: '100%',
    minHeight: 120,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  locationToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 8,
  },
  locationText: {
    fontSize: 16,
    fontWeight: '500',
  },
  manualInputSection: {
    marginBottom: 20,
  },
  manualInputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  toggleButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  manualInput: {
    width: '100%',
    minHeight: 80,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  selectedContactsSection: {
    marginBottom: 20,
  },
  selectedContactChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  selectedContactText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginRight: 8,
  },
  removeContactButton: {
    marginLeft: 4,
  },
  contactPickerButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  contactPickerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  sendButton: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  clearButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  historyItem: {
    padding: 16,
    borderBottomWidth: 1,
    marginBottom: 8,
    borderRadius: 8,
  },
  historyDate: {
    fontSize: 14,
    fontWeight: '600',
  },
  historyMessage: {
    fontSize: 16,
    marginVertical: 8,
  },
  historyRecipients: {
    fontSize: 14,
    marginBottom: 4,
  },
  historyFailed: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  statusIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  templateItem: {
    padding: 16,
    borderBottomWidth: 1,
    marginBottom: 8,
    borderRadius: 8,
  },
  templateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  templateIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  templateTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  templateContent: {
    fontSize: 14,
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
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
  searchInput: {
    margin: 20,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  contactPhone: {
    fontSize: 14,
  },
  selectionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
