import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';

interface UploadProgressBarProps {
  progress: number;
  bytesTransferred: number;
  totalBytes: number;
  status: 'uploading' | 'completed' | 'error';
  fileName?: string;
}

export function UploadProgressBar({ 
  progress, 
  bytesTransferred, 
  totalBytes, 
  status, 
  fileName 
}: UploadProgressBarProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'uploading':
        return <Ionicons name="cloud-upload" size={20} color={colors.primary} />;
      case 'completed':
        return <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />;
      case 'error':
        return <Ionicons name="alert-circle" size={20} color={colors.error} />;
      default:
        return <Ionicons name="cloud-upload" size={20} color={colors.icon} />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'uploading':
        return colors.primary;
      case 'completed':
        return '#4CAF50';
      case 'error':
        return colors.error;
      default:
        return colors.icon;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'uploading':
        return 'Uploading...';
      case 'completed':
        return 'Upload Complete';
      case 'error':
        return 'Upload Failed';
      default:
        return 'Preparing...';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        {getStatusIcon()}
        <Text style={[styles.statusText, { color: getStatusColor() }]}>
          {getStatusText()}
        </Text>
      </View>

      {fileName && (
        <Text style={[styles.fileName, { color: colors.text }]} numberOfLines={1}>
          📁 {fileName}
        </Text>
      )}

      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
          <View 
            style={[
              styles.progressFill, 
              { 
                backgroundColor: getStatusColor(),
                width: `${progress}%`
              }
            ]} 
          />
        </View>
        <Text style={[styles.progressText, { color: colors.text }]}>
          {progress}%
        </Text>
      </View>

      <View style={styles.details}>
        <Text style={[styles.detailText, { color: colors.icon }]}>
          📤 {formatBytes(bytesTransferred)} / {formatBytes(totalBytes)}
        </Text>
        {status === 'uploading' && (
          <Text style={[styles.detailText, { color: colors.icon }]}>
            ⏱️ {Math.ceil((totalBytes - bytesTransferred) / (bytesTransferred / 100))}s remaining
          </Text>
        )}
      </View>

      {status === 'error' && (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.error }]}>
            ❌ Upload failed. Please check your connection and try again.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  fileName: {
    fontSize: 14,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    minWidth: 40,
    textAlign: 'right',
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 12,
  },
  errorContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#ffebee',
    borderRadius: 6,
  },
  errorText: {
    fontSize: 12,
    textAlign: 'center',
  },
});
