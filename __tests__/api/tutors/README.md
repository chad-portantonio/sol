# Tutor Database Tests

This directory contains comprehensive tests for the tutors table database operations.

## Test Files

### 1. `create.test.ts` - API Endpoint Tests (Mocked)
- Tests the `/api/tutors/create` endpoint with mocked Prisma
- Fast execution, no database connection required
- Good for unit testing the API logic

### 2. `create.integration.test.ts` - API Integration Tests
- Tests the full API endpoint with real database operations
- Requires a test database connection
- Tests actual data persistence

### 3. `database.test.ts` - Direct Database Tests
- Tests Prisma operations directly on the tutors table
- Most comprehensive database testing
- Requires a test database connection

## Setup Requirements

### Environment Variables
Set up a test database by configuring these environment variables:

```bash
# For local testing
DATABASE_URL="postgresql://username:password@localhost:5432/your_test_db"

# For CI/CD testing
DATABASE_URL="postgresql://username:password@test-host:5432/test_db"
```

### Test Database Setup
1. Create a separate test database
2. Run Prisma migrations on the test database
3. Ensure the test database is isolated from production

```bash
# Create test database
createdb your_test_db

# Run migrations on test database
DATABASE_URL="postgresql://username:password@localhost:5432/your_test_db" npx prisma migrate deploy

# Generate Prisma client for test database
DATABASE_URL="postgresql://username:password@localhost:5432/your_test_db" npx prisma generate
```

## Running Tests

### Run All Tutor Tests
```bash
npm test -- __tests__/api/tutors/
```

### Run Specific Test Files
```bash
# Run only mocked tests (fast)
npm test -- __tests__/api/tutors/create.test.ts

# Run integration tests (requires database)
npm test -- __tests__/api/tutors/create.integration.test.ts

# Run direct database tests (requires database)
npm test -- __tests__/api/tutors/database.test.ts
```

### Run with Coverage
```bash
npm run test:coverage -- __tests__/api/tutors/
```

## Test Coverage

The tests cover:

### Basic Operations
- ✅ Creating new tutor records
- ✅ Reading tutor records
- ✅ Updating tutor records
- ✅ Deleting tutor records

### Constraints & Validation
- ✅ Unique userId constraint
- ✅ Unique email constraint
- ✅ Required field validation
- ✅ CUID generation

### Edge Cases
- ✅ Duplicate key handling
- ✅ Missing field handling
- ✅ Malformed data handling
- ✅ Bulk operations
- ✅ Timestamp management

### API Integration
- ✅ HTTP status codes
- ✅ Response format validation
- ✅ Error handling
- ✅ Request validation

## Test Data Management

- Tests use unique identifiers (timestamps) to avoid conflicts
- Automatic cleanup after each test
- Final cleanup and database disconnection after all tests
- Test data is isolated using email patterns (`test-*`)

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Verify DATABASE_URL is correct
   - Ensure test database exists and is accessible
   - Check network connectivity

2. **Prisma Client Not Generated**
   - Run `npx prisma generate` for the test database
   - Verify schema.prisma is up to date

3. **Permission Denied**
   - Ensure database user has proper permissions
   - Check if database exists and is accessible

4. **Tests Hanging**
   - Check for unclosed database connections
   - Verify cleanup functions are working properly

### Debug Mode
Run tests with verbose output:
```bash
npm test -- __tests__/api/tutors/ --verbose
```

## Best Practices

1. **Always use test databases** - Never test against production data
2. **Clean up after tests** - Ensure no test data persists
3. **Use unique identifiers** - Avoid test data conflicts
4. **Test both success and failure cases** - Cover error scenarios
5. **Verify data persistence** - Don't just test API responses
6. **Isolate test environments** - Use separate databases for different test suites
