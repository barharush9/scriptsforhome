#!/usr/bin/env node

/**
 * Quick status check script for the Apartment Scanner project
 */

const http = require('http');
const { execSync } = require('child_process');

console.log('🏠 Apartment Scanner - Status Check\n');

// Test Backend API
console.log('🔧 Testing Backend API...');
try {
  const response = execSync('curl -s http://localhost:3000/api/listings', { encoding: 'utf8' });
  const data = JSON.parse(response);
  if (data.success) {
    console.log(`✅ Backend API is running on http://localhost:3000`);
    console.log(`📊 Found ${data.data.length} listings in database/memory`);
  } else {
    console.log('❌ Backend API returned error');
  }
} catch (error) {
  console.log('❌ Backend API is not running or not responding');
  console.log('   Run: cd backend && npm run dev');
}

// Test Frontend
console.log('\n🎨 Testing Frontend...');
try {
  execSync('curl -s http://localhost:5175 > nul', { encoding: 'utf8' });
  console.log('✅ Frontend is running on http://localhost:5175');
} catch (error) {
  console.log('❌ Frontend is not running');
  console.log('   Run: cd frontend && npm run dev');
}

console.log('\n📋 Quick Start Commands:');
console.log('Backend:  cd backend && npm run dev');
console.log('Frontend: cd frontend && npm run dev');
console.log('Status:   node status.js');

console.log('\n🌐 Access URLs:');
console.log('Frontend: http://localhost:5175');
console.log('Backend:  http://localhost:3000/api/listings');
