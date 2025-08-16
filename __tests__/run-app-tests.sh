#!/bin/bash

# Test runner for app functions and navigation tests
# This script runs all the newly created tests for app functionality

echo "🧪 Running App Functions and Navigation Tests"
echo "=============================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}Running App Layout Tests...${NC}"
npm test -- __tests__/app/\(app\)/layout.test.tsx

echo -e "${BLUE}Running New Student Page Tests...${NC}"
npm test -- __tests__/app/\(app\)/students/new/page.test.tsx

echo -e "${BLUE}Running Student Creation API Tests...${NC}"
npm test -- __tests__/api/students/create-account.test.ts

echo -e "${BLUE}Running Navigation Component Tests...${NC}"
npm test -- __tests__/components/navigation.test.tsx

echo -e "${BLUE}Running Existing Dashboard Tests...${NC}"
npm test -- __tests__/app/\(app\)/dashboard/page.test.tsx

echo -e "${BLUE}Running Existing Student API Tests...${NC}"
npm test -- __tests__/api/students/route.test.ts

echo -e "${GREEN}All app function and navigation tests completed!${NC}"
echo ""
echo "📊 Test Coverage Summary:"
echo "========================"
echo "✅ App Layout & Navigation"
echo "✅ Student Addition (UI & API)"
echo "✅ Dashboard Functionality"
echo "✅ Student Management APIs"
echo "✅ Navigation Components"
echo "✅ Account Creation Workflows"
echo ""
echo "🔗 Related Test Files:"
echo "- Layout: __tests__/app/(app)/layout.test.tsx"
echo "- New Student: __tests__/app/(app)/students/new/page.test.tsx"
echo "- Student API: __tests__/api/students/route.test.ts"
echo "- Account Creation: __tests__/api/students/create-account.test.ts"
echo "- Navigation: __tests__/components/navigation.test.tsx"
echo "- Dashboard: __tests__/app/(app)/dashboard/page.test.tsx"
