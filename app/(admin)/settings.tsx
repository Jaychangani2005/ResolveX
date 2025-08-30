import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { updateUserPassword } from '@/services/firebaseService';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Dimensions, Modal, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const { themeMode, isDarkMode, setThemeMode } = useTheme();
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const getRoleBadge = () => {
    if (user?.role === 'super_user') {
      return { text: 'Super User', color: '#FFD700' };
    } else if (user?.role === 'admin') {
      return { text: 'Admin', color: '#4169E1' };
    }
    return { text: 'User', color: '#32CD32' };
  };

  const roleBadge = getRoleBadge();

  const handlePasswordChange = async () => {
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
      Alert.alert('Success', 'Password updated successfully');
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleExportData = () => {
    Alert.alert('Export Data', 'Data export functionality will be implemented soon.');
  };

  const handleAbout = () => {
    setShowAboutModal(true);
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
            await logout();
            router.replace('/login');
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={isDarkMode ? ['#0f0f23', '#1a1a2e', '#16213e'] : ['#f8f9fa', '#e9ecef', '#dee2e6']}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.welcomeSection}>
              <Text style={[styles.welcomeText, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>Settings</Text>
              <Text style={[styles.adminName, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>{user?.name}</Text>
              <View style={[styles.roleBadge, { backgroundColor: roleBadge.color }]}>
                <Text style={styles.roleText}>{roleBadge.text}</Text>
              </View>
            </View>
          </View>

          {/* Settings Sections */}
          <View style={[styles.settingsCard, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.95)' }]}>
            <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>Appearance</Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Ionicons name="moon" size={24} color={isDarkMode ? '#FFD700' : '#666'} />
                <Text style={[styles.settingLabel, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>Dark Mode</Text>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={(value) => setThemeMode(value ? 'dark' : 'light')}
                trackColor={{ false: '#767577', true: '#4169E1' }}
                thumbColor={isDarkMode ? '#FFD700' : '#f4f3f4'}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Ionicons name="settings" size={24} color={themeMode === 'system' ? '#32CD32' : '#666'} />
                <Text style={[styles.settingLabel, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>Follow System</Text>
              </View>
              <Switch
                value={themeMode === 'system'}
                onValueChange={(value) => setThemeMode(value ? 'system' : (isDarkMode ? 'dark' : 'light'))}
                trackColor={{ false: '#767577', true: '#32CD32' }}
                thumbColor={themeMode === 'system' ? '#fff' : '#f4f3f4'}
              />
            </View>
          </View>

          <View style={[styles.settingsCard, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.95)' }]}>
            <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>Notifications</Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Ionicons name="mail" size={24} color={emailUpdates ? '#32CD32' : '#666'} />
                <Text style={[styles.settingLabel, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>Email Updates</Text>
              </View>
              <Switch
                value={emailUpdates}
                onValueChange={setEmailUpdates}
                trackColor={{ false: '#767577', true: '#32CD32' }}
                thumbColor={emailUpdates ? '#fff' : '#f4f3f4'}
              />
            </View>
          </View>

          <View style={[styles.settingsCard, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.95)' }]}>
            <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>Account</Text>
            
            <TouchableOpacity 
              style={styles.settingButton}
              onPress={() => setShowPasswordModal(true)}
            >
              <View style={styles.settingInfo}>
                <Ionicons name="lock-closed" size={24} color="#4169E1" />
                <Text style={[styles.settingLabel, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>Change Password</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={isDarkMode ? '#ccc' : '#666'} />
            </TouchableOpacity>
          </View>

          <View style={[styles.settingsCard, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.95)' }]}>
            <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>Data & Privacy</Text>
            
            <TouchableOpacity 
              style={styles.settingButton}
              onPress={handleExportData}
            >
              <View style={styles.settingInfo}>
                <Ionicons name="download" size={24} color="#FFA500" />
                <Text style={[styles.settingLabel, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>Export Data</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={isDarkMode ? '#ccc' : '#666'} />
            </TouchableOpacity>
          </View>

          <View style={[styles.settingsCard, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.95)' }]}>
            <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>About</Text>
            
            <TouchableOpacity 
              style={styles.settingButton}
              onPress={handleAbout}
            >
              <View style={styles.settingInfo}>
                <Ionicons name="information-circle" size={24} color="#32CD32" />
                <Text style={[styles.settingLabel, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>About ResolveX</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={isDarkMode ? '#ccc' : '#666'} />
            </TouchableOpacity>
          </View>

          {/* System Information */}
          <View style={[styles.systemInfoCard, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.95)' }]}>
            <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>System Information</Text>
            <View style={styles.systemInfo}>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: isDarkMode ? '#ccc' : '#666' }]}>App Version:</Text>
                <Text style={[styles.infoValue, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>1.0.0</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: isDarkMode ? '#ccc' : '#666' }]}>Build Number:</Text>
                <Text style={[styles.infoValue, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>2024.1.0</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: isDarkMode ? '#ccc' : '#666' }]}>Platform:</Text>
                <Text style={[styles.infoValue, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>React Native</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: isDarkMode ? '#ccc' : '#666' }]}>Theme Mode:</Text>
                <Text style={[styles.infoValue, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>{themeMode.charAt(0).toUpperCase() + themeMode.slice(1)}</Text>
              </View>
            </View>
          </View>

          {/* Logout Button */}
          <View style={styles.logoutContainer}>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>

      {/* Password Change Modal */}
      <Modal
        visible={showPasswordModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDarkMode ? '#1a1a2e' : '#fff' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>Change Password</Text>
              <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
                <Text style={[styles.closeButton, { color: isDarkMode ? '#fff' : '#666' }]}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <TextInput
                style={[styles.passwordInput, { 
                  backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#f8f9fa',
                  color: isDarkMode ? '#fff' : '#1a1a2e',
                  borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : '#e9ecef'
                }]}
                placeholder="Current Password"
                placeholderTextColor={isDarkMode ? '#ccc' : '#666'}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry
              />
              
              <TextInput
                style={[styles.passwordInput, { 
                  backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#f8f9fa',
                  color: isDarkMode ? '#fff' : '#1a1a2e',
                  borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : '#e9ecef'
                }]}
                placeholder="New Password"
                placeholderTextColor={isDarkMode ? '#ccc' : '#666'}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
              />
              
              <TextInput
                style={[styles.passwordInput, { 
                  backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#f8f9fa',
                  color: isDarkMode ? '#fff' : '#1a1a2e',
                  borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : '#e9ecef'
                }]}
                placeholder="Confirm New Password"
                placeholderTextColor={isDarkMode ? '#ccc' : '#666'}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowPasswordModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handlePasswordChange}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* About ResolveX Modal */}
      <Modal
        visible={showAboutModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAboutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDarkMode ? '#1a1a2e' : '#fff' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>About ResolveX</Text>
              <TouchableOpacity onPress={() => setShowAboutModal(false)}>
                <Text style={[styles.closeButton, { color: isDarkMode ? '#fff' : '#666' }]}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <View style={styles.aboutSection}>
                <Text style={[styles.aboutLabel, { color: isDarkMode ? '#ccc' : '#666' }]}>Description</Text>
                <TextInput
                  style={[styles.aboutTextbox, { 
                    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#f8f9fa',
                    color: isDarkMode ? '#fff' : '#1a1a2e',
                    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : '#e9ecef'
                  }]}
                  value="ResolveX is a comprehensive environmental incident reporting and management platform designed to connect communities, NGOs, and government agencies in the fight against environmental degradation."
                  multiline
                  numberOfLines={6}
                  editable={false}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.aboutSection}>
                <Text style={[styles.aboutLabel, { color: isDarkMode ? '#ccc' : '#666' }]}>Version Information</Text>
                <View style={styles.versionInfo}>
                  <View style={styles.versionRow}>
                    <Text style={[styles.versionLabel, { color: isDarkMode ? '#ccc' : '#666' }]}>Version:</Text>
                    <Text style={[styles.versionValue, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>1.0.0</Text>
                  </View>
                  <View style={styles.versionRow}>
                    <Text style={[styles.versionLabel, { color: isDarkMode ? '#ccc' : '#666' }]}>Build:</Text>
                    <Text style={[styles.versionValue, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>2024.1.0</Text>
                  </View>
                  <View style={styles.versionRow}>
                    <Text style={[styles.versionLabel, { color: isDarkMode ? '#ccc' : '#666' }]}>Platform:</Text>
                    <Text style={[styles.versionValue, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>React Native</Text>
                  </View>
                </View>
              </View>

              <View style={styles.aboutSection}>
                <Text style={[styles.aboutLabel, { color: isDarkMode ? '#ccc' : '#666' }]}>Features</Text>
                <TextInput
                  style={[styles.aboutTextbox, { 
                    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#f8f9fa',
                    color: isDarkMode ? '#fff' : '#1a1a2e',
                    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : '#e9ecef'
                  }]}
                  value="• Environmental incident reporting\n• AI-powered validation\n• Community engagement\n• NGO collaboration\n• Government agency integration\n• Real-time monitoring\n• Data analytics and insights"
                  multiline
                  numberOfLines={8}
                  editable={false}
                  textAlignVertical="top"
                />
              </View>
            </ScrollView>
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.closeAboutButton]}
                onPress={() => setShowAboutModal(false)}
              >
                <Text style={styles.closeAboutButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
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
  gradientBackground: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  welcomeSection: {
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 18,
    opacity: 0.8,
  },
  adminName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  roleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  settingsCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  systemInfoCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  systemInfo: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  logoutContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoutButton: {
    backgroundColor: '#DC143C',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    minWidth: 200,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  closeButton: {
    fontSize: 24,
    opacity: 0.7,
  },
  modalBody: {
    flex: 1,
    marginBottom: 24,
  },
  passwordInput: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  saveButton: {
    backgroundColor: '#4169E1',
  },
  closeAboutButton: {
    backgroundColor: '#32CD32',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  closeAboutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // About modal styles
  aboutSection: {
    marginBottom: 24,
  },
  aboutLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  aboutTextbox: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
    minHeight: 120,
    textAlignVertical: 'top',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  versionInfo: {
    gap: 12,
  },
  versionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  versionLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  versionValue: {
    fontSize: 14,
    fontWeight: '600',
  },
}); 