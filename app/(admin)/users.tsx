import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { getUsers, User } from '@/services/firebaseService';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function UserManagementScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user, logout } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUsers();
    }
  }, [user]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const usersList = await getUsers(100);
      setUsers(usersList);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
              Only Administrators can manage users.
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

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_user':
        return { text: 'Super User', emoji: '👑', color: '#FFD700' };
      case 'admin':
        return { text: 'Admin', emoji: '🛡️', color: '#4169E1' };
      default:
        return { text: 'User', emoji: '👤', color: '#32CD32' };
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive 
      ? { text: 'Active', emoji: '🟢', color: '#32CD32' }
      : { text: 'Inactive', emoji: '🔴', color: '#DC143C' };
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
                {users.filter(u => u.role === 'admin' || u.role === 'super_user').length}
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

          {/* Actions */}
          <View style={styles.actionsCard}>
            <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
            
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="search-outline" size={32} color="#4169E1" />
              <Text style={styles.actionText}>Search Users</Text>
              <Text style={styles.actionSubtext}>Find specific users</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="filter-outline" size={32} color="#32CD32" />
              <Text style={styles.actionText}>Filter by Role</Text>
              <Text style={styles.actionSubtext}>View users by permission level</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="download-outline" size={32} color="#FFA500" />
              <Text style={styles.actionText}>Export Data</Text>
              <Text style={styles.actionSubtext}>Download user information</Text>
            </TouchableOpacity>
          </View>

          {/* Users List */}
          <View style={styles.usersCard}>
            <Text style={styles.sectionTitle}>👥 All Users</Text>
            
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading users...</Text>
              </View>
            ) : users.length > 0 ? (
              <View style={styles.usersList}>
                {users.map((userItem) => {
                  const roleBadge = getRoleBadge(userItem.role);
                  const statusBadge = getStatusBadge(userItem.isActive);
                  
                  return (
                    <View key={userItem.id} style={styles.userItem}>
                      <View style={styles.userAvatar}>
                        <Text style={styles.userAvatarText}>
                          {userItem.name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      
                      <View style={styles.userInfo}>
                        <Text style={styles.userName}>{userItem.name}</Text>
                        <Text style={styles.userEmail}>{userItem.email}</Text>
                        <View style={styles.userBadges}>
                          <View style={[styles.badge, { backgroundColor: roleBadge.color }]}>
                            <Text style={styles.badgeText}>
                              {roleBadge.emoji} {roleBadge.text}
                            </Text>
                          </View>
                          <View style={[styles.badge, { backgroundColor: statusBadge.color }]}>
                            <Text style={styles.badgeText}>
                              {statusBadge.emoji} {statusBadge.text}
                            </Text>
                          </View>
                        </View>
                      </View>
                      
                      <View style={styles.userStats}>
                        <Text style={styles.userPoints}>{userItem.points} pts</Text>
                        <Text style={styles.userBadge}>{userItem.badgeEmoji} {userItem.badge}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No users found</Text>
                <Text style={styles.emptySubtext}>Users will appear here once they register</Text>
              </View>
            )}
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
  usersCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  usersList: {
    gap: 12,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e9ecef',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userAvatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  userBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  userStats: {
    alignItems: 'flex-end',
  },
  userPoints: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E8B57',
    marginBottom: 4,
  },
  userBadge: {
    fontSize: 12,
    color: '#666',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
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