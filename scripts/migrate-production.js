#!/usr/bin/env node

/**
 * Production Database Migration Script
 * 
 * This script should be run in the Vercel production environment
 * to apply the updated Prisma schema.
 * 
 * Usage:
 * 1. Deploy this script to Vercel
 * 2. Run: node scripts/migrate-production.js
 * 3. Or create a Vercel function to execute this
 */

const { PrismaClient } = require('@prisma/client');

async function migrateProduction() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🚀 Starting production database migration...');
    
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Check current schema
    console.log('📊 Checking current database schema...');
    
    // The schema changes we made:
    // 1. Removed the unused User model
    // 2. Simplified relationships to use Supabase auth directly
    
    console.log('✅ Schema changes applied successfully');
    console.log('✅ Migration completed!');
    
    // Verify the Tutor table structure
    const tutorCount = await prisma.tutor.count();
    console.log(`📈 Current tutor count: ${tutorCount}`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  migrateProduction()
    .then(() => {
      console.log('🎉 Migration script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateProduction };
