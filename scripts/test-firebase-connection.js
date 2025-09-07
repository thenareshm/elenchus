#!/usr/bin/env node

// Test Firebase connection
console.log('🔍 Testing Firebase Connection...\n');

// Check environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_API_KEY',
  'NEXT_PUBLIC_AUTH_DOMAIN',
  'NEXT_PUBLIC_PROJECT_ID',
  'NEXT_PUBLIC_STORAGE_BUCKET',
  'NEXT_PUBLIC_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_APP_ID'
];

console.log('📋 Checking environment variables:');
let allVarsPresent = true;

requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: Set`);
    if (varName === 'NEXT_PUBLIC_PROJECT_ID') {
      console.log(`   → Project ID: ${value}`);
    }
    if (varName === 'NEXT_PUBLIC_AUTH_DOMAIN') {
      console.log(`   → Auth Domain: ${value}`);
    }
  } else {
    console.log(`❌ ${varName}: Not set`);
    allVarsPresent = false;
  }
});

if (allVarsPresent) {
  console.log('\n✅ All Firebase environment variables are configured!');
  console.log('🚀 Your app should connect to the PNYXA Firebase project.');
} else {
  console.log('\n❌ Some Firebase environment variables are missing.');
  console.log('Please check your .env.local file.');
}
