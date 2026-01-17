# 🧪 Unit Testing Feature

## Overview

Starting from version 1.6.0, **lazy-express-crud** automatically generates comprehensive unit tests for every resource using **Jest** and **supertest**.

## What You Get

### Auto-Generated Tests

Every time you create a project or add a new resource, you get:

✅ Complete test suite with 12+ test cases  
✅ All CRUD operations covered (POST, GET, PUT, DELETE)  
✅ Input validation tests  
✅ Security tests (ObjectId/ID validation)  
✅ Edge case testing  
✅ Database-specific test strategies  

### Project Structure

```
my-api/
├── src/
│   ├── models/
│   ├── controllers/
│   └── routes/
├── tests/
│   ├── Item.test.js      # ← Auto-generated!
│   ├── User.test.js      # ← When you add User
│   └── Product.test.js   # ← When you add Product
├── jest.config.js         # ← Auto-configured
└── package.json
```

## Running Tests

```bash
# Run all tests
npm test

# Watch mode (for development)
npm run test:watch

# Coverage report
npm run test:coverage
```

## Example Output

```bash
$ npm test

PASS  tests/Item.test.js
  Item CRUD Operations
    POST /api/items
      ✓ should create a new item (45ms)
      ✓ should return 400 if name is missing (12ms)
      ✓ should trim whitespace from name (18ms)
    GET /api/items
      ✓ should get all items (25ms)
      ✓ should return empty array when no items exist (8ms)
    GET /api/items/:id
      ✓ should get an item by id (19ms)
      ✓ should return 404 for non-existent item (11ms)
      ✓ should return 400 for invalid ObjectId (9ms)
    PUT /api/items/:id
      ✓ should update an item (28ms)
      ✓ should return 404 for non-existent item (10ms)
    DELETE /api/items/:id
      ✓ should delete an item (22ms)
      ✓ should return 404 for non-existent item (9ms)

Test Suites: 1 passed, 1 total
Tests:       12 passed, 12 total
Time:        2.456s
```

## Test Coverage

Each resource gets tests for:

### ✅ CREATE Operations (POST)
- Valid data creation
- Required field validation
- Data type validation
- String length validation
- Data sanitization (trim, etc.)

### ✅ READ Operations (GET)
- Get all items
- Get by ID
- Empty result handling
- Non-existent resource handling
- Invalid ID format handling

### ✅ UPDATE Operations (PUT)
- Full update
- Partial update
- Data validation
- Non-existent resource handling
- Invalid ID format handling

### ✅ DELETE Operations (DELETE)
- Successful deletion
- Verification of deletion
- Non-existent resource handling
- Invalid ID format handling

### ✅ Security Tests
- MongoDB: ObjectId validation
- MySQL: Numeric ID validation
- SQL injection prevention
- Input sanitization

## Database-Specific Testing

### MongoDB Tests
```javascript
✓ Uses TEST_MONGODB_URI for test database
✓ Validates ObjectId format
✓ Tests Mongoose schema validation
✓ Cleans up after each test
```

### MySQL Tests
```javascript
✓ Creates test table automatically
✓ Tests prepared statements
✓ Validates numeric IDs
✓ Cleans up table after each test
```

### In-Memory Tests
```javascript
✓ No database setup needed
✓ Fast execution
✓ Perfect for CI/CD pipelines
✓ Resets data before each test
```

## Configuration

### Environment Variables

Add to your `.env`:

```bash
# For MongoDB tests
TEST_MONGODB_URI=mongodb://localhost:27017/test-db

# For MySQL tests (optional)
TEST_DB_NAME=my_api_test
```

### Jest Configuration

The generated `jest.config.js` includes:

```javascript
- Node.js test environment
- Coverage collection from src/**
- Automatic mocking and cleanup
- ES6 modules support
- TypeScript support (for TS projects)
```

## Adding New Resources

When you add a new resource:

```bash
add-crud Product
```

You automatically get `tests/Product.test.js` with:
- ✅ 12+ comprehensive tests
- ✅ Database-specific validation
- ✅ All CRUD operations covered
- ✅ Security tests included

## TypeScript Support

TypeScript projects get:
- ✅ `@types/jest` and `@types/supertest`
- ✅ Type-safe test files
- ✅ `ts-jest` for running TypeScript tests
- ✅ Full IntelliSense support

## CI/CD Integration

Tests work perfectly with CI/CD pipelines:

### GitHub Actions Example

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
```

### Coverage Reports

Generate HTML coverage reports:

```bash
npm run test:coverage
# Opens coverage/lcov-report/index.html
```

## Best Practices

### ✅ DO
- Run tests before commits
- Use `test:watch` during development
- Aim for 100% coverage
- Add custom tests for business logic
- Keep test database separate

### ❌ DON'T
- Test against production database
- Skip test cleanup
- Ignore failing tests
- Use real user credentials in tests

## Customizing Tests

You can extend the auto-generated tests:

```javascript
// tests/Item.test.js

describe('Custom Business Logic', () => {
    it('should apply discount correctly', async () => {
        // Your custom test
    });
    
    it('should send email notification', async () => {
        // Your custom test
    });
});
```

## Troubleshooting

### Tests failing with "Connection error"

**MongoDB:**
```bash
# Make sure MongoDB is running
sudo systemctl start mongodb
# Or Docker
docker run -d -p 27017:27017 mongo
```

**MySQL:**
```bash
# Make sure MySQL is running
sudo systemctl start mysql
# Create test database
mysql -u root -p -e "CREATE DATABASE test_db;"
```

### "Cannot find module" errors

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### ES6 module errors

Make sure your `package.json` has:
```json
{
  "type": "module"
}
```

## Benefits

✨ **Confidence** - Know your code works before deployment  
🐛 **Bug Prevention** - Catch issues early  
📚 **Documentation** - Tests show how to use your API  
🔒 **Security** - Validate all edge cases  
⚡ **Faster Development** - No manual testing needed  
🎯 **Better Code Quality** - Write testable code  

## Next Steps

1. Create your project: `npx lazy-express-crud my-api`
2. Add resources: `add-crud User Product`
3. Run tests: `npm test`
4. Enjoy 100% coverage! 🎉

## Support

- 📖 [Full Documentation](README.md)
- 🐛 [Report Issues](https://github.com/benshabbat/lazy-express-crud/issues)
- 💬 [GitHub Discussions](https://github.com/benshabbat/lazy-express-crud/discussions)

---

**Happy Testing!** 🧪✨
