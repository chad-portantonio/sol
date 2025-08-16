#!/bin/bash

# Setup script for testing tutors table database operations
# This script helps you set up a test database for running the integration tests

echo "🚀 Setting up test database for tutors table tests..."

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed or not in PATH"
    echo "💡 Please install PostgreSQL first:"
    echo "   - macOS: brew install postgresql"
    echo "   - Ubuntu: sudo apt-get install postgresql postgresql-contrib"
    echo "   - Windows: Download from https://www.postgresql.org/download/windows/"
    exit 1
fi

# Check if createdb command is available
if ! command -v createdb &> /dev/null; then
    echo "❌ createdb command not found"
    echo "💡 Please ensure PostgreSQL client tools are installed"
    exit 1
fi

# Set default values
TEST_DB_NAME="nova_test_db"
TEST_USER="nova_test_user"
TEST_PASSWORD="nova_test_password"

# Check if database already exists
if psql -lqt | cut -d \| -f 1 | grep -qw "$TEST_DB_NAME"; then
    echo "⚠️  Test database '$TEST_DB_NAME' already exists"
    read -p "Do you want to drop and recreate it? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🗑️  Dropping existing test database..."
        dropdb "$TEST_DB_NAME" 2>/dev/null || true
    else
        echo "✅ Using existing test database"
        TEST_DB_EXISTS=true
    fi
fi

if [ "$TEST_DB_EXISTS" != "true" ]; then
    echo "🔧 Creating test database '$TEST_DB_NAME'..."
    
    # Create test database
    if createdb "$TEST_DB_NAME"; then
        echo "✅ Test database created successfully"
    else
        echo "❌ Failed to create test database"
        echo "💡 You may need to create a PostgreSQL user first:"
        echo "   sudo -u postgres createuser --interactive"
        exit 1
    fi
fi

# Create .env.test file
ENV_TEST_FILE=".env.test"
echo "🔧 Creating $ENV_TEST_FILE file..."

cat > "$ENV_TEST_FILE" << EOF
# Test database configuration
DATABASE_URL="postgresql://localhost:5432/$TEST_DB_NAME"

# Test environment variables
NODE_ENV=test
NEXT_PUBLIC_SUPABASE_URL=https://test.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=test-anon-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_test
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF

echo "✅ Created $ENV_TEST_FILE file"

# Run Prisma migrations on test database
echo "🔧 Running Prisma migrations on test database..."
export DATABASE_URL="postgresql://localhost:5432/$TEST_DB_NAME"

if npx prisma migrate deploy; then
    echo "✅ Prisma migrations completed successfully"
else
    echo "❌ Failed to run Prisma migrations"
    echo "💡 Make sure your database is accessible and you have the right permissions"
    exit 1
fi

# Generate Prisma client for test database
echo "🔧 Generating Prisma client for test database..."
if npx prisma generate; then
    echo "✅ Prisma client generated successfully"
else
    echo "❌ Failed to generate Prisma client"
    exit 1
fi

echo ""
echo "🎉 Test database setup complete!"
echo ""
echo "📋 To run the tutor table tests:"
echo "   1. Source the test environment: source .env.test"
echo "   2. Run the tests: npm test -- __tests__/api/tutors/"
echo ""
echo "📋 To run specific test files:"
echo "   - Simple tests (no DB): npm test -- __tests__/api/tutors/simple.test.ts"
echo "   - Integration tests: npm test -- __tests__/api/tutors/create.integration.test.ts"
echo "   - Direct DB tests: npm test -- __tests__/api/tutors/database.test.ts"
echo ""
echo "📋 To clean up:"
echo "   - Drop test database: dropdb $TEST_DB_NAME"
echo "   - Remove .env.test: rm .env.test"
echo ""
echo "💡 The test database is completely separate from your development/production database"
echo "💡 All test data will be automatically cleaned up after each test run"
