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
    
    // Check if Session.subject column exists
    try {
      await prisma.$queryRaw`SELECT "subject" FROM "Session" LIMIT 1`;
      console.log('✅ Session.subject column already exists');
    } catch (error) {
      console.log('❌ Session.subject column missing - adding it now...');
      await prisma.$executeRaw`ALTER TABLE "Session" ADD COLUMN "subject" TEXT NOT NULL DEFAULT 'General'`;
      console.log('✅ Session.subject column added');
    }
    
    // Check if Session.tutorId column exists
    try {
      await prisma.$queryRaw`SELECT "tutorId" FROM "Session" LIMIT 1`;
      console.log('✅ Session.tutorId column already exists');
    } catch (error) {
      console.log('❌ Session.tutorId column missing - adding it now...');
      await prisma.$executeRaw`ALTER TABLE "Session" ADD COLUMN "tutorId" TEXT`;
      console.log('✅ Session.tutorId column added');
    }
    
    // Check if Session.connectionId column exists
    try {
      await prisma.$queryRaw`SELECT "connectionId" FROM "Session" LIMIT 1`;
      console.log('✅ Session.connectionId column already exists');
    } catch (error) {
      console.log('❌ Session.connectionId column missing - adding it now...');
      await prisma.$executeRaw`ALTER TABLE "Session" ADD COLUMN "connectionId" TEXT`;
      console.log('✅ Session.connectionId column added');
    }
    
    // Check if Session.title column exists
    try {
      await prisma.$queryRaw`SELECT "title" FROM "Session" LIMIT 1`;
      console.log('✅ Session.title column already exists');
    } catch (error) {
      console.log('❌ Session.title column missing - adding it now...');
      await prisma.$executeRaw`ALTER TABLE "Session" ADD COLUMN "title" TEXT`;
      console.log('✅ Session.title column added');
    }
    
    // Check if Session.notes column exists
    try {
      await prisma.$queryRaw`SELECT "notes" FROM "Session" LIMIT 1`;
      console.log('✅ Session.notes column already exists');
    } catch (error) {
      console.log('❌ Session.notes column missing - adding it now...');
      await prisma.$executeRaw`ALTER TABLE "Session" ADD COLUMN "notes" TEXT`;
      console.log('✅ Session.notes column added');
    }
    
    // Check if Session.homework column exists
    try {
      await prisma.$queryRaw`SELECT "homework" FROM "Session" LIMIT 1`;
      console.log('✅ Session.homework column missing - adding it now...');
    } catch (error) {
      console.log('❌ Session.homework column missing - adding it now...');
      await prisma.$executeRaw`ALTER TABLE "Session" ADD COLUMN "homework" TEXT`;
      console.log('✅ Session.homework column added');
    }
    
    // Check if Session.location column exists
    try {
      await prisma.$queryRaw`SELECT "location" FROM "Session" LIMIT 1`;
      console.log('✅ Session.location column already exists');
    } catch (error) {
      console.log('❌ Session.location column missing - adding it now...');
      await prisma.$executeRaw`ALTER TABLE "Session" ADD COLUMN "location" TEXT`;
      console.log('✅ Session.location column added');
    }
    
    // Check if Session.meetingLink column exists
    try {
      await prisma.$queryRaw`SELECT "meetingLink" FROM "Session" LIMIT 1`;
      console.log('✅ Session.meetingLink column already exists');
    } catch (error) {
      console.log('❌ Session.meetingLink column missing - adding it now...');
      await prisma.$executeRaw`ALTER TABLE "Session" ADD COLUMN "meetingLink" TEXT`;
      console.log('✅ Session.meetingLink column added');
    }
    
    // Check if Session.status column exists
    try {
      await prisma.$queryRaw`SELECT "status" FROM "Session" LIMIT 1`;
      console.log('✅ Session.status column already exists');
    } catch (error) {
      console.log('❌ Session.status column missing - adding it now...');
      await prisma.$executeRaw`ALTER TABLE "Session" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'scheduled'`;
      console.log('✅ Session.status column added');
    }
    
    // Check if Session.endTime column exists
    try {
      await prisma.$queryRaw`SELECT "endTime" FROM "Session" LIMIT 1`;
      console.log('✅ Session.endTime column already exists');
    } catch (error) {
      console.log('❌ Session.endTime column missing - adding it now...');
      await prisma.$executeRaw`ALTER TABLE "Session" ADD COLUMN "endTime" TIMESTAMP`;
      console.log('✅ Session.endTime column added');
    }
    
    // Add indexes for performance
    console.log('🔍 Adding database indexes...');
    
    try {
      await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "Session_tutorId_idx" ON "Session"("tutorId")`;
      await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "Session_connectionId_idx" ON "Session"("connectionId")`;
      await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "Session_startTime_idx" ON "Session"("startTime")`;
      await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "Session_status_idx" ON "Session"("status")`;
      await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "Session_subject_idx" ON "Session"("subject")`;
      console.log('✅ Database indexes added');
    } catch (error) {
      console.log('⚠️ Some indexes may already exist:', error.message);
    }
    
    console.log('🎉 Production database migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateProduction()
    .then(() => {
      console.log('✅ Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateProduction };
