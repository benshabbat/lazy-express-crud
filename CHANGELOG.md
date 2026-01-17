# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.6.0] - 2026-01-18

### Added
- 🧪 **Unit Testing Support** - Auto-generated Jest tests for every resource
- Jest configuration file for both JavaScript and TypeScript projects
- Test templates for MongoDB, MySQL, and In-Memory databases
- Comprehensive test coverage for all CRUD operations
- Test scripts in package.json: `test`, `test:watch`, `test:coverage`
- supertest for HTTP assertions in tests
- Automatic test file creation when adding new resources
- Support for both JavaScript and TypeScript test files
- tests/ directory in project structure
- Database-specific testing strategies (ObjectId validation, SQL queries, etc.)

### Changed
- Updated project structure to include tests directory
- Enhanced README with comprehensive testing documentation
- Added Jest and supertest to devDependencies
- Updated generateExpressCrud.js to create test files
- Updated addCrudResource-single.js to create test files for new resources

### Technical Details
- Created test-templates.js with all test template functions
- Implemented getJestConfigJS() and getJestConfigTS()
- Implemented database-specific test templates (Mongo/MySQL/Memory)
- Tests include: POST, GET, GET by ID, PUT, DELETE operations
- Security validation tests (ObjectId/ID format validation)
- Edge case testing (empty data, invalid data, non-existent resources)

## [Unreleased]

## [1.5.0] - 2026-01-15

### Added - TypeScript Support 💻
- **Full TypeScript Support** - Choose between TypeScript or JavaScript during project creation
  - Interactive language selection prompt at project setup
  - TypeScript projects include complete type definitions
  - JavaScript projects remain unchanged with ES6+ modules
  
- **TypeScript Project Features:**
  - `tsconfig.json` with strict mode enabled
  - Complete type definitions for all models, controllers, and routes
  - Type-safe Express request/response handlers
  - Interface definitions for database models
  - `tsx` for fast development with hot-reload
  - Separate `src/` and `dist/` directories
  - Full type safety with proper generics
  
- **Updated Commands:**
  - `lazy-crud` - Now asks for language preference (JS/TS)
  - `add-crud` - Auto-detects project language and creates matching files (.js/.ts)
  - `add-auth` - Generates TypeScript auth files for TS projects
  
- **TypeScript Templates:**
  - Type-safe models with interfaces (MongoDB, MySQL, In-Memory)
  - Typed controllers with Request/Response types
  - Type-safe routes with proper Express types
  - Database configuration with Promise types
  - Comprehensive type definitions in `src/types/`
  
- **Developer Experience:**
  - `npm run dev` - Development with tsx watch mode (TS) or nodemon (JS)
  - `npm run build` - TypeScript compilation (TS projects only)
  - `npm run type-check` - Type checking without compilation
  - Full IDE support with IntelliSense and auto-completion
  
- **Documentation:**
  - Updated README with TypeScript vs JavaScript comparison
  - Added TypeScript setup instructions
  - Type safety benefits explained
  - Both workflows documented

### Changed
- Package description updated to highlight TypeScript support
- Added TypeScript-related keywords to package.json
- Version bumped to 1.5.0 (minor version for new feature)

## [1.4.1] - 2026-01-06

### Security - Docker Security Hardening 🔒
- **Enhanced add-docker security**
  - Added `validateProjectName()` - Validates project names (1-100 chars, safe characters only)
  - Added `validatePath()` - Prevents path traversal attacks
  - Blocks reserved/dangerous names (node_modules, .git, docker, etc.)
  - All file operations now use path validation
- **Secure Default Credentials**
  - MongoDB Mongo Express: Auto-generated 32-character random password
  - MySQL: Auto-generated 48-character random password
  - Replaced weak defaults (admin123, rootpassword) with crypto.randomBytes()
- **Security Warnings**
  - Added credential display after Docker setup
  - Production security reminders in console output
  - Updated README.docker.md with security best practices
- **Result:** Docker setup now achieves 10/10 security score

## [1.4.0] - 2026-01-06

### Added - Docker Support 🐳
- **New command: `add-docker`** - Adds complete Docker setup to existing projects
  - Automatically detects database type (MongoDB/MySQL/In-Memory)
  - Creates optimized `Dockerfile` with multi-stage build
  - Generates `docker-compose.yml` with database and UI services
  - Creates `.dockerignore` for optimized builds
  - Generates comprehensive `README.docker.md` documentation
  - Adds `/health` endpoint for container health checks
- **MongoDB Projects:**
  - MongoDB 7 container
  - Mongo Express UI (accessible at :8081)
  - Persistent data volumes
- **MySQL Projects:**
  - MySQL 8.0 container with health checks
  - phpMyAdmin UI (accessible at :8080)
  - Persistent data volumes
- **Security Features:**
  - Non-root user in containers
  - Multi-stage builds for smaller images
  - Health checks for reliability
  - Network isolation

## [1.3.0] - 2026-01-06

### Changed - ES6 Modules Migration 🚀
- **Migrated entire codebase from CommonJS to ES6 Modules**
  - Changed `package.json` type to "module"
  - Converted all `require()` to `import` statements
  - Converted all `module.exports` to `export` statements
  - Added `__dirname` and `__filename` polyfills using `fileURLToPath`
  - Updated `crypto` import in generateAuth.js
- **Benefits:**
  - Modern JavaScript standard (ES2015+)
  - Better tree-shaking support
  - Consistent with generated project code
  - Top-level await support
  - Automatic strict mode
  - Improved static analysis
- **Security:** All security features remain intact (10/10 score maintained)
- **Compatibility:** Requires Node.js >= 14.0.0

## [1.2.2] - 2026-01-06

### Added
- **Multiple resources creation** - `add-crud` now supports creating multiple resources in one command
  - Example: `add-crud User Product Book` creates all three resources at once
  - Shows progress indicator ([1/3], [2/3], etc.)
  - Displays summary of successful/failed creations
  - Validates all resource names before processing

## [1.2.1] - 2026-01-06

### Changed
- **Database configuration** moved to separate `src/config/database.js` file for better organization
- Models now import database connection from `config/database.js` instead of `server.js`
- Improved project structure with dedicated config folder

### Fixed
- **add-auth** now skips User.js creation if it already exists (allows adding User resource before auth)
- **add-auth** no longer imports authMiddleware to server.js (should only be imported in route files)
- MySQL models now correctly import database from config folder

## [1.2.0] - 2026-01-06

### Added - Database Support & Security
- **Multi-Database Support** - Choose between MongoDB, MySQL, or In-Memory storage during project creation
- **Interactive Database Selection** - CLI prompts for database choice when creating a project
- **MongoDB Integration** with Mongoose ODM
  - Automatic schema generation with validation
  - Mongoose models with timestamps
  - Connection string templates in .env
  - SSL/TLS support for production connections
- **MySQL Integration** with mysql2
  - Connection pool configuration
  - Parameterized queries to prevent SQL injection
  - Auto-generated table creation helpers
- **Automatic Database Detection** in `add-crud` - Detects database type from package.json dependencies

### Security Enhancements (10/10 Score) 🏆
- **NoSQL Injection Prevention** - MongoDB ObjectId validation in all ID-based operations
- **SQL Injection Prevention** - Parameterized queries for MySQL operations
- **Input Validation** - Comprehensive type checking and length limits
  - Name field: max 255 characters, string type required
  - Description field: max 2000 characters, string type validation
- **Security Headers** - helmet.js integration for protection against:
  - XSS attacks
  - Clickjacking
  - MIME type sniffing
  - And more...
- **Rate Limiting** - express-rate-limit protection (100 requests per 15 minutes per IP)
- **Payload Size Limits** - 10MB limit on JSON and URL-encoded bodies
- **Error Message Sanitization** - Generic errors in production, detailed in development
- **CORS Whitelist** - Environment-based allowed origins with production/development modes
- **HTTPS Enforcement** - Automatic HTTP to HTTPS redirect in production
- **Environment Validation** - Required environment variables checked at startup
- **SSL/TLS Support** - MongoDB and MySQL encrypted connections in production

### Changed
- Controllers now include async/await for MongoDB and MySQL
- Error handling improved with console.error for debugging
- Generic error messages to prevent information leakage
- .env templates include authentication examples and SSL configuration
- README includes database-specific setup instructions and security features
- Server.js template includes production-ready security middleware
- CORS changed from allow-all to whitelist-based configuration
- MongoDB connection includes SSL option for production

### Dependencies Added
- `helmet@^7.1.0` - Security headers
- `express-rate-limit@^7.1.5` - Rate limiting
- `mongoose@^8.0.3` - MongoDB ODM (when MongoDB selected)
- `mysql2@^3.6.5` - MySQL client (when MySQL selected)

### Documentation
- Added SECURITY-REVIEW.md - Comprehensive security audit report
- Updated SECURITY-FINAL-REPORT.md - Now shows 10/10 security score
- Updated README with enhanced security features section
- Added production security checklist with HTTPS and CORS setup
- Database setup instructions for MongoDB and MySQL
- Connection string examples with SSL/TLS authentication
- Added enterprise security features documentation

### Security Score
- **10/10** - Passed comprehensive security audit including OWASP Top 10
- All critical, high, and medium severity vulnerabilities addressed
- Production-ready with enterprise-grade security

## [1.1.0] - 2026-01-05

### Added
- **JWT Authentication System** with `add-auth` command
- User model with bcrypt password hashing (10 rounds)
- Auth controller with register, login, and get current user endpoints
- Auth routes: `/api/auth/register`, `/api/auth/login`, `/api/auth/me`
- Auth middleware for protecting routes
- Automatic server.js updates with auth routes
- JWT configuration in .env (JWT_SECRET, JWT_EXPIRES_IN)
- Automatic installation of bcryptjs and jsonwebtoken dependencies
- Comprehensive input validation for auth endpoints
- Token verification and expiration handling
- Protected route example in documentation

### Changed
- Package description to include authentication features
- README with authentication setup guide and examples
- Added auth-related keywords: authentication, jwt, bcrypt, auth

### Security
- bcrypt password hashing with 10 salt rounds
- JWT token generation with configurable expiration
- Token verification in auth middleware
- Password length validation (6-128 characters)
- Email and username validation
- User not found handling without information leakage
- Automatic random JWT_SECRET generation

## [1.0.3] - 2026-01-05

### Added
- `gen-postman` command to automatically generate Postman Collections
- Full security validation for path traversal prevention
- File size limits to prevent DoS attacks
- Input sanitization for all user inputs
- Automatic detection of all resources in project

### Changed
- Command name from `generate-postman` to `gen-postman` for brevity
- README encoding to UTF-8 for proper npm display
- Enhanced error handling across all scripts

### Security
- Added path traversal protection
- Implemented file size limits
- Added filename pattern validation
- Sanitized all user inputs

## [1.0.2] - 2026-01-05

### Fixed
- README.md encoding issue (UTF-16 to UTF-8)
- npm package display on registry

## [1.0.1] - 2026-01-05

### Added
- Automatic server.js route registration when adding resources
- Enhanced validation for resource names
- Reserved JavaScript keyword checking

### Changed
- Command names shortened: `lazy-crud` and `add-crud`
- Improved user feedback messages

### Security
- Added length limits for project and resource names
- Enhanced validation for reserved names
- Added hidden file prevention
- Character whitelist validation

## [1.0.0] - 2026-01-05

### Added
- Initial release
- `lazy-crud` command to generate Express CRUD API projects
- `add-crud` command to add new resources to existing projects
- Complete CRUD operations (Create, Read, Update, Delete)
- ES6 modules support
- Organized project structure (routes, controllers, models)
- Environment variables configuration
- CORS support
- Error handling middleware
- In-memory storage for quick prototyping
- Security features:
  - Project name validation
  - Path traversal prevention
  - Reserved name checking
  - Input validation

### Documentation
- Complete README with usage examples
- API endpoint documentation
- Installation instructions
- Security features overview

[Unreleased]: https://github.com/benshabbat/lazy-express-crud/compare/v1.0.3...HEAD
[1.0.3]: https://github.com/benshabbat/lazy-express-crud/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/benshabbat/lazy-express-crud/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/benshabbat/lazy-express-crud/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/benshabbat/lazy-express-crud/releases/tag/v1.0.0
