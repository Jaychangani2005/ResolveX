import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { updateIncidentStatus } from '@/services/firebaseService';
import { IncidentReport } from '@/types/user';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export default function ReportsScreen() {
  const { user, logout } = useAuth();
  const { isDarkMode } = useTheme();
  const [reports, setReports] = useState<IncidentReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<IncidentReport[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<IncidentReport | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [reportToReject, setReportToReject] = useState<string | null>(null);

  useEffect(() => {
    loadReports();
  }, []);

  useEffect(() => {
    const filtered = reports.filter(report => 
      report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.userName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredReports(filtered);
  }, [searchTerm, reports]);

  const loadReports = async () => {
    try {
      setIsLoading(true);
      const allReports = await getIncidents(100);
      setReports(allReports);
    } catch (error) {
      console.error('Error loading reports:', error);
      Alert.alert('Error', 'Failed to load reports');
    } finally {
        setIsLoading(false);
    }
  };

  const handleApprove = async (reportId: string) => {
    try {
      await updateIncidentStatus(reportId, 'approved');
      Alert.alert('Success', 'Report approved successfully');
      await loadReports();
    } catch (error) {
      console.error('Error approving report:', error);
      Alert.alert('Error', 'Failed to approve report');
    }
  };

  const handleReject = async (reportId: string) => {
    if (!rejectionReason.trim()) {
      Alert.alert('Error', 'Please provide a reason for rejection');
      return;
    }

    try {
      // Update the incident status to rejected with rejection reason
      await updateIncidentStatus(reportId, 'rejected', rejectionReason);
      
      Alert.alert('Success', 'Report rejected successfully');
      setRejectionReason('');
      setShowRejectionModal(false);
      setReportToReject(null);
      await loadReports();
    } catch (error) {
      console.error('Error rejecting report:', error);
      Alert.alert('Error', 'Failed to reject report');
    }
  };

  const handleView = (report: IncidentReport) => {
    setSelectedReport(report);
    setShowViewModal(true);
  };

  const openRejectionModal = (reportId: string) => {
    setReportToReject(reportId);
    setShowRejectionModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return '#32CD32';
      case 'pending':
        return '#FFA500';
      case 'rejected':
        return '#FF6B6B';
      default:
        return '#666';
    }
  };

  const getRoleBadge = () => {
    if (user?.role === 'admin') {
      return { text: 'Admin', color: '#4169E1' };
    }
    return { text: 'User', color: '#32CD32' };
  };

  const roleBadge = getRoleBadge();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={isDarkMode ? ['#0f0f23', '#1a1a2e', '#16213e'] : ['#f8f9fa', '#e9ecef', '#dee2e6']}
          style={styles.gradientBackground}
        >
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>Loading reports...</Text>
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
            <View style={styles.welcomeSection}>
              <Text style={[styles.welcomeText, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>Review Reports</Text>
              <Text style={[styles.adminName, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>{user?.name}</Text>
              <View style={[styles.roleBadge, { backgroundColor: roleBadge.color }]}>
                <Text style={styles.roleText}>{roleBadge.text}</Text>
              </View>
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
              placeholder="Search by report description or user name..."
              placeholderTextColor={isDarkMode ? '#ccc' : '#666'}
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
          </View>

          {/* Reports List */}
          <View style={styles.reportsContainer}>
            {filteredReports.length > 0 ? (
              filteredReports.map((report) => (
                <View key={report.id} style={[styles.reportCard, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.95)' }]}>
                  <View style={styles.reportHeader}>
                    <View style={styles.reportInfo}>
                      <Text style={[styles.reportTitle, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>
                        {report.description.length > 50 ? `${report.description.substring(0, 50)}...` : report.description}
                      </Text>
                      <Text style={[styles.reportUser, { color: isDarkMode ? '#ccc' : '#666' }]}>
                        By: {report.userName}
                      </Text>
                      <Text style={[styles.reportDate, { color: isDarkMode ? '#ccc' : '#666' }]}>
                        {new Date(report.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(report.status) }]}>
                      <Text style={styles.statusText}>{report.status.toUpperCase()}</Text>
                    </View>
                  </View>

                  <View style={styles.reportActions}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.viewButton]}
                      onPress={() => handleView(report)}
                    >
                      <Ionicons name="eye" size={16} color="#4169E1" />
                      <Text style={styles.viewButtonText}>View</Text>
                    </TouchableOpacity>

                    {report.status === 'pending' && (
                      <>
                        <TouchableOpacity
                          style={[styles.actionButton, styles.approveButton]}
                          onPress={() => handleApprove(report.id)}
                        >
                          <Ionicons name="checkmark" size={16} color="#fff" />
                          <Text style={styles.approveButtonText}>Approve</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.actionButton, styles.rejectButton]}
                          onPress={() => openRejectionModal(report.id)}
                        >
                          <Ionicons name="close" size={16} color="#fff" />
                          <Text style={styles.rejectButtonText}>Reject</Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                </View>
              ))
            ) : (
              <View style={[styles.emptyState, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.95)' }]}>
                <Ionicons name="document-text-outline" size={48} color={isDarkMode ? '#ccc' : '#666'} />
                <Text style={[styles.emptyStateText, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>
                  {searchTerm ? 'No reports found matching your search' : 'No reports available'}
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

      {/* Report View Modal */}
      <Modal
        visible={showViewModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowViewModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDarkMode ? '#1a1a2e' : '#fff' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>Report Details</Text>
              <TouchableOpacity onPress={() => setShowViewModal(false)}>
                <Ionicons name="close" size={24} color={isDarkMode ? '#fff' : '#666'} />
              </TouchableOpacity>
            </View>
            
            {selectedReport && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.detailSection}>
                  <Text style={[styles.detailLabel, { color: isDarkMode ? '#ccc' : '#666' }]}>User Information</Text>
                  <Text style={[styles.detailText, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>
                    Name: {selectedReport.userName}
                  </Text>
                  <Text style={[styles.detailText, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>
                    Email: {selectedReport.userEmail}
                  </Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={[styles.detailLabel, { color: isDarkMode ? '#ccc' : '#666' }]}>Report Description</Text>
                  <TextInput
                    style={[styles.descriptionTextbox, { 
                      backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#f8f9fa',
                      color: isDarkMode ? '#fff' : '#1a1a2e',
                      borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : '#e9ecef'
                    }]}
                    value={selectedReport.description}
                    multiline
                    numberOfLines={6}
                    editable={false}
                    textAlignVertical="top"
                  />
                </View>

                <View style={styles.detailSection}>
                  <Text style={[styles.detailLabel, { color: isDarkMode ? '#ccc' : '#666' }]}>Location</Text>
                  <Text style={[styles.detailText, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>
                    {selectedReport.location.city}, {selectedReport.location.state}
                  </Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={[styles.detailLabel, { color: isDarkMode ? '#ccc' : '#666' }]}>Status & Timestamps</Text>
                  <Text style={[styles.detailText, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>
                    Status: {selectedReport.status.toUpperCase()}
                  </Text>
                  <Text style={[styles.detailText, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>
                    Created: {new Date(selectedReport.createdAt).toLocaleString()}
                  </Text>
                  {selectedReport.reviewedAt && (
                    <Text style={[styles.detailText, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>
                      Reviewed: {new Date(selectedReport.reviewedAt).toLocaleString()}
                    </Text>
                  )}
                </View>

                {selectedReport.adminNotes && (
                  <View style={styles.detailSection}>
                    <Text style={[styles.detailLabel, { color: isDarkMode ? '#ccc' : '#666' }]}>Admin Notes</Text>
                    <TextInput
                      style={[styles.descriptionTextbox, { 
                        backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#f8f9fa',
                        color: isDarkMode ? '#fff' : '#1a1a2e',
                        borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : '#e9ecef'
                      }]}
                      value={selectedReport.adminNotes}
                      multiline
                      numberOfLines={4}
                      editable={false}
                      textAlignVertical="top"
                    />
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Rejection Reason Modal */}
      <Modal
        visible={showRejectionModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowRejectionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDarkMode ? '#1a1a2e' : '#fff' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: isDarkMode ? '#fff' : '#1a1a2e' }]}>Reject Report</Text>
              <TouchableOpacity onPress={() => setShowRejectionModal(false)}>
                <Ionicons name="close" size={24} color={isDarkMode ? '#fff' : '#666'} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={[styles.detailLabel, { color: isDarkMode ? '#ccc' : '#666' }]}>
                Please provide a reason for rejection:
              </Text>
              <TextInput
                style={[styles.rejectionTextbox, { 
                  backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#f8f9fa',
                  color: isDarkMode ? '#fff' : '#1a1a2e',
                  borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : '#e9ecef'
                }]}
                placeholder="Enter rejection reason..."
                placeholderTextColor={isDarkMode ? '#ccc' : '#666'}
                value={rejectionReason}
                onChangeText={setRejectionReason}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowRejectionModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.rejectButton]}
                onPress={() => reportToReject && handleReject(reportToReject)}
              >
                <Text style={styles.modalRejectButtonText}>Reject Report</Text>
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
  reportsContainer: {
    flex: 1,
    gap: 16,
  },
  reportCard: {
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
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  reportInfo: {
    flex: 1,
    marginRight: 12,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  reportUser: {
    fontSize: 14,
    marginBottom: 2,
  },
  reportDate: {
    fontSize: 12,
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
  reportActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  viewButton: {
    backgroundColor: 'rgba(65, 105, 225, 0.1)',
  },
  approveButton: {
    backgroundColor: '#32CD32',
  },
  rejectButton: {
    backgroundColor: '#FF6B6B',
  },
  viewButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4169E1',
  },
  approveButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  rejectButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
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
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
    padding: 20,
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
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalBody: {
    flex: 1,
  },
  detailSection: {
    marginBottom: 20,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    marginBottom: 4,
  },
  descriptionTextbox: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
    minHeight: 120,
    textAlignVertical: 'top',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rejectionTextbox: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
    minHeight: 100,
    textAlignVertical: 'top',
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
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
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalRejectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 