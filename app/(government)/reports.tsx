import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { getIncidents } from '@/services/firebaseService';
import { exportReportsToPDF } from '@/services/pdfExportService';
import { IncidentReport } from '@/types/user';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function GovernmentReportsScreen() {
  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [filteredIncidents, setFilteredIncidents] = useState<IncidentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all'>('all');

  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user } = useAuth();

  useEffect(() => {
    loadIncidents();
  }, []);

  useEffect(() => {
    filterIncidents();
  }, [incidents, searchQuery, statusFilter]);

  const loadIncidents = async () => {
    try {
      setLoading(true);
      console.log('🏛️ Loading incidents for government view...');
      
      const incidentsData = await getIncidents(100);
      setIncidents(incidentsData);
      
      console.log(`✅ Loaded ${incidentsData.length} incidents`);
    } catch (error) {
      console.error('❌ Error loading incidents:', error);
      Alert.alert(
        'Error',
        'Failed to load incident reports. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadIncidents();
    setRefreshing(false);
  };

  const filterIncidents = () => {
    let filtered = incidents;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(incident => incident.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(incident =>
        incident.userName?.toLowerCase().includes(query) ||
        incident.description?.toLowerCase().includes(query) ||
        incident.userEmail?.toLowerCase().includes(query)
      );
    }

    setFilteredIncidents(filtered);
  };

  // Status functions removed - no longer needed for government view

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleIncidentPress = (incident: IncidentReport) => {
    // Navigate to incident details
    router.push(`/(government)/incident-details/${incident.id}`);
  };

  const handleExportReports = async () => {
    try {
      console.log('📄 Starting reports export...');
      
      const pdfUrl = await exportReportsToPDF(incidents);
      
      Alert.alert(
        'Export Successful',
        'Reports have been exported to PDF. The file is ready for download.',
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
      
      console.log('✅ Reports export completed');
    } catch (error) {
      console.error('❌ Export failed:', error);
      Alert.alert(
        'Export Failed',
        'Failed to export reports. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading reports...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <Ionicons name="search" size={20} color={colors.textSecondary || colors.text} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search reports..."
            placeholderTextColor={colors.textSecondary || colors.text}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

                 {/* Export Button */}
         <View style={styles.exportContainer}>
           <TouchableOpacity
             style={[styles.exportButton, { backgroundColor: colors.primary }]}
             onPress={() => handleExportReports()}
           >
             <Ionicons name="download-outline" size={20} color="#fff" />
             <Text style={styles.exportButtonText}>Export Reports (PDF)</Text>
           </TouchableOpacity>
         </View>

        {/* Reports List */}
        <View style={styles.reportsContainer}>
          {filteredIncidents.length > 0 ? (
            filteredIncidents.map((incident) => (
              <TouchableOpacity
                key={incident.id}
                style={[styles.incidentCard, { backgroundColor: colors.background, borderColor: colors.border }]}
                onPress={() => handleIncidentPress(incident)}
              >
                <View style={styles.incidentHeader}>
                  <View style={styles.incidentInfo}>
                    <Text style={[styles.userName, { color: colors.text }]}>
                      {incident.userName || 'Anonymous'}
                    </Text>
                    <Text style={[styles.incidentDate, { color: colors.textSecondary || colors.text }]}>
                      {formatDate(incident.createdAt)}
                    </Text>
                  </View>
                  <View style={styles.aiValidationContainer}>
                    <Ionicons 
                      name={incident.aiValidated ? "checkmark-circle" : "time-outline"} 
                      size={16} 
                      color={incident.aiValidated ? "#32CD32" : "#FFA500"} 
                    />
                    <Text style={[styles.aiValidationText, { color: incident.aiValidated ? "#32CD32" : "#FFA500" }]}>
                      {incident.aiValidated ? 'AI Validated' : 'Pending AI'}
                    </Text>
                  </View>
                </View>

                <Text style={[styles.incidentDescription, { color: colors.text }]} numberOfLines={2}>
                  {incident.description}
                </Text>

                {incident.photoUrl && (
                  <View style={styles.photoContainer}>
                    <Image
                      source={{ uri: incident.photoUrl }}
                      style={styles.incidentPhoto}
                      resizeMode="cover"
                    />
                  </View>
                )}

                <View style={styles.incidentFooter}>
                  <Text style={[styles.locationText, { color: colors.textSecondary || colors.text }]}>
                    📍 {incident.location?.city || 'Unknown location'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="document-outline" size={64} color={colors.textSecondary || colors.text} />
              <Text style={[styles.emptyText, { color: colors.textSecondary || colors.text }]}>
                {searchQuery || statusFilter !== 'all' ? 'No reports found' : 'No incident reports yet'}
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.textSecondary || colors.text }]}>
                {searchQuery || statusFilter !== 'all' ? 'Try adjusting your search or filters' : 'Reports will appear here once submitted'}
              </Text>
            </View>
          )}
        </View>
             </ScrollView>
     </View>
   );
}

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
    marginTop: 16,
    fontWeight: '500',
  },

  scrollView: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  filterContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  reportsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  incidentCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  incidentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  incidentInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  incidentDate: {
    fontSize: 12,
  },
  aiValidationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  aiValidationText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  incidentDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  photoContainer: {
    marginBottom: 12,
  },
  incidentPhoto: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  incidentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
     emptySubtext: {
     fontSize: 14,
     textAlign: 'center',
     paddingHorizontal: 40,
   },
   exportContainer: {
     paddingHorizontal: 20,
     marginBottom: 20,
   },
   exportButton: {
     flexDirection: 'row',
     alignItems: 'center',
     justifyContent: 'center',
     paddingHorizontal: 20,
     paddingVertical: 12,
     borderRadius: 12,
     shadowColor: '#000',
     shadowOffset: { width: 0, height: 2 },
     shadowOpacity: 0.1,
     shadowRadius: 4,
     elevation: 3,
   },
   exportButtonText: {
     color: '#fff',
     fontSize: 16,
     fontWeight: '600',
     marginLeft: 8,
   },
 });
