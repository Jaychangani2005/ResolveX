// Test SMS Notification Functionality
// This file tests the SMS notification feature for incident reports

const { SMSService } = require('./services/smsService');

// Mock incident data for testing
const testIncidentData = {
  incidentId: 'TEST_INCIDENT_001',
  userName: 'John Doe',
  location: {
    latitude: 12.9716,
    longitude: 77.5946,
    fullAddress: 'Bangalore, Karnataka, India',
    address: 'Test Address',
    city: 'Bangalore',
    state: 'Karnataka',
    country: 'India'
  },
  description: 'Test incident report for mangrove conservation. This is a sample description to test the SMS notification functionality.'
};

// Test SMS message creation
function createTestSMSMessage() {
  const message = `🚨 NEW INCIDENT REPORT\n\n` +
    `Report ID: ${testIncidentData.incidentId}\n` +
    `Reporter: ${testIncidentData.userName}\n` +
    `Location: ${testIncidentData.location.latitude.toFixed(6)}, ${testIncidentData.location.longitude.toFixed(6)}\n` +
    `Address: ${testIncidentData.location.fullAddress || testIncidentData.location.address || 'Not available'}\n` +
    `Description: ${testIncidentData.description.substring(0, 100)}${testIncidentData.description.length > 100 ? '...' : ''}\n\n` +
    `Please review and take necessary action.`;
  
  console.log('📱 Test SMS Message:');
  console.log(message);
  console.log('\n📏 Message length:', message.length, 'characters');
  
  return message;
}

// Test SMS service availability
async function testSMSService() {
  console.log('🧪 Testing SMS Service...\n');
  
  try {
    // Test SMS availability
    const isAvailable = await SMSService.isAvailable();
    console.log('📱 SMS Available:', isAvailable ? '✅ Yes' : '❌ No');
    
    if (!isAvailable) {
      console.log('⚠️ SMS functionality not available on this device/simulator');
      return;
    }
    
    // Create test message
    const testMessage = createTestSMSMessage();
    
    // Test with a dummy phone number (won't actually send in test)
    const testPhoneNumber = '+1234567890';
    console.log('\n📱 Test phone number:', testPhoneNumber);
    
    // Note: In a real test, you would need a valid phone number
    console.log('⚠️ Note: SMS will not be sent in test mode. Use a real device with valid phone number for actual testing.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Configuration test
function testConfiguration() {
  console.log('⚙️ Testing SMS Configuration...\n');
  
  const config = {
    ADMIN_PHONE_NUMBER: '+1234567890',
    ENABLE_SMS_NOTIFICATIONS: true,
    MAX_DESCRIPTION_LENGTH: 100
  };
  
  console.log('📱 Admin Phone Number:', config.ADMIN_PHONE_NUMBER);
  console.log('🔔 SMS Notifications Enabled:', config.ENABLE_SMS_NOTIFICATIONS ? '✅ Yes' : '❌ No');
  console.log('📏 Max Description Length:', config.MAX_DESCRIPTION_LENGTH);
  
  // Test phone number validation
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  const cleaned = config.ADMIN_PHONE_NUMBER.replace(/[\s\-\(\)]/g, '');
  const isValid = phoneRegex.test(cleaned);
  
  console.log('✅ Phone Number Valid:', isValid ? 'Yes' : 'No');
}

// Run tests
console.log('🚀 Starting SMS Notification Tests...\n');

testConfiguration();
console.log('\n' + '='.repeat(50) + '\n');
testSMSService();

console.log('\n✅ SMS Notification Tests Completed!');
console.log('\n📋 Next Steps:');
console.log('1. Update the ADMIN_PHONE_NUMBER in firebaseService.ts with a real phone number');
console.log('2. Test on a real device (not simulator)');
console.log('3. Submit an incident report to trigger the SMS notification');
console.log('4. Check the console logs for SMS status');
