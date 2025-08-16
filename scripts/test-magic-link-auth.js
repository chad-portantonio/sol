#!/usr/bin/env node

/**
 * Magic Link Authentication Testing Script
 * 
 * This script helps test the magic link authentication flow
 * by making requests to the debug endpoint and testing URL parsing.
 */

const https = require('https');
const { URL } = require('url');

const config = {
  baseUrl: process.env.NODE_ENV === 'production' 
    ? 'https://portantonio.co' 
    : 'http://localhost:3000',
  debugEndpoint: '/api/debug/auth',
};

/**
 * Test URL parsing functionality
 */
function testUrlParsing() {
  console.log('🔍 Testing URL Parsing...');
  
  const testUrls = [
    'https://tiksarfxpxskdrbxijqd.supabase.co/auth/v1/verify?token=pkce_05f7a51f9235e6c535af95dd6fe641d9bebf9ed34c5794062b56c1fd&type=signup&redirect_to=https://portantonio.co/auth/callback',
    'https://portantonio.co/auth/callback?token=pkce_12345&type=signup&next=/dashboard',
    'https://portantonio.co/auth/callback?code=auth_code_12345',
    'https://portantonio.co/auth/callback?token=regular_token&type=recovery',
  ];
  
  testUrls.forEach((testUrl, index) => {
    try {
      const url = new URL(testUrl);
      const token = url.searchParams.get('token');
      const type = url.searchParams.get('type');
      const code = url.searchParams.get('code');
      const redirectTo = url.searchParams.get('redirect_to');
      const next = url.searchParams.get('next');
      
      console.log(`\n  Test ${index + 1}:`);
      console.log(`    URL: ${testUrl}`);
      console.log(`    Token: ${token ? (token.startsWith('pkce_') ? 'PKCE' : 'OTP') : 'None'}`);
      console.log(`    Type: ${type || 'None'}`);
      console.log(`    Code: ${code ? 'Present' : 'None'}`);
      console.log(`    Redirect: ${redirectTo || next || 'Default'}`);
      
      // Determine auth method
      let method = 'UNKNOWN';
      if (code) {
        method = 'OAuth/PKCE Code Exchange';
      } else if (token && type) {
        method = token.startsWith('pkce_') ? 'PKCE Token Exchange' : 'OTP Verification';
      }
      console.log(`    Method: ${method}`);
      
    } catch (error) {
      console.log(`  ❌ Test ${index + 1} failed: ${error.message}`);
    }
  });
  
  console.log('\n✅ URL Parsing tests completed');
}

/**
 * Test PKCE token validation
 */
function testPKCEValidation() {
  console.log('\n🔑 Testing PKCE Token Validation...');
  
  const tokens = [
    'pkce_05f7a51f9235e6c535af95dd6fe641d9bebf9ed34c5794062b56c1fd', // Valid
    'pkce_12345abcdef', // Valid short
    'regular_token_123', // Not PKCE
    'pkce_', // Too short
    'notpkce_12345', // Wrong prefix
  ];
  
  tokens.forEach((token, index) => {
    const isPKCE = token.startsWith('pkce_') && token.length > 5;
    const isValid = isPKCE && /^pkce_[a-zA-Z0-9]+$/.test(token);
    
    console.log(`  Token ${index + 1}: ${token.substring(0, 20)}${token.length > 20 ? '...' : ''}`);
    console.log(`    Is PKCE: ${isPKCE ? '✅' : '❌'}`);
    console.log(`    Is Valid: ${isValid ? '✅' : '❌'}`);
  });
  
  console.log('\n✅ PKCE validation tests completed');
}

/**
 * Test debug endpoint (if available)
 */
async function testDebugEndpoint() {
  console.log('\n🔧 Testing Debug Endpoint...');
  
  const testParams = [
    '?token=pkce_test123&type=signup',
    '?code=auth_test123',
    '?token=regular_test&type=recovery',
    '', // No parameters
  ];
  
  for (const params of testParams) {
    try {
      const url = `${config.baseUrl}${config.debugEndpoint}${params}`;
      console.log(`\n  Testing: ${url}`);
      
      const response = await makeRequest(url);
      console.log(`    Status: ${response.status}`);
      
      if (response.status === 200) {
        const data = JSON.parse(response.body);
        console.log(`    Timestamp: ${data.timestamp}`);
        console.log(`    Parameters: ${JSON.stringify(data.searchParams)}`);
        
        if (data.supabase) {
          console.log(`    Supabase: ${data.supabase.hasUser ? 'User Found' : 'No User'}`);
        }
      }
      
    } catch (error) {
      console.log(`    ❌ Error: ${error.message}`);
    }
  }
  
  console.log('\n✅ Debug endpoint tests completed');
}

/**
 * Make HTTP request
 */
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'GET',
      timeout: 5000,
    };
    
    const client = parsedUrl.protocol === 'https:' ? https : require('http');
    
    const req = client.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: body,
        });
      });
    });
    
    req.on('error', reject);
    req.on('timeout', () => reject(new Error('Request timeout')));
    req.setTimeout(5000);
    req.end();
  });
}

/**
 * Generate test magic link URL
 */
function generateTestMagicLink() {
  console.log('\n🔗 Generating Test Magic Link URLs...');
  
  const testScenarios = [
    {
      name: 'PKCE Signup',
      token: 'pkce_' + Math.random().toString(36).substring(2, 15),
      type: 'signup',
      redirectTo: `${config.baseUrl}/auth/callback`,
    },
    {
      name: 'PKCE Recovery',
      token: 'pkce_' + Math.random().toString(36).substring(2, 15),
      type: 'recovery',
      redirectTo: `${config.baseUrl}/auth/callback`,
    },
    {
      name: 'OAuth Authorization',
      code: 'auth_' + Math.random().toString(36).substring(2, 15),
      redirectTo: `${config.baseUrl}/auth/callback`,
    },
  ];
  
  testScenarios.forEach((scenario, index) => {
    console.log(`\n  ${index + 1}. ${scenario.name}:`);
    
    if (scenario.token) {
      const url = `https://test.supabase.co/auth/v1/verify?token=${scenario.token}&type=${scenario.type}&redirect_to=${encodeURIComponent(scenario.redirectTo)}`;
      console.log(`    Magic Link: ${url}`);
      
      const callbackUrl = `${scenario.redirectTo}?token=${scenario.token}&type=${scenario.type}`;
      console.log(`    Callback URL: ${callbackUrl}`);
    } else if (scenario.code) {
      const callbackUrl = `${scenario.redirectTo}?code=${scenario.code}`;
      console.log(`    Callback URL: ${callbackUrl}`);
    }
  });
  
  console.log('\n✅ Test URLs generated');
}

/**
 * Validate production configuration
 */
function validateConfiguration() {
  console.log('\n⚙️  Validating Configuration...');
  
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ];
  
  console.log(`  Base URL: ${config.baseUrl}`);
  console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
  
  requiredEnvVars.forEach(envVar => {
    const value = process.env[envVar];
    console.log(`  ${envVar}: ${value ? '✅ Set' : '❌ Missing'}`);
  });
  
  // Test URL validation
  const testUrls = [
    config.baseUrl + '/auth/callback',
    config.baseUrl + '/sign-in',
    config.baseUrl + '/dashboard',
  ];
  
  console.log('\n  Testing URL formats:');
  testUrls.forEach(url => {
    try {
      new URL(url);
      console.log(`    ${url}: ✅ Valid`);
    } catch (error) {
      console.log(`    ${url}: ❌ Invalid`);
    }
  });
  
  console.log('\n✅ Configuration validation completed');
}

/**
 * Main test runner
 */
async function main() {
  console.log('🚀 Magic Link Authentication Test Suite');
  console.log('=====================================\n');
  
  try {
    validateConfiguration();
    testUrlParsing();
    testPKCEValidation();
    generateTestMagicLink();
    
    // Only test debug endpoint if not in CI
    if (!process.env.CI) {
      await testDebugEndpoint();
    }
    
    console.log('\n🎉 All tests completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Test magic link request from your sign-in page');
    console.log('2. Check email for magic link');
    console.log('3. Click magic link and verify redirect');
    console.log('4. Check browser console for debug logs');
    
  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  testUrlParsing,
  testPKCEValidation,
  generateTestMagicLink,
  validateConfiguration,
};
