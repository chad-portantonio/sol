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
    
    // Check if Session.tutorId column exists
    try {
      await prisma.$queryRaw`SELECT "tutorId" FROM "Session" LIMIT 1`;
      console.log('✅ Session.tutorId column already exists');
    } catch (error) {
      console.log('❌ Session.tutorId column missing, adding it...');
      
      // Add the missing tutorId column to Session table
      await prisma.$executeRaw`ALTER TABLE "Session" ADD COLUMN "tutorId" TEXT`;
      console.log('✅ Added Session.tutorId column');
      
      // Add index for performance
      await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "Session_tutorId_idx" ON "Session"("tutorId")`;
      console.log('✅ Added index on Session.tutorId');
    }
    
    // Check if Session.connectionId column exists
    try {
      await prisma.$queryRaw`SELECT "connectionId" FROM "Session" LIMIT 1`;
      console.log('✅ Session.connectionId column already exists');
    } catch (error) {
      console.log('❌ Session.connectionId column missing, adding it...');
      
      // Add the missing connectionId column to Session table
      await prisma.$executeRaw`ALTER TABLE "Session" ADD COLUMN "connectionId" TEXT`;
      console.log('✅ Added Session.connectionId column');
      
      // Add index for performance
      await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "Session_connectionId_idx" ON "Session"("connectionId")`;
      console.log('✅ Added index on Session.connectionId');
    }
    
    // Check if Session.title column exists
    try {
      await prisma.$queryRaw`SELECT "title" FROM "Session" LIMIT 1`;
      console.log('✅ Session.title column already exists');
    } catch (error) {
      console.log('❌ Session.title column missing, adding it...');
      
      // Add the missing title column to Session table
      await prisma.$executeRaw`ALTER TABLE "Session" ADD COLUMN "title" TEXT`;
      console.log('✅ Added Session.title column');
    }
    
    // Check if Session.location column exists
    try {
      await prisma.$queryRaw`SELECT "location" FROM "Session" LIMIT 1`;
      console.log('✅ Session.location column already exists');
    } catch (error) {
      console.log('❌ Session.location column missing, adding it...');
      
      // Add the missing location column to Session table
      await prisma.$executeRaw`ALTER TABLE "Session" ADD COLUMN "location" TEXT`;
      console.log('✅ Added Session.location column');
    }
    
    // Check if Session.meetingLink column exists
    try {
      await prisma.$queryRaw`SELECT "meetingLink" FROM "Session" LIMIT 1`;
      console.log('✅ Session.meetingLink column already exists');
    } catch (error) {
      console.log('❌ Session.meetingLink column missing, adding it...');
      
      // Add the missing meetingLink column to Session table
      await prisma.$executeRaw`ALTER TABLE "Session" ADD COLUMN "meetingLink" TEXT`;
      console.log('✅ Added Session.meetingLink column');
    }
    
    console.log('✅ Schema changes applied successfully');
    console.log('✅ Migration completed!');
    
    // Verify the Tutor table structure
    const tutorCount = await prisma.tutor.count();
    console.log(`📈 Current tutor count: ${tutorCount}`);
    
    // Verify the Session table structure
    const sessionCount = await prisma.session.count();
    console.log(`📈 Current session count: ${sessionCount}`);
    
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
