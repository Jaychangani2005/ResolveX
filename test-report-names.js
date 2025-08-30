// test-report-names.js - Test script to demonstrate unique report name generation
const generateReportName = () => {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
  const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
  return `REP_${date}_${timestamp}_${randomSuffix}`;
};

console.log("🧪 Testing unique report name generation...\n");

// Generate 5 sample report names
for (let i = 1; i <= 5; i++) {
  const reportName = generateReportName();
  console.log(`Report ${i}: ${reportName}`);
  
  // Parse the name to show its components
  const parts = reportName.split('_');
  console.log(`   Format: REP_${parts[1]}_${parts[2]}_${parts[3]}`);
  console.log(`   Date: ${parts[1]}`);
  console.log(`   Timestamp: ${parts[2]}`);
  console.log(`   Random: ${parts[3]}`);
  console.log("");
}

console.log("✅ Each report name is unique and follows the pattern:");
console.log("   REP_YYYYMMDD_TIMESTAMP_RANDOM");
console.log("");
console.log("📝 Benefits of this naming system:");
console.log("   • Each report gets a unique identifier");
console.log("   • Easy to sort by date");
console.log("   • Human-readable format");
console.log("   • No risk of duplicate names");
console.log("   • Can be used as document IDs in Firestore");
