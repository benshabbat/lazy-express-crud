# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
