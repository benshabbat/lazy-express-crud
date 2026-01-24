// Simple test script for authentication endpoints
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000/api/auth';

async function testAuth() {
  console.log('🧪 Testing Authentication Endpoints\n');
  
  try {
    // Test 1: Register new user
    console.log('1. Testing POST /api/auth/register');
    const registerResponse = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      })
    });
    
    const registerData = await registerResponse.json();
    console.log('✓ Register response:', registerData);
    const token = registerData.token;
    
    // Test 2: Login
    console.log('\n2. Testing POST /api/auth/login');
    const loginResponse = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('✓ Login response:', loginData);
    
    // Test 3: Get current user (protected route)
    console.log('\n3. Testing GET /api/auth/me (protected)');
    const meResponse = await fetch(`${BASE_URL}/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const meData = await meResponse.json();
    console.log('✓ Me response:', meData);
    
    // Test 4: Test without token (should fail)
    console.log('\n4. Testing GET /api/auth/me without token');
    const noTokenResponse = await fetch(`${BASE_URL}/me`);
    const noTokenData = await noTokenResponse.json();
    console.log('✓ Expected failure:', noTokenData);
    
    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run tests
console.log('Note: Make sure the server is running on port 3000');
console.log('Run: node src/server.js in the auth-test directory\n');
testAuth();
