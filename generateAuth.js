#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import {
    validatePath,
    isPathInProject,
    sanitizeError,
    isExpressProject,
    isTypeScriptProject,
    getProjectExtension,
    ensureDirectory,
    writeFile,
    updateServerWithRoute
} from './src/utils/index.js';
import {
  getUserModelTemplate,
  getAuthControllerTemplate,
  getAuthRoutesTemplate,
  getAuthMiddlewareTemplate
} from './src/templates/auth/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Security: Sanitize string to prevent injection attacks
function sanitizeString(input) {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string');
  }
  // Remove null bytes and control characters
  return input.replace(/[\x00-\x1F\x7F]/g, '');
}

// Check if auth already exists
function authExists() {
  const ext = getProjectExtension(process.cwd());
  const authRoutesPath = path.join(process.cwd(), "src", "routes", `authRoutes.${ext}`);
  return fs.existsSync(authRoutesPath);
}

// Create User model with bcrypt
function createUserModel() {
  const ext = getProjectExtension(process.cwd());
  const modelDir = path.join(process.cwd(), "src", "models");
  const modelPath = path.join(modelDir, `User.${ext}`);

  // Security: Validate paths
  validatePath(modelDir);
  validatePath(modelPath);
  if (!isPathInProject(modelPath, process.cwd())) {
    throw new Error("Security: Attempted to write outside project directory");
  }

  // Check if User file already exists
  if (fs.existsSync(modelPath)) {
    console.log("⚠ User." + ext + " already exists - skipping creation");
    console.log("  Please add bcrypt and JWT methods to your existing User model");
    return;
  }

  ensureDirectory(modelDir);

  const isTS = ext === 'ts';
  const modelContent = getUserModelTemplate(isTS);

  writeFile(modelPath, modelContent);
  console.log("✓ Created User model with bcrypt (User." + ext + ")");
}

// Create auth controller with JWT
function createAuthController() {
  const ext = getProjectExtension(process.cwd());
  const controllerDir = path.join(process.cwd(), "src", "controllers");
  const controllerPath = path.join(controllerDir, `authController.${ext}`);

  // Security: Validate paths
  validatePath(controllerDir);
  validatePath(controllerPath);
  if (!isPathInProject(controllerPath, process.cwd())) {
    throw new Error("Security: Attempted to write outside project directory");
  }

  ensureDirectory(controllerDir);

  const isTS = ext === 'ts';
  const controllerContent = getAuthControllerTemplate(isTS);

  writeFile(controllerPath, controllerContent);
  console.log("✓ Created auth controller with JWT");
}

// Create auth routes
function createAuthRoutes() {
  const ext = getProjectExtension(process.cwd());
  const routesDir = path.join(process.cwd(), "src", "routes");
  const routesPath = path.join(routesDir, `authRoutes.${ext}`);

  // Security: Validate paths
  validatePath(routesDir);
  validatePath(routesPath);
  if (!isPathInProject(routesPath, process.cwd())) {
    throw new Error("Security: Attempted to write outside project directory");
  }

  ensureDirectory(routesDir);

  const routesContent = getAuthRoutesTemplate();

  writeFile(routesPath, routesContent);
  console.log("✓ Created auth routes");
}

// Create auth middleware
function createAuthMiddleware() {
  const ext = getProjectExtension(process.cwd());
  const middlewareDir = path.join(process.cwd(), "src", "middlewares");
  const middlewarePath = path.join(middlewareDir, `authMiddleware.${ext}`);

  // Security: Validate paths
  validatePath(middlewareDir);
  validatePath(middlewarePath);
  if (!isPathInProject(middlewarePath, process.cwd())) {
    throw new Error("Security: Attempted to write outside project directory");
  }

  ensureDirectory(middlewareDir);

  const isTS = ext === 'ts';
  const middlewareContent = getAuthMiddlewareTemplate(isTS);

  writeFile(middlewarePath, middlewareContent);
  console.log("✓ Created auth middleware");
}

// Update server.js/server.ts to include auth routes
function updateServerJs() {
  const ext = getProjectExtension(process.cwd());
  
  // Use the utility function to update server with auth routes
  const success = updateServerWithRoute(null, 'auth', ext, '/api/auth');
  
  if (!success) {
    console.log("⚠ Could not automatically update server." + ext);
    console.log("  Please add auth routes manually:");
    console.log("  import authRoutes from './routes/authRoutes.js';");
    console.log("  app.use('/api/auth', authRoutes);");
  }
}

// Update package.json to include dependencies
function updatePackageJson() {
  const packageJsonPath = path.join(process.cwd(), "package.json");

  // Security: Validate path
  validatePath(packageJsonPath);
  if (!isPathInProject(packageJsonPath, process.cwd())) {
    throw new Error("Security: Attempted to write outside project directory");
  }

  if (!fs.existsSync(packageJsonPath)) {
    console.log("⚠ package.json not found");
    return;
  }

  // Security: Check file size before reading (max 1MB)
  const stats = fs.statSync(packageJsonPath);
  if (stats.size > 1024 * 1024) {
    throw new Error("package.json file too large (max 1MB)");
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

  // Add dependencies if they don't exist
  if (!packageJson.dependencies) {
    packageJson.dependencies = {};
  }

  let dependenciesAdded = false;

  if (!packageJson.dependencies.bcryptjs) {
    packageJson.dependencies.bcryptjs = "^2.4.3";
    dependenciesAdded = true;
  }

  if (!packageJson.dependencies.jsonwebtoken) {
    packageJson.dependencies.jsonwebtoken = "^9.0.2";
    dependenciesAdded = true;
  }

  // Add TypeScript type definitions if it's a TypeScript project
  const isTS = isTypeScriptProject();
  if (isTS) {
    if (!packageJson.devDependencies) {
      packageJson.devDependencies = {};
    }
    
    if (!packageJson.devDependencies['@types/bcryptjs']) {
      packageJson.devDependencies['@types/bcryptjs'] = "^2.4.6";
      dependenciesAdded = true;
    }
    
    if (!packageJson.devDependencies['@types/jsonwebtoken']) {
      packageJson.devDependencies['@types/jsonwebtoken'] = "^9.0.5";
      dependenciesAdded = true;
    }
  }

  if (dependenciesAdded) {
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log("✓ Updated package.json with auth dependencies");
    console.log("\n📦 Please run: npm install");
  } else {
    console.log("✓ Auth dependencies already in package.json");
  }
}

// Update .env file
function updateEnvFile() {
  const envPath = path.join(process.cwd(), ".env");

  // Security: Validate path
  validatePath(envPath);
  if (!isPathInProject(envPath, process.cwd())) {
    throw new Error("Security: Attempted to write outside project directory");
  }

  let envContent = "";

  if (fs.existsSync(envPath)) {
    // Security: Check file size before reading (max 100KB)
    const stats = fs.statSync(envPath);
    if (stats.size > 100 * 1024) {
      throw new Error(".env file too large (max 100KB)");
    }
    envContent = fs.readFileSync(envPath, "utf8");
  }

  // Check if JWT_SECRET already exists
  if (envContent.includes("JWT_SECRET")) {
    console.log("✓ JWT_SECRET already in .env");
    return;
  }

  // Security: Generate a strong random secret (64 bytes = 128 hex chars)
  const randomSecret = crypto.randomBytes(64).toString("hex");

  const authEnvContent = "\n# JWT Authentication\n# Security: Change this secret in production!\nJWT_SECRET=" + randomSecret + "\nJWT_EXPIRES_IN=24h\n# Note: Consider implementing rate limiting for auth endpoints\n# Recommended: express-rate-limit package\n";

  fs.writeFileSync(envPath, envContent + authEnvContent);
  console.log("✓ Updated .env with JWT configuration");
}

// Main function
function main() {
  console.log("\n🔐 Setting up authentication with bcrypt and JWT...\n");

  try {
    // Check if in Express project
    if (!isExpressProject()) {
      console.error("❌ Error: Not an Express project");
      console.log("Please run this command in an Express project directory");
      console.log("Or create a new project first: npx lazy-express-crud my-project");
      process.exit(1);
    }

    // Check if auth already exists
    if (authExists()) {
      console.error("❌ Error: Authentication already exists");
      console.log("Auth routes already found in this project");
      process.exit(1);
    }

    // Create auth files
    createUserModel();
    createAuthController();
    createAuthRoutes();
    createAuthMiddleware();
    updateServerJs();
    updatePackageJson();
    updateEnvFile();

    console.log("\n✅ Authentication setup complete!\n");
    console.log("📋 What was created:");
    console.log("  • User model with bcrypt password hashing (or skipped if exists)");
    console.log("  • Auth controller with JWT token generation");
    console.log("  • Auth routes (register, login, me)");
    console.log("  • Auth middleware for protected routes");
    console.log("  • Updated server.js with auth routes");
    console.log("  • Added bcryptjs and jsonwebtoken to package.json");
    console.log("  • Generated JWT_SECRET in .env\n");
    console.log("📝 Available endpoints:");
    console.log("  POST   /api/auth/register  - Register new user");
    console.log("  POST   /api/auth/login     - Login user");
    console.log("  GET    /api/auth/me        - Get current user (protected)\n");
    console.log("🔒 To protect your routes:");
    console.log("  In your route file, import and use authMiddleware:");
    console.log("  import { authMiddleware } from '../middlewares/authMiddleware.js';");
    console.log("  router.get('/protected', authMiddleware, yourController);\n");
    console.log("⚠️  Remember to:");
    console.log("  1. Run: npm install");
    console.log("  2. Change JWT_SECRET in .env to a secure value");
    console.log("  3. Replace in-memory storage with a real database");
    console.log("  4. If User.js existed before, add bcrypt methods manually\n");
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

main();
