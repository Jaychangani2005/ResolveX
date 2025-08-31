import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { updateUserPassword } from '@/services/firebaseService';
import { notificationService } from '@/services/notificationService';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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

export default function GovernmentSettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const { user, logout } = useAuth();
  const { themeMode, isDarkMode, setThemeMode } = useTheme();
  
  // Define colors based on theme
  const colors = isDarkMode ? Colors.dark : Colors.light;

  // Initialize notification service and load settings
  useEffect(() => {
    const initializeSettings = async () => {
      try {
        // Initialize notification service
        await notificationService.initialize();
        
        // Load notification settings
        const settings = notificationService.getNotificationSettings();
        setNotifications(settings.enabled);
        
        console.log('✅ Settings initialized successfully');
      } catch (error) {
        console.error('❌ Failed to initialize settings:', error);
      }
    };

    initializeSettings();
  }, []);

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
            await logout();
            router.replace('/login');
          }
        }
      ]
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
      setIsChangingPassword(true);
      await updateUserPassword(currentPassword, newPassword);
      
      // Send security alert notification
      await notificationService.notifySecurityAlert({
        type: 'password_change',
        details: 'Your password has been successfully changed'
      });
      
      Alert.alert('Success', 'Password updated successfully');
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleTwoFactorToggle = () => {
    Alert.alert(
      'Two-Factor Authentication',
      twoFactorEnabled 
        ? 'Are you sure you want to disable 2FA?' 
        : 'Two-factor authentication will be enabled. You will receive a verification code on your registered email.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: twoFactorEnabled ? 'Disable' : 'Enable',
          onPress: () => {
            setTwoFactorEnabled(!twoFactorEnabled);
            Alert.alert(
              'Success', 
              twoFactorEnabled 
                ? 'Two-factor authentication has been disabled' 
                : 'Two-factor authentication has been enabled'
            );
          }
        }
      ]
    );
  };

  const handleNotificationToggle = (value: boolean) => {
    setNotifications(value);
    notificationService.setEnabled(value);
    notificationService.updateNotificationSettings({ enabled: value });
    
    Alert.alert(
      'Notifications',
      value 
        ? 'Push notifications enabled. You will receive notifications when new incidents are reported.' 
        : 'Push notifications disabled.'
    );
  };





  return (
    <View style={styles.container}>
      <LinearGradient
        colors={isDarkMode ? ['#0f0f23', '#1a1a2e', '#16213e'] : ['#f8f9fa', '#e9ecef', '#dee2e6']}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
                 

      <ScrollView style={styles.scrollView}>
        {/* User Profile Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: '#2E8B57' }]}>
            👤 User Profile
          </Text>
          
          <View style={[styles.profileCard, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.95)', borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : '#E0E0E0' }]}>
            <View style={styles.profileInfo}>
              <View style={[styles.avatar, { backgroundColor: '#2E8B57' }]}>
                <Text style={styles.avatarText}>
                  {user?.name?.charAt(0)?.toUpperCase() || 'G'}
                </Text>
              </View>
              <View style={styles.profileDetails}>
                <Text style={[styles.userName, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>
                  {user?.name || 'Government Official'}
                </Text>
                <Text style={[styles.userEmail, { color: isDarkMode ? '#ccc' : '#666' }]}>
                  {user?.email || 'government@example.com'}
                </Text>
                <Text style={[styles.userRole, { color: '#2E8B57' }]}>
                  🏛️ Government Official
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
          
          <View style={[styles.settingsCard, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.95)', borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : '#E0E0E0' }]}>
                         <View style={styles.settingRow}>
               <View style={styles.settingInfo}>
                 <Ionicons name="notifications-outline" size={20} color="#2E8B57" />
                 <Text style={[styles.settingLabel, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>Push Notifications</Text>
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
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>
            🔒 Security
          </Text>
          
                     <View style={[styles.settingsCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
             <TouchableOpacity
               style={styles.settingRow}
               onPress={() => setShowPasswordModal(true)}
             >
               <View style={styles.settingInfo}>
                 <Ionicons name="key-outline" size={20} color={colors.primary} />
                 <Text style={[styles.settingLabel, { color: colors.text }]}>Change Password</Text>
               </View>
               <Ionicons name="chevron-forward" size={20} color={colors.secondary || colors.text} />
             </TouchableOpacity>
             
             <View style={styles.settingRow}>
               <View style={styles.settingInfo}>
                 <Ionicons name="shield-checkmark-outline" size={20} color={colors.primary} />
                 <Text style={[styles.settingLabel, { color: colors.text }]}>Two-Factor Authentication</Text>
               </View>
               <Switch
                 value={twoFactorEnabled}
                 onValueChange={handleTwoFactorToggle}
                 trackColor={{ false: '#E0E0E0', true: colors.primary }}
                 thumbColor={twoFactorEnabled ? '#fff' : '#f4f3f4'}
               />
             </View>
           </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>
            ℹ️ About
          </Text>
          
          <View style={[styles.settingsCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => Alert.alert('Version', 'MangroveWatch v1.0.0\nGovernment Dashboard')}
            >
              <View style={styles.settingInfo}>
                <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
                <Text style={[styles.settingLabel, { color: colors.text }]}>Version</Text>
              </View>
              <Text style={[styles.settingValue, { color: colors.secondary || colors.text }]}>v1.0.0</Text>
            </TouchableOpacity>
            
                         <TouchableOpacity
               style={styles.settingRow}
               onPress={() => setShowHelpModal(true)}
             >
               <View style={styles.settingInfo}>
                 <Ionicons name="help-circle-outline" size={20} color={colors.primary} />
                 <Text style={[styles.settingLabel, { color: colors.text }]}>Help & Support</Text>
               </View>
               <Ionicons name="chevron-forward" size={20} color={colors.secondary || colors.text} />
             </TouchableOpacity>
             
             <TouchableOpacity
               style={styles.settingRow}
               onPress={() => setShowPrivacyModal(true)}
             >
               <View style={styles.settingInfo}>
                 <Ionicons name="document-text-outline" size={20} color={colors.primary} />
                 <Text style={[styles.settingLabel, { color: colors.text }]}>Privacy Policy</Text>
               </View>
               <Ionicons name="chevron-forward" size={20} color={colors.secondary || colors.text} />
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
             
                <Text style={styles.passwordHint}>
                  Password must be at least 6 characters long
                </Text>
              </View>
              
              <View style={styles.passwordModalFooter}>
               <TouchableOpacity
                  style={styles.passwordCancelButton}
                 onPress={() => setShowPasswordModal(false)}
               >
                  <Text style={styles.passwordCancelButtonText}>Cancel</Text>
               </TouchableOpacity>
               
               <TouchableOpacity
                  style={styles.passwordUpdateButton}
                 onPress={handleChangePassword}
                 disabled={isChangingPassword}
               >
                  <Text style={styles.passwordUpdateButtonText}>
                   {isChangingPassword ? 'Updating...' : 'Update Password'}
                 </Text>
               </TouchableOpacity>
             </View>
           </View>
         </View>
       </Modal>

       {/* Help & Support Modal */}
       <Modal
         visible={showHelpModal}
         animationType="slide"
         transparent={true}
         onRequestClose={() => setShowHelpModal(false)}
       >
         <View style={styles.modalOverlay}>
           <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
             <View style={styles.modalHeader}>
               <Text style={[styles.modalTitle, { color: colors.text }]}>Help & Support</Text>
               <TouchableOpacity onPress={() => setShowHelpModal(false)}>
                 <Ionicons name="close" size={24} color={colors.text} />
               </TouchableOpacity>
             </View>
             
             <ScrollView style={styles.modalBody}>
               <View style={styles.helpSection}>
                 <Text style={[styles.helpTitle, { color: colors.primary }]}>📋 How to View Reports</Text>
                 <Text style={[styles.helpText, { color: colors.text }]}>
                   1. Navigate to the dashboard{'\n'}
                   2. Tap "View Reports" to see all incident reports{'\n'}
                   3. Use the search bar to find specific reports{'\n'}
                   4. Tap on any report to view details
                 </Text>
               </View>
               
               <View style={styles.helpSection}>
                 <Text style={[styles.helpTitle, { color: colors.primary }]}>🔔 Notifications</Text>
                 <Text style={[styles.helpText, { color: colors.text }]}>
                   • Enable push notifications to receive alerts when new incidents are reported{'\n'}
                   • You can toggle notifications on/off in Settings
                 </Text>
               </View>
               
               <View style={styles.helpSection}>
                 <Text style={[styles.helpTitle, { color: colors.primary }]}>🔒 Security</Text>
                 <Text style={[styles.helpText, { color: colors.text }]}>
                   • Change your password regularly{'\n'}
                   • Enable two-factor authentication for extra security{'\n'}
                   • Keep your login credentials secure
                 </Text>
               </View>
               
               <View style={styles.helpSection}>
                 <Text style={[styles.helpTitle, { color: colors.primary }]}>📞 Contact Support</Text>
                 <Text style={[styles.helpText, { color: colors.text }]}>
                   Email: support@mangrovewatch.gov{'\n'}
                   Phone: +1-800-MANGROVE{'\n'}
                   Hours: Monday-Friday, 9 AM - 5 PM
                 </Text>
               </View>
             </ScrollView>
           </View>
         </View>
       </Modal>

       {/* Privacy Policy Modal */}
       <Modal
         visible={showPrivacyModal}
         animationType="slide"
         transparent={true}
         onRequestClose={() => setShowPrivacyModal(false)}
       >
         <View style={styles.modalOverlay}>
           <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
             <View style={styles.modalHeader}>
               <Text style={[styles.modalTitle, { color: colors.text }]}>Privacy Policy</Text>
               <TouchableOpacity onPress={() => setShowPrivacyModal(false)}>
                 <Ionicons name="close" size={24} color={colors.text} />
               </TouchableOpacity>
             </View>
             
             <ScrollView style={styles.modalBody}>
               <View style={styles.privacySection}>
                 <Text style={[styles.privacyTitle, { color: colors.primary }]}>Information We Collect</Text>
                 <Text style={[styles.privacyText, { color: colors.text }]}>
                   • Personal information (name, email, role){'\n'}
                   • Incident report data and photos{'\n'}
                   • Location data for incident reports{'\n'}
                   • Usage analytics and app performance data
                 </Text>
               </View>
               
               <View style={styles.privacySection}>
                 <Text style={[styles.privacyTitle, { color: colors.primary }]}>How We Use Your Information</Text>
                 <Text style={[styles.privacyText, { color: colors.text }]}>
                   • Process and review incident reports{'\n'}
                   • Provide government oversight and analytics{'\n'}
                   • Send notifications about new reports{'\n'}
                   • Improve app functionality and user experience
                 </Text>
               </View>
               
               <View style={styles.privacySection}>
                 <Text style={[styles.privacyTitle, { color: colors.primary }]}>Data Security</Text>
                 <Text style={[styles.privacyText, { color: colors.text }]}>
                   • All data is encrypted in transit and at rest{'\n'}
                   • Access is restricted to authorized government personnel{'\n'}
                   • Regular security audits and updates{'\n'}
                   • Compliance with government data protection standards
                 </Text>
               </View>
               
               <View style={styles.privacySection}>
                 <Text style={[styles.privacyTitle, { color: colors.primary }]}>Your Rights</Text>
                 <Text style={[styles.privacyText, { color: colors.text }]}>
                   • Access your personal data{'\n'}
                   • Request data correction or deletion{'\n'}
                   • Opt-out of notifications{'\n'}
                   • Contact us with privacy concerns
                 </Text>
               </View>
               
               <View style={styles.privacySection}>
                 <Text style={[styles.privacyTitle, { color: colors.primary }]}>Contact Us</Text>
                 <Text style={[styles.privacyText, { color: colors.text }]}>
                   For privacy-related questions:{'\n'}
                   Email: privacy@mangrovewatch.gov{'\n'}
                   Address: Government Data Protection Office{'\n'}
                   Last updated: {new Date().toLocaleDateString()}
                 </Text>
               </View>
             </ScrollView>
           </View>
         </View>
       </Modal>
       </LinearGradient>
     </View>
   );
 }

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
  },
     
  scrollView: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
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
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: '#fff',
    fontSize: 24,
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
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    fontWeight: '600',
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
    borderBottomColor: '#F0F0F0',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    marginLeft: 12,
    fontWeight: '500',
  },
  settingValue: {
    fontSize: 14,
    fontWeight: '500',
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
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
     maxHeight: '85%',
    borderRadius: 16,
     padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
   closeButton: {
     padding: 4,
  },
  modalBody: {
    flex: 1,
      paddingVertical: 20,
      paddingHorizontal: 16,
    },
    modalSubtitle: {
      fontSize: 14,
      marginBottom: 24,
      textAlign: 'center',
      lineHeight: 20,
    },
    inputContainer: {
      marginBottom: 20,
      paddingHorizontal: 4,
    },
       inputLabel: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 12,
      color: '#333333',
    },
       passwordHint: {
      fontSize: 12,
      fontStyle: 'italic',
      textAlign: 'center',
      marginTop: 12,
      marginBottom: 8,
      opacity: 0.7,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
     marginTop: 24,
     paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  modalButton: {
    flex: 1,
      paddingVertical: 16,
    paddingHorizontal: 20,
      borderRadius: 10,
      marginHorizontal: 6,
    alignItems: 'center',
      justifyContent: 'center',
      minHeight: 48,
    },
   cancelButton: {
     borderWidth: 1,
   },
   updateButton: {
     shadowColor: '#000',
     shadowOffset: { width: 0, height: 2 },
     shadowOpacity: 0.1,
     shadowRadius: 4,
     elevation: 3,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
     paddingVertical: 14,
    fontSize: 16,
     minHeight: 48,
     marginTop: 4,
     backgroundColor: '#ffffff',
     borderColor: '#e0e0e0',
     color: '#333333',
     textAlignVertical: 'center',
     includeFontPadding: false,
  },
  // Help & Support Styles
  helpSection: {
    marginBottom: 24,
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    lineHeight: 20,
  },
  // Privacy Policy Styles
  privacySection: {
    marginBottom: 24,
  },
  privacyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  privacyText: {
    fontSize: 14,
    lineHeight: 20,
  },
  // New Password Modal Styles
  passwordModalContent: {
    width: '90%',
    maxHeight: '85%',
    borderRadius: 16,
    padding: 24,
    backgroundColor: '#ffffff',
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
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  passwordModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  passwordCloseButton: {
    padding: 4,
  },
  passwordModalBody: {
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  passwordModalSubtitle: {
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
    color: '#666666',
  },
  passwordInputContainer: {
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  passwordInputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333333',
  },
  passwordInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    minHeight: 48,
    marginTop: 4,
    backgroundColor: '#ffffff',
    borderColor: '#e0e0e0',
    color: '#333333',
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  passwordHint: {
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 8,
    opacity: 0.7,
    color: '#666666',
  },
  passwordModalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  passwordCancelButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  passwordCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  passwordUpdateButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    backgroundColor: '#2E8B57',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  passwordUpdateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
