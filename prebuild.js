// prebuild.js
require('dotenv').config();

console.log('\n📦 Environment variables check:');
console.log('---------------------------------------');
console.log('CLERK_KEY:', process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ? 
  `FOUND (starts with ${process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY.substring(0, 5)}...)` : 
  'MISSING ⚠️');
console.log('API_IP:', process.env.EXPO_PUBLIC_API_IP ? 
  `FOUND (${process.env.EXPO_PUBLIC_API_IP})` : 
  'MISSING ⚠️');
console.log('---------------------------------------');

// Enhanced check to verify the exact issue
if (!process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || !process.env.EXPO_PUBLIC_API_IP) {
  console.log('\n⚠️ Some environment variables are missing!');
  console.log('Please check your .env file has the following format:');
  console.log('---------------------------------------');
  console.log('EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here');
  console.log('EXPO_PUBLIC_API_IP=your_ip_here');
  console.log('---------------------------------------');
  console.log('Make sure there are no spaces, quotes, or comments in these lines.');
  console.log('The .env file should be in the root of your project.\n');
}

// Modify app.config.js to include environment variables
const fs = require('fs');
const path = require('path');

const appConfigPath = path.join(__dirname, 'app.config.js');

if (fs.existsSync(appConfigPath)) {
  console.log('📝 Updating app.config.js to include environment variables...');
  
  let appConfig = fs.readFileSync(appConfigPath, 'utf8');
  
  // Create pattern for extra section
  const extraPattern = /extra\s*:\s*{([^}]*)}/;
  
  if (extraPattern.test(appConfig)) {
    // Update existing extra section
    appConfig = appConfig.replace(extraPattern, (match, extraContent) => {
      return `extra: {${extraContent},
    // Added by prebuild.js
    clerkPublishableKey: "${process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || ''}",
    apiUrl: "${process.env.EXPO_PUBLIC_API_IP || ''}",
  }`;
    });
  } else {
    // Add new extra section if it doesn't exist
    console.log('Could not find an existing extra section. Adding a new one.');
    appConfig = appConfig.replace(/export default \(\{ config \}\) => \(\{/, 
      `export default ({ config }) => ({
  extra: {
    // Added by prebuild.js
    clerkPublishableKey: "${process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || ''}",
    apiUrl: "${process.env.EXPO_PUBLIC_API_IP || ''}",
  },`);
  }
  
  // Write updated config back to file
  fs.writeFileSync(appConfigPath, appConfig);
  console.log('✅ app.config.js updated successfully!\n');
} else {
  console.log('❌ Could not find app.config.js in the project root.\n');
}

console.log('🚀 Environment check complete. Ready for prebuild.\n');
