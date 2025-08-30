import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { getUsers, updateUserProfile, User } from '@/services/firebaseService';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export const AdminUserManager: React.FC = () => {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
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
      let roleData: any = {};
      
      switch (newRole) {
        case 'coastal_communities':
          roleData = {
            role: 'ngo',
            badge: 'Coastal Communities',
            permissions: ['view_incident_pictures', 'view_incident_descriptions', 'view_user_names', 'view_ai_validation_status', 'view_incident_reports']
          };
          break;
        case 'conservation_ngos':
          roleData = {
            role: 'ngo',
            badge: 'Conservation NGOs',
            permissions: ['view_incident_pictures', 'view_incident_descriptions', 'view_user_names', 'view_ai_validation_status', 'view_incident_reports']
          };
          break;
        case 'government_forestry':
          roleData = {
            role: 'ngo',
            badge: 'Government Forestry Departments',
            permissions: ['view_incident_pictures', 'view_incident_descriptions', 'view_user_names', 'view_ai_validation_status', 'view_incident_reports']
          };
          break;
        case 'researchers':
          roleData = {
            role: 'ngo',
            badge: 'Researchers',
            permissions: ['view_incident_pictures', 'view_incident_descriptions', 'view_user_names', 'view_ai_validation_status', 'view_incident_reports']
          };
          break;
        default:
          roleData = { role: newRole };
      }

      await updateUserProfile(selectedUser.id, roleData);
      Alert.alert('Success', 'User role updated successfully');
      setShowRoleModal(false);
      setSelectedUser(null);
      await loadUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      Alert.alert('Error', 'Failed to update user role');
    }
  };

  const getUserRoleColor = (role: string) => {
    switch (role) {
      case 'super_user':
        return '#FFD700';
      case 'admin':
        return '#4169E1';
      case 'ngo':
        return '#32CD32';
      default:
        return '#32CD32';
    }
  };

  const getUserStatusIcon = (isActive: boolean) => {
    return isActive ? 'Active' : 'Inactive';
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? '#32CD32' : '#FF6B6B';
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={[styles.loadingText, { color: isDarkMode ? '#ccc' : '#666' }]}>Loading users...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
      <ScrollView style={styles.usersList} showsVerticalScrollIndicator={false}>
        {filteredUsers.map((userItem) => (
          <View key={userItem.id} style={[styles.userCard, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.95)' }]}>
            <View style={styles.userInfo}>
              <View style={styles.userHeader}>
                <Text style={[styles.userName, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>{userItem.name}</Text>
                <View style={[styles.roleBadge, { backgroundColor: getUserRoleColor(userItem.role) }]}>
                  <Text style={styles.roleText}>{userItem.role.toUpperCase()}</Text>
                </View>
              </View>
              <Text style={[styles.userEmail, { color: isDarkMode ? '#ccc' : '#666' }]}>{userItem.email}</Text>
              <View style={styles.userMeta}>
                <Text style={[styles.userMetaText, { color: isDarkMode ? '#ccc' : '#666' }]}>Points: {userItem.points}</Text>
                <Text style={[styles.userStatus, { color: getStatusColor(userItem.isActive) }]}>
                  {getUserStatusIcon(userItem.isActive)}
                </Text>
              </View>
            </View>
            
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
        ))}
      </ScrollView>

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
              <Text style={[styles.modalTitle, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>Change Role for {selectedUser?.name}</Text>
              <TouchableOpacity onPress={() => setShowRoleModal(false)}>
                <Text style={[styles.closeButton, { color: isDarkMode ? '#fff' : '#666' }]}>✕</Text>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  searchContainer: {
    marginBottom: 20,
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
  usersList: {
    flex: 1,
  },
  userCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  userInfo: {
    marginBottom: 16,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a2e',
    flex: 1,
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginLeft: 12,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'uppercase',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  userMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userMetaText: {
    fontSize: 14,
    color: '#666',
  },
  userStatus: {
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
    color: '#fff',
    flex: 1,
  },
  closeButton: {
    fontSize: 24,
    color: '#fff',
    opacity: 0.7,
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
    color: '#fff',
    textAlign: 'center',
    fontWeight: '500',
  },
}); 