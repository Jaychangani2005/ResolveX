import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { getAllIncidentsForNGO } from '@/services/firebaseService';
import { exportAnalyticsToPDF } from '@/services/pdfExportService';
import { IncidentReport } from '@/types/user';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NGOAnalyticsScreen() {
  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user } = useAuth();

  useEffect(() => {
    loadIncidents();
  }, []);

  const loadIncidents = async () => {
    try {
      setLoading(true);
      console.log('📊 Loading analytics data for NGO...');
      
      const incidentsData = await getAllIncidentsForNGO();
      setIncidents(incidentsData);
      
      console.log(`✅ Loaded ${incidentsData.length} incidents for analytics`);
    } catch (error) {
      console.error('❌ Error loading analytics data:', error);
      Alert.alert(
        'Error',
        'Failed to load analytics data. Please try again.',
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

  const handleExportAnalytics = async () => {
    try {
      console.log('📄 Starting analytics export...');
      
      const analyticsData = {
        totalReports: incidents.length,
        aiValidated: incidents.filter(incident => incident.aiValidated).length,
        pendingAI: incidents.filter(incident => !incident.aiValidated).length,
        recentReports: incidents.filter(incident => {
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
          return new Date(incident.createdAt) > oneWeekAgo;
        }).length,
        incidents: incidents
      };
      
      const pdfUrl = await exportAnalyticsToPDF(analyticsData);
      
      Alert.alert(
        'Export Successful',
        'Analytics report has been exported to PDF.',
        [
          { text: 'OK' },
          { 
            text: 'Share', 
            onPress: () => {
              Alert.alert('Share', 'PDF sharing functionality would be implemented here');
            }
          }
        ]
      );
      
      console.log('✅ Analytics export completed');
    } catch (error) {
      console.error('❌ Analytics export failed:', error);
      Alert.alert(
        'Export Failed',
        'Failed to export analytics. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const getMonthlyStats = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    return incidents.filter(incident => {
      const incidentDate = new Date(incident.createdAt);
      return incidentDate.getMonth() === currentMonth && incidentDate.getFullYear() === currentYear;
    });
  };

  const getWeeklyStats = () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    return incidents.filter(incident => new Date(incident.createdAt) > oneWeekAgo);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading analytics...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const monthlyStats = getMonthlyStats();
  const weeklyStats = getWeeklyStats();
  const aiValidatedCount = incidents.filter(incident => incident.aiValidated).length;
  const pendingAICount = incidents.filter(incident => !incident.aiValidated).length;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
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
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Analytics & Statistics</Text>
          <TouchableOpacity
            style={[styles.exportButton, { backgroundColor: colors.primary }]}
            onPress={handleExportAnalytics}
          >
            <Ionicons name="download-outline" size={20} color="#fff" />
            <Text style={styles.exportButtonText}>Export PDF</Text>
          </TouchableOpacity>
        </View>

        {/* Overview Stats */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Overview</Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Ionicons name="document-text" size={24} color={colors.primary} />
              <Text style={[styles.statNumber, { color: colors.text }]}>{incidents.length}</Text>
              <Text style={[styles.statLabel, { color: colors.secondary }]}>Total Reports</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Ionicons name="checkmark-circle" size={24} color="#32CD32" />
              <Text style={[styles.statNumber, { color: colors.text }]}>{aiValidatedCount}</Text>
              <Text style={[styles.statLabel, { color: colors.secondary }]}>AI Validated</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Ionicons name="time" size={24} color="#FFA500" />
              <Text style={[styles.statNumber, { color: colors.text }]}>{pendingAICount}</Text>
              <Text style={[styles.statLabel, { color: colors.secondary }]}>Pending AI</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Ionicons name="calendar" size={24} color="#4169E1" />
              <Text style={[styles.statNumber, { color: colors.text }]}>{monthlyStats.length}</Text>
              <Text style={[styles.statLabel, { color: colors.secondary }]}>This Month</Text>
            </View>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Activity</Text>
          <View style={[styles.activityCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <View style={styles.activityItem}>
              <Ionicons name="trending-up" size={20} color="#32CD32" />
              <Text style={[styles.activityText, { color: colors.text }]}>
                {weeklyStats.length} new reports this week
              </Text>
            </View>
            <View style={styles.activityItem}>
              <Ionicons name="checkmark-circle" size={20} color="#32CD32" />
              <Text style={[styles.activityText, { color: colors.text }]}>
                {aiValidatedCount} reports AI validated
              </Text>
            </View>
            <View style={styles.activityItem}>
              <Ionicons name="time" size={20} color="#FFA500" />
              <Text style={[styles.activityText, { color: colors.text }]}>
                {pendingAICount} reports pending AI validation
              </Text>
            </View>
          </View>
        </View>

        {/* AI Validation Rate */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>AI Validation Rate</Text>
          <View style={[styles.validationCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <View style={styles.validationProgress}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${incidents.length > 0 ? (aiValidatedCount / incidents.length) * 100 : 0}%`,
                      backgroundColor: '#32CD32'
                    }
                  ]} 
                />
              </View>
              <Text style={[styles.progressText, { color: colors.text }]}>
                {incidents.length > 0 ? Math.round((aiValidatedCount / incidents.length) * 100) : 0}%
              </Text>
            </View>
            <Text style={[styles.validationLabel, { color: colors.secondary }]}>
              {aiValidatedCount} of {incidents.length} reports validated
            </Text>
          </View>
        </View>

        {/* Monthly Trend */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Monthly Trend</Text>
          <View style={[styles.trendCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <View style={styles.trendItem}>
              <Text style={[styles.trendLabel, { color: colors.secondary }]}>This Month</Text>
              <Text style={[styles.trendValue, { color: colors.text }]}>{monthlyStats.length}</Text>
            </View>
            <View style={styles.trendItem}>
              <Text style={[styles.trendLabel, { color: colors.secondary }]}>Last Week</Text>
              <Text style={[styles.trendValue, { color: colors.text }]}>{weeklyStats.length}</Text>
            </View>
            <View style={styles.trendItem}>
              <Text style={[styles.trendLabel, { color: colors.secondary }]}>Total</Text>
              <Text style={[styles.trendValue, { color: colors.text }]}>{incidents.length}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  exportButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  activityCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  activityText: {
    fontSize: 14,
    marginLeft: 12,
  },
  validationCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  validationProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 16,
    fontWeight: 'bold',
    minWidth: 40,
  },
  validationLabel: {
    fontSize: 12,
  },
  trendCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  trendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  trendLabel: {
    fontSize: 14,
  },
  trendValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
