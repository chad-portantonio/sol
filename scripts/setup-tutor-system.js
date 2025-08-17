#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Nova Tutor System Setup');
console.log('==========================\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local file not found!');
  console.log('\n📝 Please create a .env.local file with the following variables:');
  console.log('   - DATABASE_URL (required for database operations)');
  console.log('   - NEXT_PUBLIC_SUPABASE_URL (required for auth)');
  console.log('   - NEXT_PUBLIC_SUPABASE_ANON_KEY (required for auth)');
  console.log('\n💡 You can copy from env.example and fill in your values.');
  console.log('\n🔗 Get these values from your Supabase project dashboard.');
  process.exit(1);
}

console.log('✅ .env.local file found');

// Check for required environment variables
const envContent = fs.readFileSync(envPath, 'utf8');
const requiredVars = [
  'DATABASE_URL',
  'NEXT_PUBLIC_SUPABASE_URL', 
  'NEXT_PUBLIC_SUPABASE_ANON_KEY'
];

const missingVars = [];
for (const varName of requiredVars) {
  if (!envContent.includes(`${varName}=`)) {
    missingVars.push(varName);
  }
}

if (missingVars.length > 0) {
  console.log(`❌ Missing required environment variables: ${missingVars.join(', ')}`);
  console.log('\n📝 Please add these to your .env.local file and try again.');
  process.exit(1);
}

console.log('✅ All required environment variables found');

console.log('\n📋 Next Steps:');
console.log('1. Run: npx prisma db push');
console.log('2. Run: node scripts/migrate-tutor-profiles.js');
console.log('3. Start your development server: npm run dev');
console.log('\n🎯 Your tutor system will be ready to use!');

console.log('\n💡 Remember to:');
console.log('   - Set up Supabase storage bucket "tutor-images" for profile photos');
console.log('   - Test the tutor sign-up flow');
console.log('   - Verify tutors appear in the browse page');

console.log('\n✨ Setup complete!');
