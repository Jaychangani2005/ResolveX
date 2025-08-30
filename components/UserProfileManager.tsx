import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { FormInput } from './FormInput';
import { ActionButton } from './ActionButton';

interface ProfileFormData {
  name: string;
  phoneNumber: string;
  city: string;
  state: string;
  country: string;
  notifications: boolean;
  emailUpdates: boolean;
  language: string;
}

export const UserProfileManager: React.FC = () => {
  const { user, updateProfile, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    name: user?.name || '',
    phoneNumber: user?.phoneNumber || '',
    city: user?.location?.city || '',
    state: user?.location?.state || '',
    country: user?.location?.country || '',
    notifications: user?.preferences?.notifications ?? true,
    emailUpdates: user?.preferences?.emailUpdates ?? true,
    language: user?.preferences?.language || 'en',
  });

  const handleSave = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      await updateProfile({
        name: formData.name.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        location: {
          city: formData.city.trim(),
          state: formData.state.trim(),
          country: formData.country.trim(),
        },
        preferences: {
          notifications: formData.notifications,
          emailUpdates: formData.emailUpdates,
          language: formData.language,
        },
      });

      Alert.alert('Success', 'Profile updated successfully!');
      setIsEditing(false);
      await refreshUser(); // Refresh user data from Firestore
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to current user data
    setFormData({
      name: user?.name || '',
      phoneNumber: user?.phoneNumber || '',
      city: user?.location?.city || '',
      state: user?.location?.state || '',
      country: user?.location?.country || '',
      notifications: user?.preferences?.notifications ?? true,
      emailUpdates: user?.preferences?.emailUpdates ?? true,
      language: user?.preferences?.language || 'en',
    });
    setIsEditing(false);
  };

  if (!user) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.errorText}>No user logged in</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>User Profile</ThemedText>
          <ThemedText style={styles.subtitle}>Manage your account information</ThemedText>
        </View>

        <View style={styles.profileSection}>
          <ThemedText style={styles.sectionTitle}>Basic Information</ThemedText>
          
          <View style={styles.fieldContainer}>
            <ThemedText style={styles.label}>Email</ThemedText>
            <Text style={styles.value}>{user.email}</Text>
          </View>

          <View style={styles.fieldContainer}>
            <ThemedText style={styles.label}>Role</ThemedText>
            <Text style={styles.value}>{user.role}</Text>
          </View>

          <View style={styles.fieldContainer}>
            <ThemedText style={styles.label}>Points</ThemedText>
            <Text style={styles.value}>{user.points}</Text>
          </View>

          <View style={styles.fieldContainer}>
            <ThemedText style={styles.label}>Badge</ThemedText>
            <Text style={styles.value}>{user.badgeEmoji} {user.badge}</Text>
          </View>

          <View style={styles.fieldContainer}>
            <ThemedText style={styles.label}>Member Since</ThemedText>
            <Text style={styles.value}>
              {user.createdAt.toLocaleDateString()}
            </Text>
          </View>

          <View style={styles.fieldContainer}>
            <ThemedText style={styles.label}>Last Active</ThemedText>
            <Text style={styles.value}>
              {user.lastActive.toLocaleDateString()}
            </Text>
          </View>
        </View>

        <View style={styles.profileSection}>
          <ThemedText style={styles.sectionTitle}>Editable Information</ThemedText>
          
          <FormInput
            label="Name"
            value={formData.name}
            onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
            editable={isEditing}
            placeholder="Enter your name"
          />

          <FormInput
            label="Phone Number"
            value={formData.phoneNumber}
            onChangeText={(text) => setFormData(prev => ({ ...prev, phoneNumber: text }))}
            editable={isEditing}
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
          />

          <FormInput
            label="City"
            value={formData.city}
            onChangeText={(text) => setFormData(prev => ({ ...prev, city: text }))}
            editable={isEditing}
            placeholder="Enter your city"
          />

          <FormInput
            label="State/Province"
            value={formData.state}
            onChangeText={(text) => setFormData(prev => ({ ...prev, state: text }))}
            editable={isEditing}
            placeholder="Enter your state or province"
          />

          <FormInput
            label="Country"
            value={formData.country}
            onChangeText={(text) => setFormData(prev => ({ ...prev, country: text }))}
            editable={isEditing}
            placeholder="Enter your country"
          />
        </View>

        <View style={styles.profileSection}>
          <ThemedText style={styles.sectionTitle}>Preferences</ThemedText>
          
          <View style={styles.preferenceRow}>
            <ThemedText style={styles.label}>Push Notifications</ThemedText>
            <TouchableOpacity
              style={[styles.toggle, formData.notifications && styles.toggleActive]}
              onPress={() => isEditing && setFormData(prev => ({ ...prev, notifications: !prev.notifications }))}
              disabled={!isEditing}
            >
              <Text style={styles.toggleText}>
                {formData.notifications ? 'ON' : 'OFF'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.preferenceRow}>
            <ThemedText style={styles.label}>Email Updates</ThemedText>
            <TouchableOpacity
              style={[styles.toggle, formData.emailUpdates && styles.toggleActive]}
              onPress={() => isEditing && setFormData(prev => ({ ...prev, emailUpdates: !prev.emailUpdates }))}
              disabled={!isEditing}
            >
              <Text style={styles.toggleText}>
                {formData.emailUpdates ? 'ON' : 'OFF'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.fieldContainer}>
            <ThemedText style={styles.label}>Language</ThemedText>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={formData.language}
              onChangeText={(text) => setFormData(prev => ({ ...prev, language: text }))}
              editable={isEditing}
              placeholder="en"
            />
          </View>
        </View>

        <View style={styles.buttonContainer}>
          {!isEditing ? (
            <ActionButton
              title="Edit Profile"
              onPress={() => setIsEditing(true)}
              style={styles.editButton}
            />
          ) : (
            <View style={styles.editButtons}>
              <ActionButton
                title="Save"
                onPress={handleSave}
                loading={isLoading}
                style={styles.saveButton}
              />
              <ActionButton
                title="Cancel"
                onPress={handleCancel}
                style={styles.cancelButton}
                variant="secondary"
              />
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
  profileSection: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    opacity: 0.8,
  },
  value: {
    fontSize: 16,
    color: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  input: {
    fontSize: 16,
    color: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  inputDisabled: {
    opacity: 0.6,
    borderColor: 'transparent',
  },
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  toggle: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  toggleActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  toggleText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  buttonContainer: {
    marginTop: 24,
    marginBottom: 32,
  },
  editButton: {
    width: '100%',
  },
  editButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  saveButton: {
    flex: 1,
  },
  cancelButton: {
    flex: 1,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#ff6b6b',
  },
}); 