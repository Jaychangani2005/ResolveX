import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { getIncidents } from '@/services/firebaseService';
import { exportIncidentToPDF } from '@/services/pdfExportService';
import { IncidentReport } from '@/types/user';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export default function GovernmentIncidentDetailsScreen() {
  const [incident, setIncident] = useState<IncidentReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  };

  useEffect(() => {
    const loadIncident = async () => {
      try {
        setIsLoading(true);
        const allIncidents = await getIncidents(1000);
        const foundIncident = allIncidents.find(inc => inc.id === id);
        
        if (foundIncident) {
          setIncident(foundIncident);
        } else {
          Alert.alert('Error', 'Incident report not found.');
          router.back();
        }
      } catch (error: any) {
        console.error('Error loading incident:', error);
        Alert.alert('Error', 'Failed to load incident details.');
        router.back();
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadIncident();
    }
  }, [id]);

  // Check if user has government permissions
  useEffect(() => {
    if (user && user.role !== 'government') {
      Alert.alert('Access Denied', 'You do not have permission to access this area.');
      router.replace('/(tabs)');
    }
  }, [user]);

  const handleExportPDF = async () => {
    if (!incident) return;
    
    try {
      setIsExporting(true);
      console.log('📄 Exporting incident to PDF...');
      
      const pdfUrl = await exportIncidentToPDF(incident);
      
      Alert.alert(
        'Export Successful',
        'Incident report has been exported to PDF. The file is ready for download.',
        [
          { text: 'OK' },
          { 
            text: 'Share', 
            onPress: () => {
              // In a real app, you'd use expo-sharing to share the PDF
              Alert.alert('Share', 'PDF sharing functionality would be implemented here');
            }
          }
        ]
      );
      
      console.log('✅ Incident export completed');
    } catch (error) {
      console.error('❌ Export failed:', error);
      Alert.alert(
        'Export Failed',
        'Failed to export incident report. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsExporting(false);
    }
  };

  if (!user || user.role !== 'government') {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={colorScheme === 'dark' ? ['#0f0f23', '#1a1a2e', '#16213e'] : ['#f8f9fa', '#e9ecef', '#dee2e6']}
          style={styles.gradientBackground}
        >
          <View style={styles.centerContainer}>
            <Text style={[styles.errorText, { color: colorScheme === 'dark' ? '#fff' : '#1a1a2e' }]}>Access Denied</Text>
            <Text style={[styles.errorSubtext, { color: colorScheme === 'dark' ? '#ccc' : '#666' }]}>You do not have permission to access this area.</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={colorScheme === 'dark' ? ['#0f0f23', '#1a1a2e', '#16213e'] : ['#f8f9fa', '#e9ecef', '#dee2e6']}
          style={styles.gradientBackground}
        >
          <View style={styles.centerContainer}>
            <Text style={[styles.loadingText, { color: colorScheme === 'dark' ? '#fff' : '#1a1a2e' }]}>
              Loading incident details...
            </Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (!incident) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={colorScheme === 'dark' ? ['#0f0f23', '#1a1a2e', '#16213e'] : ['#f8f9fa', '#e9ecef', '#dee2e6']}
          style={styles.gradientBackground}
        >
          <View style={styles.centerContainer}>
            <Text style={[styles.errorText, { color: colorScheme === 'dark' ? '#fff' : '#1a1a2e' }]}>Incident Not Found</Text>
            <Text style={[styles.errorSubtext, { color: colorScheme === 'dark' ? '#ccc' : '#666' }]}>The requested incident report could not be found.</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={colorScheme === 'dark' ? ['#0f0f23', '#1a1a2e', '#16213e'] : ['#f8f9fa', '#e9ecef', '#dee2e6']}
        style={styles.gradientBackground}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={colorScheme === 'dark' ? '#fff' : '#1a1a2e'} />
            <Text style={[styles.backButtonText, { color: colorScheme === 'dark' ? '#fff' : '#1a1a2e' }]}>Back</Text>
          </TouchableOpacity>
          
          <Text style={[styles.headerTitle, { color: colorScheme === 'dark' ? '#fff' : '#1a1a2e' }]}>
            Incident Details
          </Text>
          
          <TouchableOpacity 
            style={[styles.exportButton, { backgroundColor: '#2E8B57' }]}
            onPress={handleExportPDF}
            disabled={isExporting}
          >
            <Ionicons name="download-outline" size={20} color="#fff" />
            <Text style={styles.exportButtonText}>
              {isExporting ? 'Exporting...' : 'Export PDF'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Incident Photo */}
          {incident.photoUrl && (
            <View style={styles.photoContainer}>
              <Image source={{ uri: incident.photoUrl }} style={styles.incidentPhoto} />
              <View style={styles.photoOverlay}>
                <Text style={styles.photoLabel}>Incident Photo</Text>
              </View>
            </View>
          )}

          {/* Incident Information Card */}
          <View style={[styles.infoCard, { backgroundColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.95)' }]}>
            <Text style={[styles.sectionTitle, { color: colorScheme === 'dark' ? '#fff' : '#1a1a2e' }]}>
              📋 Incident Information
            </Text>
            
            <View style={styles.infoGrid}>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colorScheme === 'dark' ? '#ccc' : '#666' }]}>Report ID:</Text>
                <Text style={[styles.infoValue, { color: colorScheme === 'dark' ? '#fff' : '#1a1a2e' }]}>{incident.id}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colorScheme === 'dark' ? '#ccc' : '#666' }]}>Reported By:</Text>
                <Text style={[styles.infoValue, { color: colorScheme === 'dark' ? '#fff' : '#1a1a2e' }]}>{incident.userName || 'Anonymous'}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colorScheme === 'dark' ? '#ccc' : '#666' }]}>Email:</Text>
                <Text style={[styles.infoValue, { color: colorScheme === 'dark' ? '#fff' : '#1a1a2e' }]}>{incident.userEmail}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colorScheme === 'dark' ? '#ccc' : '#666' }]}>Date Reported:</Text>
                <Text style={[styles.infoValue, { color: colorScheme === 'dark' ? '#fff' : '#1a1a2e' }]}>{formatDate(incident.createdAt)}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colorScheme === 'dark' ? '#ccc' : '#666' }]}>Last Updated:</Text>
                <Text style={[styles.infoValue, { color: colorScheme === 'dark' ? '#fff' : '#1a1a2e' }]}>{formatDate(incident.updatedAt)}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colorScheme === 'dark' ? '#ccc' : '#666' }]}>AI Validation:</Text>
                <View style={styles.aiValidationContainer}>
                  <Ionicons 
                    name={incident.aiValidated ? "checkmark-circle" : "time-outline"} 
                    size={16} 
                    color={incident.aiValidated ? "#32CD32" : "#FFA500"} 
                  />
                  <Text style={[styles.aiValidationText, { color: incident.aiValidated ? "#32CD32" : "#FFA500" }]}>
                    {incident.aiValidated ? 'Validated' : 'Pending Validation'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Description Card */}
          <View style={[styles.infoCard, { backgroundColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.95)' }]}>
            <Text style={[styles.sectionTitle, { color: colorScheme === 'dark' ? '#fff' : '#1a1a2e' }]}>
              📝 Description
            </Text>
            <Text style={[styles.descriptionText, { color: colorScheme === 'dark' ? '#fff' : '#1a1a2e' }]}>
              {incident.description}
            </Text>
          </View>

          {/* Location Card */}
          <View style={[styles.infoCard, { backgroundColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.95)' }]}>
            <Text style={[styles.sectionTitle, { color: colorScheme === 'dark' ? '#fff' : '#1a1a2e' }]}>
              📍 Location Details
            </Text>
            
            <View style={styles.locationGrid}>
              <View style={styles.locationItem}>
                <Ionicons name="location" size={20} color="#2E8B57" />
                <View style={styles.locationInfo}>
                  <Text style={[styles.locationLabel, { color: colorScheme === 'dark' ? '#ccc' : '#666' }]}>City</Text>
                  <Text style={[styles.locationValue, { color: colorScheme === 'dark' ? '#fff' : '#1a1a2e' }]}>
                    {incident.location?.city || 'Unknown'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.locationItem}>
                <Ionicons name="map" size={20} color="#2E8B57" />
                <View style={styles.locationInfo}>
                  <Text style={[styles.locationLabel, { color: colorScheme === 'dark' ? '#ccc' : '#666' }]}>State</Text>
                  <Text style={[styles.locationValue, { color: colorScheme === 'dark' ? '#fff' : '#1a1a2e' }]}>
                    {incident.location?.state || 'Unknown'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.locationItem}>
                <Ionicons name="globe" size={20} color="#2E8B57" />
                <View style={styles.locationInfo}>
                  <Text style={[styles.locationLabel, { color: colorScheme === 'dark' ? '#ccc' : '#666' }]}>Country</Text>
                  <Text style={[styles.locationValue, { color: colorScheme === 'dark' ? '#fff' : '#1a1a2e' }]}>
                    {incident.location?.country || 'Unknown'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.locationItem}>
                <Ionicons name="navigate" size={20} color="#2E8B57" />
                <View style={styles.locationInfo}>
                  <Text style={[styles.locationLabel, { color: colorScheme === 'dark' ? '#ccc' : '#666' }]}>Coordinates</Text>
                  <Text style={[styles.locationValue, { color: colorScheme === 'dark' ? '#fff' : '#1a1a2e' }]}>
                    {incident.location?.latitude?.toFixed(6)}, {incident.location?.longitude?.toFixed(6)}
                  </Text>
                </View>
              </View>
            </View>
            
            {incident.location?.fullAddress && (
              <View style={styles.fullAddressContainer}>
                <Text style={[styles.fullAddressLabel, { color: colorScheme === 'dark' ? '#ccc' : '#666' }]}>Full Address:</Text>
                <Text style={[styles.fullAddressText, { color: colorScheme === 'dark' ? '#fff' : '#1a1a2e' }]}>
                  {incident.location.fullAddress}
                </Text>
              </View>
            )}
          </View>

          {/* Technical Details Card */}
          <View style={[styles.infoCard, { backgroundColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.95)' }]}>
            <Text style={[styles.sectionTitle, { color: colorScheme === 'dark' ? '#fff' : '#1a1a2e' }]}>
              🔧 Technical Details
            </Text>
            
            <View style={styles.techGrid}>
              <View style={styles.techItem}>
                <Text style={[styles.techLabel, { color: colorScheme === 'dark' ? '#ccc' : '#666' }]}>User ID</Text>
                <Text style={[styles.techValue, { color: colorScheme === 'dark' ? '#fff' : '#1a1a2e' }]}>{incident.userId}</Text>
              </View>
              
              <View style={styles.techItem}>
                <Text style={[styles.techLabel, { color: colorScheme === 'dark' ? '#ccc' : '#666' }]}>Report Status</Text>
                <View style={[styles.statusBadge, { backgroundColor: '#757575' }]}>
                  <Text style={styles.statusText}>Active</Text>
                </View>
              </View>
              
              {incident.reviewedBy && (
                <View style={styles.techItem}>
                  <Text style={[styles.techLabel, { color: colorScheme === 'dark' ? '#ccc' : '#666' }]}>Reviewed By</Text>
                  <Text style={[styles.techValue, { color: colorScheme === 'dark' ? '#fff' : '#1a1a2e' }]}>{incident.reviewedBy}</Text>
                </View>
              )}
              
              {incident.reviewedAt && (
                <View style={styles.techItem}>
                  <Text style={[styles.techLabel, { color: colorScheme === 'dark' ? '#ccc' : '#666' }]}>Review Date</Text>
                  <Text style={[styles.techValue, { color: colorScheme === 'dark' ? '#fff' : '#1a1a2e' }]}>{formatDate(incident.reviewedAt)}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Admin Notes (if any) */}
          {incident.adminNotes && (
            <View style={[styles.infoCard, { backgroundColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.95)' }]}>
              <Text style={[styles.sectionTitle, { color: colorScheme === 'dark' ? '#fff' : '#1a1a2e' }]}>
                📝 Admin Notes
              </Text>
              <Text style={[styles.adminNotesText, { color: colorScheme === 'dark' ? '#fff' : '#1a1a2e' }]}>
                {incident.adminNotes}
              </Text>
            </View>
          )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  exportButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  photoContainer: {
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  incidentPhoto: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 12,
  },
  photoLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  infoCard: {
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
  infoGrid: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  aiValidationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiValidationText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
  },
  locationGrid: {
    gap: 16,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationInfo: {
    marginLeft: 12,
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  locationValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  fullAddressContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  fullAddressLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  fullAddressText: {
    fontSize: 14,
    lineHeight: 20,
  },
  techGrid: {
    gap: 12,
  },
  techItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  techLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  techValue: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  adminNotesText: {
    fontSize: 16,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  errorSubtext: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
});
