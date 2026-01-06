#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Security: Sanitize string to prevent injection attacks
function sanitizeString(input) {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string');
  }
  // Remove null bytes and control characters
  return input.replace(/[\x00-\x1F\x7F]/g, '');
}

// Security: Validate path to prevent path traversal
function validatePath(inputPath) {
  const normalized = path.normalize(inputPath);
  if (normalized.includes("..") || normalized.includes("~")) {
    throw new Error("Invalid path: Path traversal detected");
  }
  if (normalized.length > 500) {
    throw new Error("Path too long");
  }
  return normalized;
}

// Security: Check if path is within project directory
function isPathInProject(targetPath, projectRoot) {
  const normalizedTarget = path.resolve(projectRoot, targetPath);
  const normalizedRoot = path.resolve(projectRoot);
  return normalizedTarget.startsWith(normalizedRoot);
}

// Check if current directory is an Express project
function isExpressProject() {
  const packageJsonPath = path.join(process.cwd(), "package.json");
  
  if (!fs.existsSync(packageJsonPath)) {
    return false;
  }

  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    return packageJson.dependencies && packageJson.dependencies.express;
  } catch (error) {
    return false;
  }
}

// Check if auth already exists
function authExists() {
  const authRoutesPath = path.join(process.cwd(), "src", "routes", "authRoutes.js");
  return fs.existsSync(authRoutesPath);
}

// Create User model with bcrypt
function createUserModel() {
  const modelDir = path.join(process.cwd(), "src", "models");
  const modelPath = path.join(modelDir, "User.js");

  // Security: Validate paths
  validatePath(modelDir);
  validatePath(modelPath);
  if (!isPathInProject(modelPath, process.cwd())) {
    throw new Error("Security: Attempted to write outside project directory");
  }

  // Check if User.js already exists
  if (fs.existsSync(modelPath)) {
    console.log("⚠ User.js already exists - skipping creation");
    console.log("  Please add bcrypt and JWT methods to your existing User model");
    return;
  }

  if (!fs.existsSync(modelDir)) {
    fs.mkdirSync(modelDir, { recursive: true });
  }

  const modelContent = `import bcrypt from 'bcryptjs';

class User {
  constructor() {
    this.users = []; // In-memory storage - replace with database
  }

  async create(userData) {
    // Security: Input validation
    if (!userData.email || typeof userData.email !== 'string' || userData.email.length > 255) {
      throw new Error('Invalid email');
    }
    if (!userData.password || typeof userData.password !== 'string' || userData.password.length < 6 || userData.password.length > 128) {
      throw new Error('Password must be between 6 and 128 characters');
    }
    if (!userData.username || typeof userData.username !== 'string' || userData.username.length > 100) {
      throw new Error('Invalid username');
    }

    // Check if user already exists
    const existingUser = this.users.find(u => u.email === userData.email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password with bcrypt (10 rounds)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    const user = {
      id: Date.now().toString(),
      username: userData.username,
      email: userData.email,
      password: hashedPassword,
      createdAt: new Date()
    };

    this.users.push(user);
    
    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async findByEmail(email) {
    // Security: Input validation
    if (!email || typeof email !== 'string' || email.length > 255) {
      throw new Error('Invalid email');
    }
    return this.users.find(u => u.email === email);
  }

  async findById(id) {
    // Security: Input validation
    if (!id || typeof id !== 'string' || id.length > 100) {
      throw new Error('Invalid id');
    }
    const user = this.users.find(u => u.id === id);
    if (!user) return null;
    
    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async comparePassword(plainPassword, hashedPassword) {
    // Security: Input validation
    if (!plainPassword || typeof plainPassword !== 'string' || plainPassword.length > 128) {
      throw new Error('Invalid password');
    }
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

export default new User();
`;

  fs.writeFileSync(modelPath, modelContent);
  console.log("✓ Created User model with bcrypt");
}

// Create auth controller with JWT
function createAuthController() {
  const controllerDir = path.join(process.cwd(), "src", "controllers");
  const controllerPath = path.join(controllerDir, "authController.js");

  // Security: Validate paths
  validatePath(controllerDir);
  validatePath(controllerPath);
  if (!isPathInProject(controllerPath, process.cwd())) {
    throw new Error("Security: Attempted to write outside project directory");
  }

  if (!fs.existsSync(controllerDir)) {
    fs.mkdirSync(controllerDir, { recursive: true });
  }

  const controllerContent = `import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Security: JWT secret should be in .env file
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Generate JWT token
function generateToken(userId) {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Register new user
export async function register(req, res) {
  try {
    const { username, email, password } = req.body;

    // Security: Input validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Create user with hashed password
    const user = await User.create({ username, email, password });

    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
      message: 'User registered successfully',
      user,
      token
    });
  } catch (error) {
    console.error('Register error:', error);
    
    if (error.message === 'User already exists') {
      return res.status(409).json({ message: error.message });
    }
    
    res.status(400).json({ message: error.message || 'Registration failed' });
  }
}

// Login user
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Security: Input validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await User.comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user.id);

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Login successful',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
}

// Get current user (protected route)
export async function getCurrentUser(req, res) {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Failed to get user' });
  }
}
`;

  fs.writeFileSync(controllerPath, controllerContent);
  console.log("✓ Created auth controller with JWT");
}

// Create auth routes
function createAuthRoutes() {
  const routesDir = path.join(process.cwd(), "src", "routes");
  const routesPath = path.join(routesDir, "authRoutes.js");

  // Security: Validate paths
  validatePath(routesDir);
  validatePath(routesPath);
  if (!isPathInProject(routesPath, process.cwd())) {
    throw new Error("Security: Attempted to write outside project directory");
  }

  if (!fs.existsSync(routesDir)) {
    fs.mkdirSync(routesDir, { recursive: true });
  }

  const routesContent = `import express from 'express';
import { register, login, getCurrentUser } from '../controllers/authController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', authMiddleware, getCurrentUser);

export default router;
`;

  fs.writeFileSync(routesPath, routesContent);
  console.log("✓ Created auth routes");
}

// Create auth middleware
function createAuthMiddleware() {
  const middlewareDir = path.join(process.cwd(), "src", "middlewares");
  const middlewarePath = path.join(middlewareDir, "authMiddleware.js");

  // Security: Validate paths
  validatePath(middlewareDir);
  validatePath(middlewarePath);
  if (!isPathInProject(middlewarePath, process.cwd())) {
    throw new Error("Security: Attempted to write outside project directory");
  }

  if (!fs.existsSync(middlewareDir)) {
    fs.mkdirSync(middlewareDir, { recursive: true });
  }

  const middlewareContent = `import jwt from 'jsonwebtoken';

// Security: JWT secret should be in .env file
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

export function authMiddleware(req, res, next) {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Security: Input validation
    if (!token || typeof token !== 'string' || token.length > 500) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Add user id to request
    req.userId = decoded.id;
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    res.status(401).json({ message: 'Authentication failed' });
  }
}
`;

  fs.writeFileSync(middlewarePath, middlewareContent);
  console.log("✓ Created auth middleware");
}

// Update server.js to include auth routes
function updateServerJs() {
  // Try multiple possible locations for server.js
  const possiblePaths = [
    path.join(process.cwd(), "server.js"),
    path.join(process.cwd(), "src", "server.js"),
    path.join(process.cwd(), "app.js"),
    path.join(process.cwd(), "src", "app.js")
  ];

  let serverPath = null;
  for (const tryPath of possiblePaths) {
    if (fs.existsSync(tryPath)) {
      serverPath = tryPath;
      break;
    }
  }

  if (!serverPath) {
    console.log("⚠ server.js not found. Please add auth routes manually:");
    console.log("  import authRoutes from './routes/authRoutes.js';");
    console.log("  app.use('/api/auth', authRoutes);");
    return;
  }

  // Security: Validate path
  validatePath(serverPath);
  if (!isPathInProject(serverPath, process.cwd())) {
    throw new Error("Security: Attempted to write outside project directory");
  }

  // Security: Check file size before reading (max 1MB)
  const stats = fs.statSync(serverPath);
  if (stats.size > 1024 * 1024) {
    throw new Error("server.js file too large (max 1MB)");
  }

  let serverContent = fs.readFileSync(serverPath, "utf8");

  // Check if auth routes already imported
  if (serverContent.includes("authRoutes")) {
    console.log("⚠ Auth routes already exist in server.js");
    return;
  }

  // Determine the correct import path based on server.js location
  const isServerInSrc = serverPath.includes(path.join("src", "server.js")) || 
                        serverPath.includes(path.join("src", "app.js"));
  const authRoutesImportPath = isServerInSrc 
    ? `import authRoutes from './routes/authRoutes.js';\n`
    : `import authRoutes from './src/routes/authRoutes.js';\n`;

  // Add import statement after other route imports
  const importMatch = serverContent.match(/(import.*Routes.*from.*['"]\.\/(src\/)?routes\/.*['"];?\n)/);
  if (importMatch) {
    const lastImport = importMatch[0];
    const importIndex = serverContent.lastIndexOf(lastImport) + lastImport.length;
    serverContent =
      serverContent.slice(0, importIndex) +
      authRoutesImportPath +
      serverContent.slice(importIndex);
  } else {
    // If no route imports found, add after express import
    const expressImportMatch = serverContent.match(/(import express from ['"]express['"];?\n)/);
    if (expressImportMatch) {
      const expressImport = expressImportMatch[0];
      const importIndex = serverContent.indexOf(expressImport) + expressImport.length;
      serverContent =
        serverContent.slice(0, importIndex) +
        authRoutesImportPath +
        serverContent.slice(importIndex);
    }
  }

  // Add route usage
  const routeMatch = serverContent.match(/(app\.use\(['"]\/api\/.*?['"],.*?Routes\);?\n)/);
  if (routeMatch) {
    const lastRoute = routeMatch[0];
    const routeIndex = serverContent.lastIndexOf(lastRoute) + lastRoute.length;
    serverContent =
      serverContent.slice(0, routeIndex) +
      `app.use('/api/auth', authRoutes);\n` +
      serverContent.slice(routeIndex);
  } else {
    // If no routes found, add before app.listen
    const listenMatch = serverContent.match(/(app\.listen\()/);
    if (listenMatch) {
      const listenIndex = serverContent.indexOf(listenMatch[0]);
      serverContent =
        serverContent.slice(0, listenIndex) +
        `\n// Auth routes\napp.use('/api/auth', authRoutes);\n\n` +
        serverContent.slice(listenIndex);
    }
  }

  fs.writeFileSync(serverPath, serverContent);
  console.log("✓ Updated server.js with auth routes");
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
  const randomSecret = require("crypto").randomBytes(64).toString("hex");

  const authEnvContent = `
# JWT Authentication
# Security: Change this secret in production!
JWT_SECRET=${randomSecret}
JWT_EXPIRES_IN=24h
# Note: Consider implementing rate limiting for auth endpoints
# Recommended: express-rate-limit package
`;

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
