import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { getGovernmentStats, getIncidents } from '@/services/firebaseService';
import { exportAnalyticsToPDF } from '@/services/pdfExportService';
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

export default function GovernmentAnalyticsScreen() {
  const [stats, setStats] = useState<any>(null);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user } = useAuth();

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      console.log('🏛️ Loading analytics data...');
      
      const [statsData, incidentsData] = await Promise.all([
        getGovernmentStats(),
        getIncidents(100)
      ]);
      
      setStats(statsData);
      setIncidents(incidentsData);
      
      console.log('✅ Analytics data loaded successfully');
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
    await loadAnalyticsData();
    setRefreshing(false);
  };

  const getStatusDistribution = () => {
    if (!incidents.length) return { approved: 0, rejected: 0 };
    
    const distribution = incidents.reduce((acc, incident) => {
      acc[incident.status] = (acc[incident.status] || 0) + 1;
      return acc;
    }, {} as any);
    
    return {
      approved: distribution.approved || 0,
      rejected: distribution.rejected || 0,
    };
  };

  const getMonthlyTrend = () => {
    if (!incidents.length) return [];
    
    const now = new Date();
    const months = [];
    
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = month.toLocaleDateString('en-US', { month: 'short' });
      const monthIncidents = incidents.filter(incident => {
        const incidentDate = incident.createdAt;
        return incidentDate.getMonth() === month.getMonth() && 
               incidentDate.getFullYear() === month.getFullYear();
      });
      
      months.push({
        month: monthName,
        count: monthIncidents.length,
      });
    }
    
    return months;
  };

  const getTopLocations = () => {
    if (!incidents.length) return [];
    
    const locationCounts = incidents.reduce((acc, incident) => {
      const location = incident.location?.city || 'Unknown';
      acc[location] = (acc[location] || 0) + 1;
      return acc;
    }, {} as any);
    
    return Object.entries(locationCounts)
      .map(([location, count]) => ({ location, count: count as number }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const formatPercentage = (value: number, total: number) => {
    if (total === 0) return '0%';
    return `${Math.round((value / total) * 100)}%`;
  };

  const handleExportAnalytics = async () => {
    try {
      console.log('📄 Starting analytics export...');
      
      const pdfUrl = await exportAnalyticsToPDF(stats);
      
      Alert.alert(
        'Export Successful',
        'Analytics report has been exported to PDF. The file is ready for download.',
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
      
      console.log('✅ Analytics export completed');
    } catch (error) {
      console.error('❌ Export failed:', error);
      Alert.alert(
        'Export Failed',
        'Failed to export analytics report. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading analytics...
          </Text>
        </View>
      </View>
    );
  }

  const statusDistribution = getStatusDistribution();
  const monthlyTrend = getMonthlyTrend();
  const topLocations = getTopLocations();

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
        {/* Overview Stats */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>
            📊 Overview Statistics
          </Text>
          
                     <View style={styles.statsGrid}>
             <View style={[styles.statCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
               <Text style={[styles.statNumber, { color: colors.primary }]}>{stats?.totalReports || 0}</Text>
               <Text style={[styles.statLabel, { color: colors.text }]}>Total Reports</Text>
             </View>
             
             <View style={[styles.statCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
               <Text style={[styles.statNumber, { color: '#2196F3' }]}>{stats?.totalUsers || 0}</Text>
               <Text style={[styles.statLabel, { color: colors.text }]}>Total Users</Text>
             </View>
             
             <View style={[styles.statCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
               <Text style={[styles.statNumber, { color: '#9C27B0' }]}>{stats?.activeUsers || 0}</Text>
               <Text style={[styles.statLabel, { color: colors.text }]}>Active Users</Text>
             </View>
             
             <View style={[styles.statCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
               <Text style={[styles.statNumber, { color: '#FFC107' }]}>{stats?.totalPoints || 0}</Text>
               <Text style={[styles.statLabel, { color: colors.text }]}>Total Points</Text>
             </View>
           </View>
        </View>

                 {/* Export Analytics */}
         <View style={styles.section}>
           <Text style={[styles.sectionTitle, { color: colors.primary }]}>
             📊 Export Analytics
           </Text>
           
           <View style={[styles.chartCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
             <TouchableOpacity
               style={[styles.exportButton, { backgroundColor: colors.primary }]}
               onPress={() => handleExportAnalytics()}
             >
               <Ionicons name="download-outline" size={20} color="#fff" />
               <Text style={styles.exportButtonText}>Export Analytics Report (PDF)</Text>
             </TouchableOpacity>
           </View>
         </View>

        {/* Monthly Trend */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>
            📅 Monthly Trend (Last 6 Months)
          </Text>
          
          <View style={[styles.chartCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
            {monthlyTrend.map((item, index) => (
              <View key={index} style={styles.trendRow}>
                <Text style={[styles.monthLabel, { color: colors.text }]}>{item.month}</Text>
                <View style={styles.trendBar}>
                  <View 
                    style={[
                      styles.trendFill, 
                      { 
                        width: `${Math.min((item.count / Math.max(...monthlyTrend.map(m => m.count))) * 100, 100)}%`,
                        backgroundColor: colors.primary 
                      }
                    ]} 
                  />
                </View>
                <Text style={[styles.trendCount, { color: colors.text }]}>{item.count}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Top Locations */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>
            📍 Top Incident Locations
          </Text>
          
          <View style={[styles.chartCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
            {topLocations.map((location, index) => (
              <View key={index} style={styles.locationRow}>
                <View style={styles.locationRank}>
                  <Text style={[styles.rankText, { color: colors.primary }]}>#{index + 1}</Text>
                </View>
                <View style={styles.locationInfo}>
                  <Text style={[styles.locationName, { color: colors.text }]}>{location.location}</Text>
                  <Text style={[styles.locationCount, { color: colors.textSecondary || colors.text }]}>
                    {location.count} incidents
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Activity Summary */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>
            ⚡ Recent Activity Summary
          </Text>
          
          <View style={[styles.chartCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <View style={styles.activityRow}>
              <Ionicons name="time-outline" size={20} color="#FF9800" />
              <Text style={[styles.activityText, { color: colors.text }]}>
                {stats?.recentReports || 0} new reports in last 24 hours
              </Text>
            </View>
            
            <View style={styles.activityRow}>
              <Ionicons name="people-outline" size={20} color="#2196F3" />
              <Text style={[styles.activityText, { color: colors.text }]}>
                {stats?.weeklyUsers || 0} new users this week
              </Text>
            </View>
            
                         <View style={styles.activityRow}>
               <Ionicons name="trending-up-outline" size={20} color="#4CAF50" />
               <Text style={[styles.activityText, { color: colors.text }]}>
                 {stats?.recentReports || 0} new reports this week
               </Text>
             </View>
            
            <View style={styles.activityRow}>
              <Ionicons name="star-outline" size={20} color="#FFC107" />
              <Text style={[styles.activityText, { color: colors.text }]}>
                {stats?.totalPoints || 0} total community points
              </Text>
            </View>
          </View>
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
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  chartCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  statusCount: {
    fontSize: 14,
    fontWeight: '600',
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  monthLabel: {
    width: 40,
    fontSize: 12,
    fontWeight: '500',
  },
  trendBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginHorizontal: 12,
  },
  trendFill: {
    height: '100%',
    borderRadius: 4,
  },
  trendCount: {
    width: 30,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationRank: {
    width: 40,
    alignItems: 'center',
  },
  rankText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  locationInfo: {
    flex: 1,
    marginLeft: 12,
  },
  locationName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  locationCount: {
    fontSize: 12,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
     activityText: {
     fontSize: 14,
     marginLeft: 12,
     flex: 1,
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
