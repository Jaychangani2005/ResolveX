import { Alert } from 'react-native';

// Notification Service for Government Users
export interface NotificationData {
  title: string;
  body: string;
  data?: any;
}

// Mock notification service (in a real app, you'd use expo-notifications)
export class NotificationService {
  private static instance: NotificationService;
  private isEnabled: boolean = true;

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Initialize notification service
  async initialize(): Promise<void> {
    try {
      console.log('🔔 Initializing notification service...');
      
      // In a real app, you would:
      // 1. Request notification permissions
      // 2. Configure notification channels
      // 3. Set up push notification tokens
      
      console.log('✅ Notification service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize notification service:', error);
    }
  }

  // Enable/disable notifications
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    console.log(`🔔 Notifications ${enabled ? 'enabled' : 'disabled'}`);
  }

  // Check if notifications are enabled
  isNotificationsEnabled(): boolean {
    return this.isEnabled;
  }

  // Send local notification
  async sendLocalNotification(notification: NotificationData): Promise<void> {
    if (!this.isEnabled) {
      console.log('🔔 Notifications disabled, skipping notification');
      return;
    }

    try {
      console.log('🔔 Sending local notification:', notification.title);
      
      // In a real app, you'd use expo-notifications to schedule a local notification
      // For now, we'll show an alert as a fallback
      Alert.alert(notification.title, notification.body);
      
      console.log('✅ Local notification sent successfully');
    } catch (error) {
      console.error('❌ Failed to send local notification:', error);
    }
  }

  // Send push notification to government users
  async sendPushNotification(notification: NotificationData, userIds?: string[]): Promise<void> {
    if (!this.isEnabled) {
      console.log('🔔 Notifications disabled, skipping push notification');
      return;
    }

    try {
      console.log('🔔 Sending push notification to government users:', notification.title);
      
      // In a real app, you would:
      // 1. Get push tokens for government users
      // 2. Send notification via Firebase Cloud Messaging or similar
      // 3. Handle notification delivery and tracking
      
      // For now, we'll simulate the notification
      console.log('📱 Push notification would be sent to government users');
      console.log('   Title:', notification.title);
      console.log('   Body:', notification.body);
      console.log('   Data:', notification.data);
      
      console.log('✅ Push notification sent successfully');
    } catch (error) {
      console.error('❌ Failed to send push notification:', error);
    }
  }

  // Notify government users about new incident
  async notifyNewIncident(incidentData: {
    id: string;
    userName: string;
    location: string;
    description: string;
  }): Promise<void> {
    const notification: NotificationData = {
      title: '🚨 New Incident Report',
      body: `New incident reported by ${incidentData.userName} in ${incidentData.location}`,
      data: {
        type: 'new_incident',
        incidentId: incidentData.id,
        userName: incidentData.userName,
        location: incidentData.location,
        description: incidentData.description
      }
    };

    await this.sendPushNotification(notification);
  }

  // Notify about system updates
  async notifySystemUpdate(updateData: {
    version: string;
    changes: string[];
  }): Promise<void> {
    const notification: NotificationData = {
      title: '🔄 System Update Available',
      body: `New version ${updateData.version} is available with improvements`,
      data: {
        type: 'system_update',
        version: updateData.version,
        changes: updateData.changes
      }
    };

    await this.sendPushNotification(notification);
  }

  // Notify about security alerts
  async notifySecurityAlert(alertData: {
    type: 'login_attempt' | 'password_change' | 'suspicious_activity';
    details: string;
  }): Promise<void> {
    const notification: NotificationData = {
      title: '🔒 Security Alert',
      body: alertData.details,
      data: {
        type: 'security_alert',
        alertType: alertData.type,
        details: alertData.details
      }
    };

    await this.sendPushNotification(notification);
  }

  // Handle notification tap
  handleNotificationTap(notificationData: any): void {
    console.log('🔔 Notification tapped:', notificationData);
    
    // Handle different notification types
    switch (notificationData.type) {
      case 'new_incident':
        // Navigate to incident details
        console.log('📋 Navigating to incident:', notificationData.incidentId);
        break;
      case 'system_update':
        // Show update details
        console.log('🔄 Showing system update details');
        break;
      case 'security_alert':
        // Show security alert details
        console.log('🔒 Showing security alert details');
        break;
      default:
        console.log('🔔 Unknown notification type:', notificationData.type);
    }
  }

  // Get notification settings
  getNotificationSettings(): {
    enabled: boolean;
    newIncidents: boolean;
    systemUpdates: boolean;
    securityAlerts: boolean;
  } {
    return {
      enabled: this.isEnabled,
      newIncidents: this.isEnabled,
      systemUpdates: this.isEnabled,
      securityAlerts: this.isEnabled
    };
  }

  // Update notification settings
  updateNotificationSettings(settings: {
    enabled?: boolean;
    newIncidents?: boolean;
    systemUpdates?: boolean;
    securityAlerts?: boolean;
  }): void {
    if (settings.enabled !== undefined) {
      this.setEnabled(settings.enabled);
    }
    
    console.log('🔔 Notification settings updated:', settings);
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();
