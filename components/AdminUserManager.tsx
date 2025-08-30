import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { ActionButton } from './ActionButton';
import { getUsers, searchUsers, updateUserProfile } from '@/services/firebaseService';
import { User } from '@/types/user';

export const AdminUserManager: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    if (currentUser && currentUser.role === 'admin') {
      loadUsers();
    }
  }, [currentUser]);

  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const allUsers = await getUsers(100);
      setUsers(allUsers);
      setFilteredUsers(allUsers);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserAction = async (action: string, targetUser: User) => {
    if (!currentUser) return;

    let message = '';
    let updates: Partial<User> = {};

    switch (action) {
      case 'activate':
        message = `Are you sure you want to activate ${targetUser.name}?`;
        updates = { isActive: true };
        break;
      case 'deactivate':
        message = `Are you sure you want to deactivate ${targetUser.name}?`;
        updates = { isActive: false };
        break;
      case 'promote':
        message = `Are you sure you want to promote ${targetUser.name} to admin?`;
        updates = { 
          role: 'admin',
          permissions: [
            'manage_users',
            'view_reports',
            'approve_reports',
            'manage_leaderboard',
            'view_analytics',
            'system_settings'
          ]
        };
        break;
      case 'demote':
        message = `Are you sure you want to demote ${targetUser.name} to coastal community user?`;
        updates = { 
          role: 'coastal_communities',
          permissions: ['submit_reports', 'view_own_reports', 'view_leaderboard', 'view_community_reports']
        };
        break;
      default:
        return;
    }

    Alert.alert(
      'Confirm Action',
      message,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: 'destructive',
          onPress: async () => {
            try {
              await updateUserProfile(targetUser.id, updates);
              Alert.alert('Success', `User ${action}d successfully`);
              await loadUsers(); // Refresh user list
            } catch (error: any) {
              Alert.alert('Error', error.message || `Failed to ${action} user`);
            }
          }
        }
      ]
    );
  };

  const getUserRoleColor = (role: string) => {
    switch (role) {
      case 'super_user':
        return '#FFD700'; // Gold
      case 'admin':
        return '#FF6B6B'; // Red
      default:
        return '#4ECDC4'; // Teal
    }
  };

  const getUserStatusIcon = (isActive: boolean) => {
    return isActive ? '🟢' : '🔴';
  };

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.errorText}>Access denied. Admin privileges required.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>User Management</ThemedText>
          <ThemedText style={styles.subtitle}>Manage user accounts and permissions</ThemedText>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search users by name or email..."
            placeholderTextColor="#999"
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
          <TouchableOpacity style={styles.refreshButton} onPress={loadUsers}>
            <Text style={styles.refreshButtonText}>🔄</Text>
          </TouchableOpacity>
        </View>

        {/* User Statistics */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <ThemedText style={styles.statNumber}>{filteredUsers.length}</ThemedText>
            <ThemedText style={styles.statLabel}>Total Users</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText style={styles.statNumber}>
              {filteredUsers.filter(u => u.role === 'admin').length}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Admins</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText style={styles.statNumber}>
              {filteredUsers.filter(u => u.isActive).length}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Active</ThemedText>
          </View>
        </View>

        {/* Users List */}
        <View style={styles.usersContainer}>
          <ThemedText style={styles.sectionTitle}>Users</ThemedText>
          
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ThemedText style={styles.loadingText}>Loading users...</ThemedText>
            </View>
          ) : filteredUsers.length === 0 ? (
            <View style={styles.emptyContainer}>
              <ThemedText style={styles.emptyText}>No users found</ThemedText>
            </View>
          ) : (
            <View style={styles.usersList}>
              {filteredUsers.map((user) => (
                <View key={user.id} style={styles.userCard}>
                  <View style={styles.userHeader}>
                    <View style={styles.userInfo}>
                      <Text style={styles.userName}>{user.name}</Text>
                      <Text style={styles.userEmail}>{user.email}</Text>
                      <View style={styles.userMeta}>
                        <Text style={[styles.userRole, { color: getUserRoleColor(user.role) }]}>
                          {user.role.toUpperCase()}
                        </Text>
                        <Text style={styles.userStatus}>
                          {getUserStatusIcon(user.isActive)} {user.isActive ? 'Active' : 'Inactive'}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.userStats}>
                      <Text style={styles.userPoints}>{user.points} pts</Text>
                      <Text style={styles.userBadge}>{user.badgeEmoji} {user.badge}</Text>
                    </View>
                  </View>

                  <View style={styles.userActions}>
                    {(user.role === 'coastal_communities' || user.role === 'conservation_ngos' || user.role === 'government_forestry' || user.role === 'researchers') && (
                      <TouchableOpacity
                        style={[styles.actionButton, styles.promoteButton]}
                        onPress={() => handleUserAction('promote', user)}
                      >
                        <Text style={styles.actionButtonText}>Promote to Admin</Text>
                      </TouchableOpacity>
                    )}
                    
                    {user.role === 'admin' && (
                      <TouchableOpacity
                        style={[styles.actionButton, styles.demoteButton]}
                        onPress={() => handleUserAction('demote', user)}
                      >
                        <Text style={styles.actionButtonText}>Demote to Coastal Community</Text>
                      </TouchableOpacity>
                    )}

                    {user.isActive ? (
                      <TouchableOpacity
                        style={[styles.actionButton, styles.deactivateButton]}
                        onPress={() => handleUserAction('deactivate', user)}
                      >
                        <Text style={styles.actionButtonText}>Deactivate</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={[styles.actionButton, styles.activateButton]}
                        onPress={() => handleUserAction('activate', user)}
                      >
                        <Text style={styles.actionButtonText}>Activate</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 16,
  },
  refreshButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshButtonText: {
    fontSize: 18,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  usersContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  usersList: {
    gap: 16,
  },
  userCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
    marginBottom: 8,
  },
  userMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  userRole: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  userStatus: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
  },
  userStats: {
    alignItems: 'flex-end',
  },
  userPoints: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 4,
  },
  userBadge: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
  },
  userActions: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 100,
    alignItems: 'center',
  },
  promoteButton: {
    backgroundColor: '#4CAF50',
  },
  demoteButton: {
    backgroundColor: '#FF9800',
  },
  activateButton: {
    backgroundColor: '#4CAF50',
  },
  deactivateButton: {
    backgroundColor: '#F44336',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    opacity: 0.7,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.7,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#ff6b6b',
  },
}); 