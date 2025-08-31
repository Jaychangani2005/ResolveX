import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { updateUserPassword } from '@/services/firebaseService';
import { notificationService } from '@/services/notificationService';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NGOSettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user, logout } = useAuth();

  useEffect(() => {
    // Load user preferences
    loadUserPreferences();
  }, []);

  const loadUserPreferences = async () => {
    try {
      // Load notification preferences
      const notificationPref = await notificationService.getNotificationPreference();
      setNotifications(notificationPref);
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const handleNotificationToggle = async (value: boolean) => {
    try {
      setNotifications(value);
      await notificationService.setNotificationPreference(value);
      
      Alert.alert(
        'Notifications',
        value ? 'Notifications enabled' : 'Notifications disabled'
      );
    } catch (error) {
      console.error('Error updating notification preference:', error);
      Alert.alert('Error', 'Failed to update notification preference');
    }
  };



  const handleTwoFactorToggle = (value: boolean) => {
    setTwoFactorEnabled(value);
    Alert.alert(
      'Two-Factor Authentication',
      value ? 'Two-factor authentication enabled' : 'Two-factor authentication disabled'
    );
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    try {
      await updateUserPassword(currentPassword, newPassword);
      
      Alert.alert(
        'Success',
        'Password updated successfully',
        [
          {
            text: 'OK',
            onPress: () => {
              setShowPasswordModal(false);
              setCurrentPassword('');
              setNewPassword('');
              setConfirmPassword('');
            }
          }
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update password');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              router.replace('/login');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Settings
        </Text>
        <View style={styles.headerRight} />
      </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* User Profile Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: '#2E8B57' }]}>
              👤 User Profile
            </Text>
            
            <View style={[styles.profileCard, { 
              backgroundColor: '#fff',
              borderColor: '#e0e0e0'
            }]}>
              <View style={styles.profileInfo}>
                <View style={[styles.avatar, { backgroundColor: '#2E8B57' }]}>
                  <Text style={styles.avatarText}>
                    {user?.name?.charAt(0)?.toUpperCase() || 'N'}
                  </Text>
                </View>
                <View style={styles.profileDetails}>
                  <Text style={[styles.userName, { color: '#1a1a2e' }]}>
                    {user?.name || 'NGO Partner'}
                  </Text>
                  <Text style={[styles.userEmail, { color: '#666' }]}>
                    {user?.email || 'ngo@example.com'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Notifications Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: '#2E8B57' }]}>
              🔔 Notifications
            </Text>
            
            <View style={[styles.settingsCard, { 
              backgroundColor: '#fff',
              borderColor: '#e0e0e0'
            }]}>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Ionicons name="notifications-outline" size={20} color="#2E8B57" />
                  <Text style={[styles.settingLabel, { color: '#1a1a2e' }]}>Push Notifications</Text>
                </View>
                <Switch
                  value={notifications}
                  onValueChange={handleNotificationToggle}
                  trackColor={{ false: '#E0E0E0', true: '#2E8B57' }}
                  thumbColor={notifications ? '#fff' : '#f4f3f4'}
                />
              </View>
            </View>
          </View>



          {/* Security Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: '#2E8B57' }]}>
              🔒 Security
            </Text>
            
            <View style={[styles.settingsCard, { 
              backgroundColor: '#fff',
              borderColor: '#e0e0e0'
            }]}>
              <TouchableOpacity
                style={styles.settingRow}
                onPress={() => setShowPasswordModal(true)}
              >
                <View style={styles.settingInfo}>
                  <Ionicons name="key-outline" size={20} color="#2E8B57" />
                  <Text style={[styles.settingLabel, { color: '#1a1a2e' }]}>Change Password</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </TouchableOpacity>
              
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Ionicons name="shield-checkmark-outline" size={20} color="#2E8B57" />
                  <Text style={[styles.settingLabel, { color: '#1a1a2e' }]}>Two-Factor Authentication</Text>
                </View>
                <Switch
                  value={twoFactorEnabled}
                  onValueChange={handleTwoFactorToggle}
                  trackColor={{ false: '#E0E0E0', true: '#2E8B57' }}
                  thumbColor={twoFactorEnabled ? '#fff' : '#f4f3f4'}
                />
              </View>
            </View>
          </View>

          {/* About Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: '#2E8B57' }]}>
              ℹ️ About
            </Text>
            
            <View style={[styles.settingsCard, { 
              backgroundColor: '#fff',
              borderColor: '#e0e0e0'
            }]}>
              <TouchableOpacity
                style={styles.settingRow}
                onPress={() => Alert.alert('Version', 'MangroveWatch v1.0.0\nNGO Dashboard')}
              >
                <View style={styles.settingInfo}>
                  <Ionicons name="information-circle-outline" size={20} color="#2E8B57" />
                  <Text style={[styles.settingLabel, { color: '#1a1a2e' }]}>Version</Text>
                </View>
                <Text style={[styles.settingValue, { color: '#666' }]}>v1.0.0</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.settingRow}
                onPress={() => setShowHelpModal(true)}
              >
                <View style={styles.settingInfo}>
                  <Ionicons name="help-circle-outline" size={20} color="#2E8B57" />
                  <Text style={[styles.settingLabel, { color: '#1a1a2e' }]}>Help & Support</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.settingRow}
                onPress={() => setShowPrivacyModal(true)}
              >
                <View style={styles.settingInfo}>
                  <Ionicons name="document-text-outline" size={20} color="#2E8B57" />
                  <Text style={[styles.settingLabel, { color: '#1a1a2e' }]}>Privacy Policy</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Logout Section */}
          <View style={styles.section}>
            <TouchableOpacity
              style={[styles.logoutButton, { backgroundColor: '#DC143C' }]}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={20} color="#fff" />
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Change Password Modal */}
        <Modal
          visible={showPasswordModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowPasswordModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.passwordModalContent}>
              <View style={styles.passwordModalHeader}>
                <Text style={styles.passwordModalTitle}>Change Password</Text>
                <TouchableOpacity 
                  style={styles.passwordCloseButton}
                  onPress={() => setShowPasswordModal(false)}
                >
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.passwordModalBody}>
                <Text style={styles.passwordModalSubtitle}>
                  Please enter your current password and choose a new one
                </Text>
                
                <View style={styles.passwordInputContainer}>
                  <Text style={styles.passwordInputLabel}>Current Password</Text>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Enter current password"
                    placeholderTextColor="#999"
                    secureTextEntry
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                  />
                </View>
                
                <View style={styles.passwordInputContainer}>
                  <Text style={styles.passwordInputLabel}>New Password</Text>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Enter new password"
                    placeholderTextColor="#999"
                    secureTextEntry
                    value={newPassword}
                    onChangeText={setNewPassword}
                  />
                </View>
                
                <View style={styles.passwordInputContainer}>
                  <Text style={styles.passwordInputLabel}>Confirm New Password</Text>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Confirm new password"
                    placeholderTextColor="#999"
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                  />
                </View>
                
                <TouchableOpacity
                  style={[styles.passwordModalButton, { backgroundColor: '#2E8B57' }]}
                  onPress={handleChangePassword}
                >
                  <Text style={styles.passwordModalButtonText}>Update Password</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Help Modal */}
        <Modal
          visible={showHelpModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowHelpModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.helpModalContent}>
              <View style={styles.helpModalHeader}>
                <Text style={styles.helpModalTitle}>Help & Support</Text>
                <TouchableOpacity 
                  style={styles.helpCloseButton}
                  onPress={() => setShowHelpModal(false)}
                >
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.helpModalBody}>
                <Text style={styles.helpModalText}>
                  Need help with the NGO Dashboard? Here are some common questions:
                </Text>
                
                <Text style={styles.helpModalSubtitle}>How to view reports?</Text>
                <Text style={styles.helpModalText}>
                  Navigate to the Reports tab to view all incident reports submitted by users.
                </Text>
                
                <Text style={styles.helpModalSubtitle}>How to export data?</Text>
                <Text style={styles.helpModalText}>
                  Use the Export button in the Reports or Analytics sections to download PDF reports.
                </Text>
                
                <Text style={styles.helpModalSubtitle}>Contact Support</Text>
                <Text style={styles.helpModalText}>
                  For additional support, please contact: support@mangrovewatch.com
                </Text>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Privacy Modal */}
        <Modal
          visible={showPrivacyModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowPrivacyModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.privacyModalContent}>
              <View style={styles.privacyModalHeader}>
                <Text style={styles.privacyModalTitle}>Privacy Policy</Text>
                <TouchableOpacity 
                  style={styles.privacyCloseButton}
                  onPress={() => setShowPrivacyModal(false)}
                >
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.privacyModalBody}>
                <Text style={styles.privacyModalText}>
                  Your privacy is important to us. This policy describes how we collect, use, and protect your information.
                </Text>
                
                <Text style={styles.privacyModalSubtitle}>Data Collection</Text>
                <Text style={styles.privacyModalText}>
                  We collect information you provide directly to us, such as when you create an account or submit reports.
                </Text>
                
                <Text style={styles.privacyModalSubtitle}>Data Usage</Text>
                <Text style={styles.privacyModalText}>
                  We use your information to provide and improve our services, communicate with you, and ensure platform security.
                </Text>
                
                <Text style={styles.privacyModalSubtitle}>Data Protection</Text>
                <Text style={styles.privacyModalText}>
                  We implement appropriate security measures to protect your personal information from unauthorized access.
                </Text>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  profileCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
  },
  settingsCard: {
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    marginLeft: 12,
  },
  settingValue: {
    fontSize: 14,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  passwordModalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  passwordModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  passwordModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  passwordCloseButton: {
    padding: 4,
  },
  passwordModalBody: {
    padding: 20,
  },
  passwordModalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  passwordInputContainer: {
    marginBottom: 16,
  },
  passwordInputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  passwordInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  passwordModalButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  passwordModalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  helpModalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  helpModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  helpModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  helpCloseButton: {
    padding: 4,
  },
  helpModalBody: {
    padding: 20,
  },
  helpModalText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
    color: '#333',
  },
  helpModalSubtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#333',
  },
  privacyModalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  privacyModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  privacyModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  privacyCloseButton: {
    padding: 4,
  },
  privacyModalBody: {
    padding: 20,
  },
  privacyModalText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
    color: '#333',
  },
  privacyModalSubtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#333',
  },
});
