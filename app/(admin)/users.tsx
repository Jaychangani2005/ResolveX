import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { getUsers, updateUserProfile, updateUserRole } from '@/services/firebaseService';
import { User } from '@/types/user';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function UsersScreen() {
  const { user, logout } = useAuth();
  const { isDarkMode } = useTheme();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    const filtered = users.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const allUsers = await getUsers(100);
      setUsers(allUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserAction = async (action: string, userId: string) => {
    try {
      const userToUpdate = users.find(u => u.id === userId);
      if (!userToUpdate) return;

      switch (action) {
        case 'activate':
          await updateUserProfile(userId, { isActive: true });
          Alert.alert('Success', 'User activated successfully');
          break;
        case 'deactivate':
          await updateUserProfile(userId, { isActive: false });
          Alert.alert('Success', 'User deactivated successfully');
          break;
        case 'change_role':
          setSelectedUser(userToUpdate);
          setShowRoleModal(true);
          return;
        default:
          break;
      }
      
      // Reload users after action
      await loadUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      Alert.alert('Error', 'Failed to update user');
    }
  };

  const handleRoleChange = async (newRole: string) => {
    if (!selectedUser) return;

    try {
      // First update the role using the dedicated function
      await updateUserRole(selectedUser.id, newRole as any);
      
      // Then update other profile data if needed
      let profileUpdates: any = {};
      
      switch (newRole) {
        case 'coastal_communities':
          profileUpdates = {
            badge: 'Coastal Communities',
            permissions: ['submit_reports', 'view_own_reports', 'view_leaderboard', 'view_community_reports']
          };
          break;
        case 'conservation_ngos':
          profileUpdates = {
            badge: 'Conservation NGOs',
            permissions: ['view_incident_pictures', 'view_incident_descriptions', 'view_user_names', 'view_ai_validation_status', 'view_incident_reports', 'view_analytics', 'submit_reports']
          };
          break;
        case 'government_forestry':
          profileUpdates = {
            badge: 'Government Forestry',
            permissions: ['view_incident_pictures', 'view_incident_descriptions', 'view_user_names', 'view_ai_validation_status', 'view_incident_reports', 'view_analytics', 'approve_reports', 'manage_reports', 'submit_reports']
          };
          break;
        case 'researchers':
          profileUpdates = {
            badge: 'Researcher',
            permissions: ['view_incident_pictures', 'view_incident_descriptions', 'view_user_names', 'view_ai_validation_status', 'view_incident_reports', 'view_analytics', 'export_data', 'submit_reports', 'view_research_data']
          };
          break;
      }

      // Update profile data if there are additional changes
      if (Object.keys(profileUpdates).length > 0) {
        await updateUserProfile(selectedUser.id, profileUpdates);
      }

      Alert.alert('Success', 'User role updated successfully');
      setShowRoleModal(false);
      setSelectedUser(null);
      await loadUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      Alert.alert('Error', 'Failed to update user role');
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return { text: 'Admin', color: '#4169E1' };
      case 'conservation_ngos':
        return { text: 'NGO', color: '#32CD32' };
      case 'government_forestry':
        return { text: 'Government', color: '#FF6B6B' };
      case 'researchers':
        return { text: 'Researcher', color: '#FFD700' };
      default:
        return { text: 'User', color: '#32CD32' };
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return {
      text: isActive ? 'Active' : 'Inactive',
      color: isActive ? '#32CD32' : '#FF6B6B'
    };
  };



  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={isDarkMode ? ['#0f0f23', '#1a1a2e', '#16213e'] : ['#f8f9fa', '#e9ecef', '#dee2e6']}
          style={styles.gradientBackground}
        >
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>Loading users...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

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
            <Text style={styles.title}>👥 User Management</Text>
            <Text style={styles.subtitle}>
              Manage user accounts and permissions
            </Text>
          </View>

          {/* Quick Stats */}
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Ionicons name="people" size={24} color="#4169E1" />
              <Text style={styles.statNumber}>{users.length}</Text>
              <Text style={styles.statLabel}>Total Users</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="shield-checkmark" size={24} color="#FFD700" />
              <Text style={styles.statNumber}>
                {users.filter(u => u.role === 'admin').length}
              </Text>
              <Text style={styles.statLabel}>Admins</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="checkmark-circle" size={24} color="#32CD32" />
              <Text style={styles.statNumber}>
                {users.filter(u => u.isActive).length}
              </Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <TextInput
              style={[styles.searchInput, { 
                backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.95)',
                color: isDarkMode ? '#fff' : '#1a1a2e',
                borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : '#e9ecef'
              }]}
              placeholder="Search users by name or email..."
              placeholderTextColor={isDarkMode ? '#ccc' : '#666'}
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
          </View>

          {/* Users List */}
          <View style={styles.usersContainer}>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((userItem) => {
                const roleBadge = getRoleBadge(userItem.role);
                const statusBadge = getStatusBadge(userItem.isActive);
                
                return (
                  <View key={userItem.id} style={[styles.userCard, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.95)' }]}>
                    <View style={styles.userHeader}>
                      <View style={styles.userInfo}>
                        <Text style={[styles.userName, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>{userItem.name}</Text>
                        <Text style={[styles.userEmail, { color: isDarkMode ? '#ccc' : '#666' }]}>{userItem.email}</Text>
                      </View>
                      <View style={styles.badgesContainer}>
                        <View style={[styles.roleBadge, { backgroundColor: roleBadge.color }]}>
                          <Text style={styles.roleText}>{roleBadge.text}</Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: statusBadge.color }]}>
                          <Text style={styles.statusText}>{statusBadge.text}</Text>
                        </View>
                      </View>
                    </View>
                    
                    <View style={styles.userDetails}>
                      <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, { color: isDarkMode ? '#ccc' : '#666' }]}>Points:</Text>
                        <Text style={[styles.detailValue, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>{userItem.points}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, { color: isDarkMode ? '#ccc' : '#666' }]}>Badge:</Text>
                        <Text style={[styles.detailValue, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>{userItem.badge}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, { color: isDarkMode ? '#ccc' : '#666' }]}>Joined:</Text>
                        <Text style={[styles.detailValue, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>
                          {new Date(userItem.createdAt).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.roleButton]}
                        onPress={() => handleUserAction('change_role', userItem.id)}
                      >
                        <Text style={styles.actionButtonText}>Change Role</Text>
                      </TouchableOpacity>
                      
                      {userItem.isActive ? (
                        <TouchableOpacity
                          style={[styles.actionButton, styles.deactivateButton]}
                          onPress={() => handleUserAction('deactivate', userItem.id)}
                        >
                          <Text style={styles.actionButtonText}>Deactivate</Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          style={[styles.actionButton, styles.activateButton]}
                          onPress={() => handleUserAction('activate', userItem.id)}
                        >
                          <Text style={styles.actionButtonText}>Activate</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })
            ) : (
              <View style={[styles.emptyState, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.95)' }]}>
                <Ionicons name="people-outline" size={48} color={isDarkMode ? '#ccc' : '#666'} />
                <Text style={[styles.emptyStateText, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>
                  {searchTerm ? 'No users found matching your search' : 'No users available'}
                </Text>
              </View>
            )}
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
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>

      {/* Role Change Modal */}
      <Modal
        visible={showRoleModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowRoleModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDarkMode ? '#1a1a2e' : '#fff' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>
                Change Role for {selectedUser?.name}
              </Text>
              <TouchableOpacity onPress={() => setShowRoleModal(false)}>
                <Ionicons name="close" size={24} color={isDarkMode ? '#fff' : '#666'} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.roleOptions}>
              <TouchableOpacity
                style={[styles.roleOption, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#f8f9fa' }]}
                onPress={() => handleRoleChange('coastal_communities')}
              >
                <Text style={[styles.roleOptionText, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>Coastal Communities</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.roleOption, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#f8f9fa' }]}
                onPress={() => handleRoleChange('conservation_ngos')}
              >
                <Text style={[styles.roleOptionText, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>Conservation NGOs</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.roleOption, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#f8f9fa' }]}
                onPress={() => handleRoleChange('government_forestry')}
              >
                <Text style={[styles.roleOptionText, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>Government Forestry Departments</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.roleOption, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#f8f9fa' }]}
                onPress={() => handleRoleChange('researchers')}
              >
                <Text style={[styles.roleOptionText, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>Researchers</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '500',
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 24,
  },
  statsCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
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
  searchContainer: {
    marginBottom: 24,
  },
  searchInput: {
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
  },
  usersContainer: {
    flex: 1,
    gap: 16,
  },
  userCard: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  userInfo: {
    flex: 1,
    marginRight: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
  },
  badgesContainer: {
    alignItems: 'flex-end',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'uppercase',
  },
  userDetails: {
    gap: 8,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
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
  roleButton: {
    backgroundColor: '#4169E1',
  },
  activateButton: {
    backgroundColor: '#32CD32',
  },
  deactivateButton: {
    backgroundColor: '#FF6B6B',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    borderRadius: 16,
    marginTop: 40,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    opacity: 0.7,
  },
  logoutContainer: {
    alignItems: 'center',
    marginTop: 40,
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1a1a2e',
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
  roleOptions: {
    gap: 12,
  },
  roleOption: {
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  roleOptionText: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
}); 