import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { createAdminUser } from '@/services/firebaseService';
import { ActionButton } from '@/components/ActionButton';
import { router } from 'expo-router';

export default function AdminManagementScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user, logout } = useAuth();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin' as 'admin' | 'super_user'
  });
  const [isLoading, setIsLoading] = useState(false);

  // Only super users can access this screen
  if (!user || user.role !== 'super_user') {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#1a1a2e', '#16213e', '#0f3460']}
          style={styles.gradientBackground}
        >
          <View style={styles.accessDenied}>
            <Text style={styles.accessDeniedText}>🚫 Access Denied</Text>
            <Text style={styles.accessDeniedSubtext}>
              Only Super Users can manage admin accounts.
            </Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  const handleCreateAdmin = async () => {
    if (!newAdmin.name.trim() || !newAdmin.email.trim() || !newAdmin.password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newAdmin.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    
    try {
      await createAdminUser(
        newAdmin.email,
        newAdmin.password,
        newAdmin.name,
        newAdmin.role
      );
      
      Alert.alert(
        'Success! 🎉',
        `Admin user "${newAdmin.name}" created successfully.`,
        [
          {
            text: 'OK',
            onPress: () => {
              setIsModalVisible(false);
              setNewAdmin({ name: '', email: '', password: '', role: 'admin' });
            }
          }
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create admin user');
    }
    
    setIsLoading(false);
  };

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
            <Text style={styles.title}>👑 Admin Management</Text>
            <Text style={styles.subtitle}>
              Manage administrative accounts and permissions
            </Text>
          </View>

          {/* Quick Stats */}
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Ionicons name="shield-checkmark" size={24} color="#4169E1" />
              <Text style={styles.statNumber}>2</Text>
              <Text style={styles.statLabel}>Total Admins</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="crown" size={24} color="#FFD700" />
              <Text style={styles.statNumber}>1</Text>
              <Text style={styles.statLabel}>Super Users</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="people" size={24} color="#32CD32" />
              <Text style={styles.statNumber}>5</Text>
              <Text style={styles.statLabel}>Active Users</Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actionsCard}>
            <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => setIsModalVisible(true)}
            >
              <Ionicons name="add-circle-outline" size={32} color="#32CD32" />
              <Text style={styles.actionText}>Create New Admin</Text>
              <Text style={styles.actionSubtext}>Add a new administrator account</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="list-outline" size={32} color="#4169E1" />
              <Text style={styles.actionText}>View All Admins</Text>
              <Text style={styles.actionSubtext}>See all administrative accounts</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="settings-outline" size={32} color="#FFA500" />
              <Text style={styles.actionText}>Manage Permissions</Text>
              <Text style={styles.actionSubtext}>Configure admin access levels</Text>
            </TouchableOpacity>
          </View>

          {/* Admin List Preview */}
          <View style={styles.adminListCard}>
            <Text style={styles.sectionTitle}>👥 Current Admins</Text>
            
            <View style={styles.adminItem}>
              <View style={styles.adminAvatar}>
                <Text style={styles.adminAvatarText}>👑</Text>
              </View>
              <View style={styles.adminInfo}>
                <Text style={styles.adminName}>Super Admin</Text>
                <Text style={styles.adminEmail}>super@mangrovewatch.com</Text>
                <Text style={styles.adminRole}>Super User</Text>
              </View>
              <View style={styles.adminStatus}>
                <Text style={styles.statusActive}>🟢 Active</Text>
              </View>
            </View>

            <View style={styles.adminItem}>
              <View style={styles.adminAvatar}>
                <Text style={styles.adminAvatarText}>🛡️</Text>
              </View>
              <View style={styles.adminInfo}>
                <Text style={styles.adminName}>Admin User</Text>
                <Text style={styles.adminEmail}>admin@mangrovewatch.com</Text>
                <Text style={styles.adminRole}>Admin</Text>
              </View>
              <View style={styles.adminStatus}>
                <Text style={styles.statusActive}>🟢 Active</Text>
              </View>
            </View>
          </View>

          {/* Logout Button */}
          <View style={styles.logoutContainer}>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={() => {
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
              }}
            >
              <Text style={styles.logoutButtonText}>🚪 Logout</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Create Admin Modal */}
        <Modal
          visible={isModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Create New Admin</Text>
                <TouchableOpacity 
                  onPress={() => setIsModalVisible(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Name</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Enter admin name"
                  value={newAdmin.name}
                  onChangeText={(text) => setNewAdmin({...newAdmin, name: text})}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Email</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Enter admin email"
                  value={newAdmin.email}
                  onChangeText={(text) => setNewAdmin({...newAdmin, email: text})}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Password</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Enter admin password"
                  value={newAdmin.password}
                  onChangeText={(text) => setNewAdmin({...newAdmin, password: text})}
                  secureTextEntry
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Role</Text>
                <View style={styles.roleSelector}>
                  <TouchableOpacity
                    style={[
                      styles.roleButton,
                      newAdmin.role === 'admin' && styles.roleButtonActive
                    ]}
                    onPress={() => setNewAdmin({...newAdmin, role: 'admin'})}
                  >
                    <Text style={[
                      styles.roleButtonText,
                      newAdmin.role === 'admin' && styles.roleButtonTextActive
                    ]}>
                      🛡️ Admin
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.roleButton,
                      newAdmin.role === 'super_user' && styles.roleButtonActive
                    ]}
                    onPress={() => setNewAdmin({...newAdmin, role: 'super_user'})}
                  >
                    <Text style={[
                      styles.roleButtonText,
                      newAdmin.role === 'super_user' && styles.roleButtonTextActive
                    ]}>
                      👑 Super User
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <ActionButton
                title={isLoading ? "Creating..." : "Create Admin"}
                onPress={handleCreateAdmin}
                variant="primary"
                style={styles.createButton}
                disabled={isLoading}
              />
            </View>
          </View>
        </Modal>
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
  statsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  actionsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a2e',
    marginLeft: 12,
    flex: 1,
  },
  actionSubtext: {
    fontSize: 12,
    color: '#666',
    marginLeft: 12,
  },
  adminListCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  adminItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 12,
  },
  adminAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e9ecef',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  adminAvatarText: {
    fontSize: 20,
  },
  adminInfo: {
    flex: 1,
  },
  adminName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a2e',
  },
  adminEmail: {
    fontSize: 14,
    color: '#666',
  },
  adminRole: {
    fontSize: 12,
    color: '#4169E1',
    fontWeight: '600',
  },
  adminStatus: {
    alignItems: 'flex-end',
  },
  statusActive: {
    fontSize: 12,
    color: '#32CD32',
    fontWeight: '600',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a2e',
  },
  closeButton: {
    padding: 4,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  roleSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  roleButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  roleButtonActive: {
    borderColor: '#1a1a2e',
    backgroundColor: '#1a1a2e',
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  roleButtonTextActive: {
    color: '#fff',
  },
  createButton: {
    marginTop: 16,
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