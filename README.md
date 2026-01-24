# lazy-express-crud

[![npm version](https://img.shields.io/npm/v/lazy-express-crud.svg)](https://www.npmjs.com/package/lazy-express-crud)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Security: 10/10](https://img.shields.io/badge/Security-10%2F10-brightgreen.svg)](./SECURITY-FINAL-REPORT.md)
[![Production Ready](https://img.shields.io/badge/Production-Ready-success.svg)](./SECURITY-FINAL-REPORT.md)

> 🚀 Production-ready Express.js CRUD API generator with MongoDB/MySQL support, JWT authentication, TypeScript/JavaScript, and enterprise-grade security (10/10)

Instantly scaffold a secure Express.js REST API with your choice of database (MongoDB, MySQL, or In-Memory), **TypeScript or JavaScript**, complete CRUD operations, JWT authentication, and security best practices built-in.

## ✨ Features

### Core Features
💻 **TypeScript Support** - Choose between TypeScript or JavaScript  
✨ **Multi-Database Support** - Choose MongoDB, MySQL, or In-Memory storage  
🔐 **JWT Authentication** - Secure auth with bcrypt and JWT tokens  
🛡️ **Enterprise Security** - Helmet, rate limiting, input validation, injection prevention  
� **Docker Ready** - Complete Docker Compose setup with database UI  
�📁 **Clean Architecture** - Organized routes, controllers, and models  
🎯 **ES6 Modules** - Modern JavaScript/TypeScript with import/export  
⚡ **Zero Config** - Interactive setup, start coding immediately  
➕ **Smart Resource Generation** - Auto-detects database type and language  
🌐 **Production Ready** - CORS whitelist, HTTPS enforcement, SSL/TLS support  
📦 **Lightweight** - Minimal, carefully selected dependencies  
🧪 **Unit Tests** - Auto-generated Jest tests for every resource  
🛠️ **Maintainable** - Utils layer with centralized logic, -182 lines of duplicate code removed

### What's New in v1.9.0 🎉
- ♻️ **Major Refactoring** - Added comprehensive utils layer
- 📦 **Code Reusability** - Centralized project detection, prompts, and file operations
- 🔒 **Consistent Security** - All generators use same validation logic
- 🧪 **Better Maintainability** - Single source of truth for common operations

### Security Features (10/10 Score) 🏆
🔒 **NoSQL/SQL Injection Prevention** - Validated queries and ObjectId checking  
🛡️ **Security Headers** - helmet.js protecting against XSS, clickjacking, etc.  
⏱️ **Rate Limiting** - DDoS protection (100 req/15min per IP)  
✅ **Input Validation** - Type checking, length limits, sanitization  
🚫 **Error Sanitization** - No sensitive data leaked in production  
📏 **Payload Limits** - 10MB cap prevents DoS attacks  
🔐 **HTTPS Enforcement** - Auto-redirect HTTP to HTTPS in production  
🌐 **CORS Whitelist** - Environment-based allowed origins  
🔑 **Environment Validation** - Startup checks for required variables  
🔒 **SSL/TLS Support** - MongoDB SSL and MySQL encrypted connections  
🔐 **Authentication** - bcrypt hashing + JWT tokens  
🌐 **CORS Configuration** - Ready for production deployment

## 🚀 Quick Start

### Requirements

- **Node.js >= 14.0.0** (ES6 Modules support required)
- **npm** or **yarn**
- **MongoDB** or **MySQL** (optional - can use in-memory storage)

### 1. Create a New Project

```bash
# Using npx (recommended - no installation needed)
npx lazy-express-crud my-api

# Or install globally
npm install -g lazy-express-crud
lazy-crud my-api
```

**Interactive Setup:**
```
💻 Choose your language:
1. JavaScript (ES6+)
2. TypeScript

Enter your choice (1/2): 2

📊 Choose your database:
1. MongoDB (NoSQL)
2. MySQL (SQL)
3. In-Memory (No database - for demo)

Enter your choice (1/2/3): 1
```

### 2. Start Your Server

**For TypeScript Projects:**
```bash
cd my-api
npm install
npm run dev        # Development with auto-reload
npm run build      # Build for production
npm start          # Run production build
```

**For JavaScript Projects:**
```bash
cd my-api
npm install
npm run dev
```

Your secure API is now running at `http://localhost:3000`! 🎉

## 💻 TypeScript vs JavaScript

### TypeScript Projects
- ✅ Full type safety with TypeScript
- ✅ Auto-completion and IntelliSense
- ✅ Compile-time error checking
- ✅ Interface definitions for models
- ✅ Type-safe Express handlers
- ✅ Better refactoring support
- 📁 Source in `src/`, compiled to `dist/`
- 🛠️ Uses `tsx` for fast development
- 🔧 Includes `tsconfig.json` with strict mode

### JavaScript Projects  
- ✅ Quick and simple setup
- ✅ No compilation step needed
- ✅ Modern ES6+ syntax
- ✅ ES modules (import/export)
- 📁 Direct execution from `src/`
- 🛠️ Uses `nodemon` for auto-reload

**Both options include:**
- Full CRUD operations
- JWT authentication
- Security best practices
- Database support
- Clean architecture

## 📊 Database Options

### MongoDB (Recommended for flexibility)
```bash
# Project creation automatically sets up:
✅ Mongoose schemas with validation
✅ MongoDB connection with error handling
✅ Timestamps (createdAt, updatedAt)
✅ Connection string in .env

# Setup MongoDB:
# 1. Install MongoDB locally or use MongoDB Atlas
# 2. Update MONGODB_URI in .env if needed
# 3. npm run dev (database created automatically)
```

### MySQL (Recommended for relational data)
```bash
# Project creation automatically sets up:
✅ mysql2 connection pool
✅ Parameterized queries (SQL injection safe)
✅ Table creation helpers
✅ Connection config in .env

# Setup MySQL:
# 1. Install MySQL
# 2. CREATE DATABASE my_api;
# 3. Update DB credentials in .env
# 4. npm run dev (tables created automatically)
```

### In-Memory (For testing/demos)
```bash
# Perfect for:
✅ Quick demos
✅ Testing
✅ Learning
⚠️ Data lost on restart
```

## 🔐 Authentication Setup

Add secure JWT authentication to your project:

```bash
cd my-api
add-auth
```

**Automatically creates:**
- ✅ User model with bcrypt password hashing (10 rounds)
- ✅ Auth controller with JWT token generation
- ✅ Auth routes (register, login, me)
- ✅ Auth middleware for protected routes
- ✅ Updates server.js with auth routes
- ✅ Adds JWT_SECRET to .env
- ✅ Input validation (email, password, username)

### Authentication Endpoints

| Method | Endpoint | Description | Protected |
|--------|----------|-------------|-----------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/me` | Get current user | Yes |

### Example Auth Requests

```bash
# Register new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"john","email":"john@example.com","password":"secret123"}'

# Login (returns JWT token)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"secret123"}'

# Access protected route
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Protecting Your Routes

```javascript
import { authMiddleware } from './middlewares/authMiddleware.js';

// Protected route example
router.get('/protected', authMiddleware, yourController);
router.post('/items', authMiddleware, itemController.createItem);
```

## ➕ Adding More Resources

After creating your project, easily add more CRUD resources:

```bash
cd my-api
add-crud User      # Automatically detects your database!
add-crud Product
add-crud Category

# Or create multiple at once:
add-crud User Product Category
```

**Smart Detection:**
- Detects MongoDB → Creates Mongoose schema
- Detects MySQL → Creates SQL class with queries
- Detects In-Memory → Creates in-memory array

**Automatically creates:**
- ✅ Model with database-specific code
- ✅ Controller with validation & security
- ✅ Routes with all CRUD operations
- ✅ Updates server.js automatically
- ✅ Unit tests with Jest for each resource

**Bulk Creation:**
- ✅ Create multiple resources in one command
- ✅ Shows progress for each resource
- ✅ Summary of successful/failed creations

### Generated Endpoints

Each resource gets full CRUD:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/items` | Get all items |
| GET | `/api/items/:id` | Get item by ID |
| POST | `/api/items` | Create new item |
| PUT | `/api/items/:id` | Update item |
| DELETE | `/api/items/:id` | Delete item |

## 🧪 Testing with Postman

Generate a complete Postman Collection:

```bash
cd my-api
gen-postman
```

Creates `postman-collection.json` with:
- ✅ All CRUD operations for every resource
- ✅ Pre-configured requests
- ✅ Example payloads
- ✅ Import to Postman and start testing!

## 🧪 Unit Testing

Every project includes **Jest** testing framework with auto-generated tests:

### Running Tests

```bash
npm test                 # Run all tests
npm run test:watch       # Watch mode for development
npm run test:coverage    # Generate coverage report
```

### What's Tested

Each resource gets comprehensive tests:
- ✅ **CREATE** - Valid/invalid data, required fields, data validation
- ✅ **READ** - Get all, get by ID, non-existent resources
- ✅ **UPDATE** - Full/partial updates, validation, non-existent resources
- ✅ **DELETE** - Successful deletion, non-existent resources
- ✅ **Security** - ID validation (ObjectId for MongoDB, numeric for MySQL)
- ✅ **Edge Cases** - Empty lists, special characters, boundary values

### Test Structure

```
my-api/
├── tests/
│   ├── Item.test.js      # Auto-generated for default resource
│   ├── User.test.js      # Auto-generated when you add User
│   └── Product.test.js   # Auto-generated when you add Product
├── jest.config.js         # Jest configuration
└── package.json           # Includes jest & supertest
```

### Example Test Output

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

### Database-Specific Testing

**MongoDB Tests:**
- Uses test database (`TEST_MONGODB_URI`)
- Validates ObjectId format
- Tests Mongoose schema validation

**MySQL Tests:**
- Creates test table automatically
- Tests prepared statements
- Validates numeric IDs

**In-Memory Tests:**
- No database setup needed
- Fast execution
- Perfect for CI/CD pipelines

### Test Configuration

Update `.env` for test database:
```bash
# For MongoDB
TEST_MONGODB_URI=mongodb://localhost:27017/test-db

# For MySQL (optional - uses same DB with different data)
TEST_DB_NAME=my_api_test
```

## � Docker Support

Add Docker Compose configuration to your project:

```bash
cd my-api
add-docker
```

**What it creates:**
- ✅ `Dockerfile` - Multi-stage build for production
- ✅ `docker-compose.yml` - Complete orchestration
- ✅ `.dockerignore` - Optimized build context
- ✅ `README.docker.md` - Complete Docker guide
- ✅ `/health` endpoint - Container health checks

**Database-Specific Setup:**

### MongoDB Projects
```yaml
services:
  - app (Node.js)
  - mongodb (Database)
  - mongo-express (UI at :8081)
```

### MySQL Projects
```yaml
services:
  - app (Node.js)
  - mysql (Database)
  - phpmyadmin (UI at :8080)
```

### In-Memory Projects
```yaml
services:
  - app (Node.js only)
```

**Quick Start:**
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**Access:**
- 📱 API: http://localhost:3000
- 🌐 MongoDB UI: http://localhost:8081 (admin/admin123)
- 🌐 MySQL UI: http://localhost:8080

## �📁 Project Structure

```
my-api/
├── src/
│   ├── config/          # Database configuration
│   │   └── database.js  # MongoDB/MySQL connection
│   ├── controllers/     # Business logic with validation
│   │   └── itemController.js
│   ├── models/          # Database models (Mongoose/MySQL/In-Memory)
│   │   └── Item.js
│   ├── routes/          # API routes
│   │   └── itemRoutes.js
│   ├── middlewares/     # Auth & custom middleware
│   │   └── authMiddleware.js
│   └── server.js        # App entry point with security
├── tests/               # Jest unit tests
│   └── Item.test.js    # Auto-generated tests
├── jest.config.js      # Jest configuration
├── .env                # Environment variables
├── .gitignore
├── package.json
└── README.md
```
├── .gitignore          # Git ignore file
├── package.json        # Dependencies
└── README.md           # Project documentation
```
## 🔒 Security Features (10/10 Security Score) 🏆

### Built-in Security
- ✅ **NoSQL Injection Prevention** - MongoDB ObjectId validation
- ✅ **SQL Injection Prevention** - Parameterized MySQL queries
- ✅ **Input Validation** - Type checking, length limits (name: 255, description: 2000)
- ✅ **Security Headers** - helmet.js (XSS, clickjacking, MIME sniffing protection)
- ✅ **Rate Limiting** - 100 requests per 15 minutes per IP
- ✅ **Payload Size Limits** - 10MB max to prevent DoS
- ✅ **Error Sanitization** - Generic messages in production
- ✅ **CORS Whitelist** - Environment-based allowed origins
- ✅ **HTTPS Enforcement** - Auto-redirect HTTP to HTTPS in production
- ✅ **SSL/TLS Support** - MongoDB and MySQL encrypted connections
- ✅ **Environment Validation** - Required variables checked at startup
- ✅ **JWT Authentication** - Secure token generation with bcrypt hashing
- ✅ **Password Security** - bcrypt with 10 salt rounds
- ✅ **Path Traversal Prevention** - Project name validation
- ✅ **Reserved Name Protection** - Prevents system conflicts

### Production Security Checklist

Before deploying:
- [ ] Set `NODE_ENV=production` in environment
- [ ] Configure `ALLOWED_ORIGINS` with your domain(s)
- [ ] Use strong database passwords
- [ ] Enable HTTPS/TLS and SSL for database
- [ ] Verify HTTPS auto-redirect is working
- [ ] Test CORS with your production frontend
- [ ] Set up proper logging (Winston/Pino)
- [ ] Configure firewall rules
- [ ] Use secrets management (not .env files)
- [ ] Enable database authentication
- [ ] Keep dependencies updated (`npm audit`)
- [ ] Use a process manager (PM2)
- [ ] Set up monitoring and alerts
- [ ] Test rate limiting behavior

See [SECURITY-FINAL-REPORT.md](./SECURITY-FINAL-REPORT.md) for detailed security audit (10/10 score).

## 📊 Example API Response

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Sample Item",
      "description": "This is a sample item",
      "price": 99,
      "createdAt": "2026-01-06T12:00:00.000Z",
      "updatedAt": "2026-01-06T12:00:00.000Z"
    }
  ]
}
```

## ⚙️ Configuration

Edit `.env` in your project:

```env
# Server
PORT=3000
NODE_ENV=development

# CORS Configuration (Production)
# ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# MongoDB (if using MongoDB)
MONGODB_URI=mongodb://localhost:27017/my-api
# Production with SSL: MONGODB_URI=mongodb://user:pass@host:port/db?authSource=admin&ssl=true
# MongoDB Atlas: MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db?ssl=true

# MySQL (if using MySQL)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=my-api

# JWT (if using auth)
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=24h
```

⚠️ **Security Warning:** Never commit `.env` files! Always use strong passwords and SSL/TLS in production.

## 📜 Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload (nodemon)
- `npm test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

## 🛠️ Requirements

- **Node.js** >= 14.0.0 (ES6 Modules support)
- **npm** or yarn
- **MongoDB** (if using MongoDB option)
- **MySQL** (if using MySQL option)

### Technology Stack

- **ES6 Modules** - Modern JavaScript with `import`/`export` syntax
- **Express.js** - Fast, unopinionated web framework
- **Mongoose** - MongoDB ODM (if MongoDB selected)
- **mysql2** - MySQL client with Promise support (if MySQL selected)
- **bcryptjs** - Password hashing (10 rounds)
- **jsonwebtoken** - JWT authentication
- **helmet** - Security headers middleware
- **express-rate-limit** - Rate limiting middleware
- **cors** - CORS middleware with whitelist support
- **dotenv** - Environment variable management
- **Jest** - Testing framework with 100% coverage support
- **supertest** - HTTP assertions for API testing

## 📚 Commands Reference

| Command | Description |
|---------|-------------|
| `lazy-crud <project-name>` | Create new Express CRUD project |
| `add-crud <ResourceName>` | Add new CRUD resource (must be inside project) |
| `add-auth` | Add JWT authentication (must be inside project) |
| `gen-postman` | Generate Postman Collection (must be inside project) |
| `add-docker` | Add Docker & Docker Compose setup (must be inside project) |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

MIT © [DavidChen Benshabbat](https://github.com/benshabbat)

## 🔗 Links

- [npm Package](https://www.npmjs.com/package/lazy-express-crud)
- [GitHub Repository](https://github.com/benshabbat/lazy-express-crud)
- [Report Issues](https://github.com/benshabbat/lazy-express-crud/issues)
- [Changelog](./CHANGELOG.md)
- [Security Audit](./SECURITY-FINAL-REPORT.md)

## 🌟 Show Your Support

Give a ⭐️ if this project helped you!

---

**Made with ❤️ by [benshabbat](https://github.com/benshabbat)**

### lazy-crud [project-name]

Creates a new Express CRUD API project

**Options:**
- `project-name` - Name of your project (optional, defaults to "express-crud-app")

**Example:**
```bash
lazy-crud my-awesome-api
```

### add-crud [ResourceName]

Adds a new CRUD resource to an existing project (must be run from project root)

**Options:**
- `ResourceName` - Name of the resource, must start with uppercase (e.g., User, Product)

**Example:**
```bash
add-crud User
```

### gen-postman

Generates a Postman Collection for all resources in your project (must be run from project root)

**Example:**
```bash
gen-postman
```

This scans your routes and creates `postman-collection.json` with all CRUD endpoints.

### add-auth

Adds JWT authentication to your existing project (must be run from project root)

**Example:**
```bash
add-auth
```

This creates:
- User model with bcrypt password hashing
- Auth controller with JWT
- Auth routes and middleware
- Updates server.js
- Adds JWT configuration to .env

**Note:** Installs `bcryptjs` and `jsonwebtoken` - remember to run `npm install` after.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

See [CHANGELOG.md](CHANGELOG.md) for version history.

## License

MIT © 2026

## Support

- 🐛 [Report a bug](https://github.com/benshabbat/lazy-express-crud/issues)
- 💡 [Request a feature](https://github.com/benshabbat/lazy-express-crud/issues)
- ⭐ Star this project on [GitHub](https://github.com/benshabbat/lazy-express-crud)

## Keywords

express, crud, api, generator, cli, scaffold, boilerplate, rest-api, es6-modules, nodejs, backend, authentication, jwt, bcrypt, auth

---

Made with ❤️ for the Node.js community
