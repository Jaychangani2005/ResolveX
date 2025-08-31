import * as SMS from 'expo-sms';
import * as Contacts from 'expo-contacts';
import * as Location from 'expo-location';

export interface Contact {
  id: string;
  name: string;
  phoneNumbers: string[];
  organization?: string;
  jobTitle?: string;
}

export interface MessageTemplate {
  id: string;
  title: string;
  content: string;
  category: 'urgent' | 'general' | 'report' | 'inquiry';
}

export interface SMSSendResult {
  success: boolean;
  message: string;
  phoneNumbers: string[];
  failedNumbers?: string[];
}

export interface SMSHistoryItem {
  id: string;
  timestamp: Date;
  message: string;
  recipients: string[];
  success: boolean;
  failedNumbers?: string[];
}

export class SMSService {
  private static smsHistory: SMSHistoryItem[] = [];

  /**
   * Check if SMS functionality is available on the device
   */
  static async isAvailable(): Promise<boolean> {
    try {
      return await SMS.isAvailableAsync();
    } catch (error) {
      console.error('Error checking SMS availability:', error);
      return false;
    }
  }

  /**
   * Request contacts permission and load contacts
   */
  static async loadContacts(): Promise<Contact[]> {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Contacts permission denied');
      }

      console.log('📱 Loading contacts...');
      
      // Use minimal fields to avoid type casting issues
      const { data } = await Contacts.getContactsAsync({
        fields: [
          Contacts.Fields.Name,
          Contacts.Fields.PhoneNumbers
        ],
      });

      console.log('📱 Raw contacts data received:', data?.length || 0);

      if (!data || data.length === 0) {
        console.log('📱 No contacts found');
        return [];
      }

      const processedContacts = data
        .filter(contact => {
          // Ensure contact has required fields
          const hasPhoneNumbers = contact.phoneNumbers && 
            Array.isArray(contact.phoneNumbers) && 
            contact.phoneNumbers.length > 0;
          
          if (!hasPhoneNumbers) {
            console.log('📱 Skipping contact without phone numbers:', contact.name || 'Unknown');
          }
          
          return hasPhoneNumbers;
        })
        .map(contact => {
          // Safely extract phone numbers with null checks
          const phoneNumbers = contact.phoneNumbers
            ?.filter(phone => phone && phone.number)
            ?.map(phone => phone.number)
            ?.filter((number): number is string => Boolean(number)) || [];

          return {
            id: contact.id || `contact_${Date.now()}_${Math.random()}`,
            name: contact.name || 'Unknown Contact',
            phoneNumbers: phoneNumbers,
            organization: undefined, // Not available in this version
            jobTitle: undefined // Not available in this version
          };
        })
        .filter(contact => contact.phoneNumbers.length > 0); // Final filter for contacts with valid phone numbers

      console.log('📱 Processed contacts:', processedContacts.length);
      return processedContacts;
      
    } catch (error) {
      console.error('❌ Error loading contacts:', error);
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('permission')) {
          throw new Error('Contacts permission denied. Please enable contacts access in settings.');
        } else if (error.message.includes('cast') || error.message.includes('type')) {
          throw new Error('Contacts data format error. Please try again or restart the app.');
        } else {
          throw new Error(`Failed to load contacts: ${error.message}`);
        }
      } else {
        throw new Error('Unknown error occurred while loading contacts');
      }
    }
  }

  /**
   * Send SMS to multiple phone numbers
   */
  static async sendSMSToMultiple(
    phoneNumbers: string[], 
    message: string
  ): Promise<SMSSendResult> {
    const result: SMSSendResult = {
      success: false,
      message: '',
      phoneNumbers: [],
      failedNumbers: []
    };

    try {
      if (!message.trim()) {
        throw new Error('Message cannot be empty');
      }

      if (phoneNumbers.length === 0) {
        throw new Error('No phone numbers provided');
      }

      const isAvailable = await this.isAvailable();
      if (!isAvailable) {
        throw new Error('SMS functionality not available on this device');
      }

      const failedNumbers: string[] = [];
      let successCount = 0;

      for (const phoneNumber of phoneNumbers) {
        try {
          const { result: smsResult } = await SMS.sendSMSAsync([phoneNumber], message);
          
          if (smsResult === 'sent') {
            successCount++;
            console.log(`✅ SMS sent successfully to ${phoneNumber}`);
          } else {
            failedNumbers.push(phoneNumber);
            console.log(`❌ Failed to send SMS to ${phoneNumber}`);
          }
        } catch (error) {
          failedNumbers.push(phoneNumber);
          console.error(`Error sending SMS to ${phoneNumber}:`, error);
        }
      }

      result.success = successCount > 0;
      result.message = `SMS sent to ${successCount} out of ${phoneNumbers.length} recipients`;
      result.phoneNumbers = phoneNumbers;
      
      if (failedNumbers.length > 0) {
        result.failedNumbers = failedNumbers;
        result.message += `. Failed: ${failedNumbers.length}`;
      }

      // Add to SMS history
      this.addToHistory({
        id: Date.now().toString(),
        timestamp: new Date(),
        message,
        recipients: phoneNumbers,
        success: result.success,
        failedNumbers: result.failedNumbers
      });

      return result;
    } catch (error: any) {
      result.message = error.message || 'Failed to send SMS';
      return result;
    }
  }

  /**
   * Send SMS with location information
   */
  static async sendSMSWithLocation(
    phoneNumbers: string[], 
    message: string,
    includeLocation: boolean = true
  ): Promise<SMSSendResult> {
    let enhancedMessage = message;

    if (includeLocation) {
      try {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        const locationText = `📍 Location: ${location.coords.latitude.toFixed(6)}, ${location.coords.longitude.toFixed(6)}`;
        enhancedMessage = `${message}\n\n${locationText}`;
      } catch (error) {
        console.log('Could not get location, sending without location');
      }
    }

    return this.sendSMSToMultiple(phoneNumbers, enhancedMessage);
  }

  /**
   * Get predefined message templates
   */
  static getMessageTemplates(): MessageTemplate[] {
    return [
      {
        id: '1',
        title: 'Urgent Incident Report',
        content: '🚨 URGENT: Mangrove destruction detected at coordinates. Immediate action required. Please respond ASAP.',
        category: 'urgent'
      },
      {
        id: '2',
        title: 'General Inquiry',
        content: 'Hello, I have a question about mangrove conservation efforts in our area. When would be a good time to discuss?',
        category: 'inquiry'
      },
      {
        id: '3',
        title: 'Report Submission',
        content: '📸 New incident report submitted with photo evidence. Location coordinates captured. Please review and take necessary action.',
        category: 'report'
      },
      {
        id: '4',
        title: 'Follow-up Request',
        content: 'Following up on my previous report. Has there been any progress or action taken? Please provide an update.',
        category: 'general'
      },
      {
        id: '5',
        title: 'Volunteer Interest',
        content: 'I\'m interested in volunteering for mangrove conservation activities. Please let me know about upcoming opportunities.',
        category: 'inquiry'
      },
      {
        id: '6',
        title: 'Emergency Response',
        content: '🚨 EMERGENCY: Immediate assistance needed for mangrove area. Please contact emergency services and respond urgently.',
        category: 'urgent'
      },
      {
        id: '7',
        title: 'Conservation Update',
        content: '🌿 Conservation update: New mangrove saplings planted successfully. Area monitoring required. Please coordinate follow-up.',
        category: 'report'
      },
      {
        id: '8',
        title: 'Meeting Request',
        content: '📅 Requesting a meeting to discuss mangrove conservation strategies and community involvement. Please suggest available times.',
        category: 'inquiry'
      },
      {
        id: '9',
        title: 'Location-Based Report',
        content: '📍 Incident detected at current location. Please investigate the area for mangrove conservation issues.',
        category: 'report'
      },
      {
        id: '10',
        title: 'Community Alert',
        content: '📢 Community alert: Important mangrove conservation meeting scheduled. Please spread the word to local stakeholders.',
        category: 'general'
      }
    ];
  }

  /**
   * Get message templates by category
   */
  static getMessageTemplatesByCategory(category: string): MessageTemplate[] {
    return this.getMessageTemplates().filter(template => template.category === category);
  }

  /**
   * Filter contacts by search query
   */
  static filterContacts(contacts: Contact[], query: string): Contact[] {
    if (!query.trim()) return contacts;
    
    const searchTerm = query.toLowerCase();
    return contacts.filter(contact =>
      contact.name.toLowerCase().includes(searchTerm) ||
      contact.organization?.toLowerCase().includes(searchTerm) ||
      contact.jobTitle?.toLowerCase().includes(searchTerm) ||
      contact.phoneNumbers.some(phone => phone.includes(searchTerm))
    );
  }

  /**
   * Get contacts by organization type (NGO, Government, etc.)
   */
  static getContactsByOrganization(contacts: Contact[], organizationType: string): Contact[] {
    const type = organizationType.toLowerCase();
    return contacts.filter(contact => {
      const org = contact.organization?.toLowerCase() || '';
      const job = contact.jobTitle?.toLowerCase() || '';
      
      return org.includes(type) || job.includes(type);
    });
  }

  /**
   * Validate phone number format
   */
  static validatePhoneNumber(phoneNumber: string): boolean {
    // Enhanced phone number validation
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    const cleaned = phoneNumber.replace(/[\s\-\(\)]/g, '');
    return phoneRegex.test(cleaned);
  }

  /**
   * Format phone number for display
   */
  static formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Enhanced formatting for different country codes
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
      return `+91 ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`;
    }
    
    return phoneNumber;
  }

  /**
   * Add SMS to history
   */
  private static addToHistory(item: SMSHistoryItem): void {
    this.smsHistory.unshift(item);
    // Keep only last 50 messages
    if (this.smsHistory.length > 50) {
      this.smsHistory = this.smsHistory.slice(0, 50);
    }
  }

  /**
   * Get SMS history
   */
  static getSMSHistory(): SMSHistoryItem[] {
    return [...this.smsHistory];
  }

  /**
   * Clear SMS history
   */
  static clearSMSHistory(): void {
    this.smsHistory = [];
  }

  /**
   * Get SMS statistics
   */
  static getSMSStats(): { total: number; successful: number; failed: number } {
    const total = this.smsHistory.length;
    const successful = this.smsHistory.filter(item => item.success).length;
    const failed = total - successful;
    
    return { total, successful, failed };
  }

  /**
   * Create custom message template
   */
  static createCustomTemplate(title: string, content: string, category: string): MessageTemplate {
    return {
      id: `custom_${Date.now()}`,
      title,
      content,
      category: category as 'urgent' | 'general' | 'report' | 'inquiry'
    };
  }

  /**
   * Parse phone numbers from text
   */
  static parsePhoneNumbers(text: string): string[] {
    const phoneRegex = /[\+]?[1-9][\d]{0,15}/g;
    return text.match(phoneRegex) || [];
  }

  /**
   * Check if device supports MMS
   */
  static async isMMSAvailable(): Promise<boolean> {
    try {
      // This is a basic check - actual MMS support varies by device
      return await SMS.isAvailableAsync();
    } catch (error) {
      return false;
    }
  }
}
