import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [autoSync, setAutoSync] = useState(false);
  const [darkMode, setDarkMode] = useState(colorScheme === 'dark');

  // Only admin or super user can access this screen
  if (!user || (user.role !== 'admin' && user.role !== 'super_user')) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#1a1a2e', '#16213e', '#0f3460']}
          style={styles.gradientBackground}
        >
          <View style={styles.accessDenied}>
            <Text style={styles.accessDeniedText}>🚫 Access Denied</Text>
            <Text style={styles.accessDeniedSubtext}>
              Only Administrators can access settings.
            </Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

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

  const handleSettingChange = (setting: string, value: boolean) => {
    switch (setting) {
      case 'notifications':
        setNotifications(value);
        break;
      case 'emailUpdates':
        setEmailUpdates(value);
        break;
      case 'autoSync':
        setAutoSync(value);
        break;
      case 'darkMode':
        setDarkMode(value);
        break;
    }
  };

  const getRoleBadge = () => {
    if (user?.role === 'super_user') {
      return { text: 'Super User', emoji: '👑', color: '#FFD700' };
    } else if (user?.role === 'admin') {
      return { text: 'Admin', emoji: '🛡️', color: '#4169E1' };
    }
    return { text: 'User', emoji: '👤', color: '#32CD32' };
  };

  const roleBadge = getRoleBadge();

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>⚙️ Settings</Text>
            <Text style={styles.subtitle}>
              Configure your administrative preferences
            </Text>
          </View>

          {/* User Info */}
          <View style={styles.userCard}>
            <View style={styles.userAvatar}>
              <Text style={styles.userAvatarText}>
                {user?.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.name}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
              <View style={[styles.roleBadge, { backgroundColor: roleBadge.color }]}>
                <Text style={styles.roleEmoji}>{roleBadge.emoji}</Text>
                <Text style={styles.roleText}>{roleBadge.text}</Text>
              </View>
            </View>
          </View>

          {/* Notification Settings */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>🔔 Notifications</Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Ionicons name="notifications-outline" size={24} color="#4169E1" />
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Push Notifications</Text>
                  <Text style={styles.settingDesc}>Receive alerts for new reports</Text>
                </View>
              </View>
              <Switch
                value={notifications}
                onValueChange={(value) => handleSettingChange('notifications', value)}
                trackColor={{ false: '#e0e0e0', true: '#4169E1' }}
                thumbColor={notifications ? '#fff' : '#f4f3f4'}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Ionicons name="mail-outline" size={24} color="#32CD32" />
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Email Updates</Text>
                  <Text style={styles.settingDesc}>Get weekly summary emails</Text>
                </View>
              </View>
              <Switch
                value={emailUpdates}
                onValueChange={(value) => handleSettingChange('emailUpdates', value)}
                trackColor={{ false: '#e0e0e0', true: '#32CD32' }}
                thumbColor={emailUpdates ? '#fff' : '#f4f3f4'}
              />
            </View>
          </View>

          {/* System Settings */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>🔧 System</Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Ionicons name="sync-outline" size={24} color="#FFA500" />
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Auto Sync</Text>
                  <Text style={styles.settingDesc}>Automatically sync data</Text>
                </View>
              </View>
              <Switch
                value={autoSync}
                onValueChange={(value) => handleSettingChange('autoSync', value)}
                trackColor={{ false: '#e0e0e0', true: '#FFA500' }}
                thumbColor={autoSync ? '#fff' : '#f4f3f4'}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Ionicons name="moon-outline" size={24} color="#9B59B6" />
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Dark Mode</Text>
                  <Text style={styles.settingDesc}>Use dark theme</Text>
                </View>
              </View>
              <Switch
                value={darkMode}
                onValueChange={(value) => handleSettingChange('darkMode', value)}
                trackColor={{ false: '#e0e0e0', true: '#9B59B6' }}
                thumbColor={darkMode ? '#fff' : '#f4f3f4'}
              />
            </View>
          </View>

          {/* Security Settings */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>🔒 Security</Text>
            
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Ionicons name="key-outline" size={24} color="#E74C3C" />
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Change Password</Text>
                  <Text style={styles.settingDesc}>Update your login credentials</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Ionicons name="shield-outline" size={24} color="#3498DB" />
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Two-Factor Auth</Text>
                  <Text style={styles.settingDesc}>Enable 2FA for extra security</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Ionicons name="log-out-outline" size={24} color="#E67E22" />
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Active Sessions</Text>
                  <Text style={styles.settingDesc}>Manage your login sessions</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Data Management */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>📊 Data Management</Text>
            
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Ionicons name="download-outline" size={24} color="#27AE60" />
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Export Data</Text>
                  <Text style={styles.settingDesc}>Download your data</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Ionicons name="trash-outline" size={24} color="#E74C3C" />
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Clear Cache</Text>
                  <Text style={styles.settingDesc}>Free up storage space</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* About */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>ℹ️ About</Text>
            
            <View style={styles.aboutItem}>
              <Text style={styles.aboutLabel}>App Version</Text>
              <Text style={styles.aboutValue}>1.0.0</Text>
            </View>
            
            <View style={styles.aboutItem}>
              <Text style={styles.aboutLabel}>Build Number</Text>
              <Text style={styles.aboutValue}>20241215</Text>
            </View>
            
            <View style={styles.aboutItem}>
              <Text style={styles.aboutLabel}>Last Updated</Text>
              <Text style={styles.aboutValue}>December 15, 2024</Text>
            </View>
          </View>

          {/* Logout Button */}
          <View style={styles.logoutContainer}>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Text style={styles.logoutButtonText}>🚪 Logout</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
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
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
    textAlign: 'center',
  },
  userCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e9ecef',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  userAvatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#666',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    gap: 6,
  },
  roleEmoji: {
    fontSize: 14,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  sectionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
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
    color: '#1a1a2e',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 16,
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a2e',
    marginBottom: 2,
  },
  settingDesc: {
    fontSize: 14,
    color: '#666',
  },
  aboutItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  aboutLabel: {
    fontSize: 16,
    color: '#666',
  },
  aboutValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a2e',
  },
  accessDenied: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  accessDeniedText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  accessDeniedSubtext: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
    textAlign: 'center',
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
}); 