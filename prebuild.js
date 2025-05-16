// prebuild.js
require('dotenv').config();

console.log('Environment variables loaded:');
console.log('CLERK_KEY:', process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ? 'FOUND' : 'MISSING');
console.log('API_IP:', process.env.EXPO_PUBLIC_API_IP ? 'FOUND' : 'MISSING');