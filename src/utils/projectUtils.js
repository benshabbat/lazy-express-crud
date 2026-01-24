// Project detection and analysis utilities
import fs from 'fs';
import path from 'path';
import { validatePath, isPathInProject } from '../validators/index.js';
import { SECURITY_LIMITS } from '../config/security.js';

/**
 * Read and parse package.json safely
 * @param {string} projectPath - Path to project directory
 * @returns {object|null} Parsed package.json or null if not found/invalid
 */
export function readPackageJson(projectPath) {
    const packageJsonPath = path.join(projectPath, 'package.json');
    
    try {
        if (!fs.existsSync(packageJsonPath)) {
            return null;
        }
        
        // Security: Check file size before reading
        const stats = fs.statSync(packageJsonPath);
        if (stats.size > SECURITY_LIMITS.MAX_PACKAGE_JSON_SIZE) {
            throw new Error(`package.json file too large (max ${SECURITY_LIMITS.MAX_PACKAGE_JSON_SIZE / 1024 / 1024}MB)`);
        }
        
        // Security: Validate path
        validatePath(packageJsonPath);
        if (!isPathInProject(packageJsonPath, projectPath)) {
            throw new Error('Security: package.json path is outside project directory');
        }
        const content = fs.readFileSync(packageJsonPath, 'utf8');
        return JSON.parse(content);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return null;
        }
        throw error;
    }
}

/**
 * Check if project is TypeScript
 * @param {string} projectPath - Path to project directory
 * @returns {boolean} True if TypeScript project
 */
export function isTypeScriptProject(projectPath = process.cwd()) {
    const packageJson = readPackageJson(projectPath);
    
    if (!packageJson) {
        return false;
    }
    
    const devDeps = packageJson.devDependencies || {};
    return !!(devDeps.typescript || devDeps.tsx);
}

/**
 * Detect database type from package.json dependencies
 * @param {string} projectPath - Path to project directory
 * @returns {string} Database type: 'mongodb', 'mysql', or 'memory'
 */
export function detectDatabase(projectPath = process.cwd()) {
    const packageJson = readPackageJson(projectPath);
    
    if (!packageJson) {
        return 'memory';
    }
    
    const dependencies = packageJson.dependencies || {};
    
    if (dependencies.mongoose) {
        return 'mongodb';
    } else if (dependencies.mysql2) {
        return 'mysql';
    } else {
        return 'memory';
    }
}

/**
 * Check if current directory is an Express project
 * @param {string} projectPath - Path to project directory
 * @returns {boolean} True if Express project
 */
export function isExpressProject(projectPath = process.cwd()) {
    const packageJson = readPackageJson(projectPath);
    
    if (!packageJson) {
        return false;
    }
    
    return !!(packageJson.dependencies && packageJson.dependencies.express);
}

/**
 * Get project file extension based on TypeScript usage
 * @param {string} projectPath - Path to project directory
 * @returns {string} File extension: 'ts' or 'js'
 */
export function getProjectExtension(projectPath = process.cwd()) {
    return isTypeScriptProject(projectPath) ? 'ts' : 'js';
}

/**
 * Get project configuration
 * @param {string} projectPath - Path to project directory
 * @returns {object} Project configuration object
 */
export function getProjectConfig(projectPath = process.cwd()) {
    const isTypeScript = isTypeScriptProject(projectPath);
    const database = detectDatabase(projectPath);
    const extension = isTypeScript ? 'ts' : 'js';
    
    return {
        isTypeScript,
        database,
        extension,
        isExpress: isExpressProject(projectPath)
    };
}

/**
 * Check if directory has Express CRUD structure
 * @param {string} projectPath - Path to project directory
 * @returns {boolean} True if has CRUD structure
 */
export function hasCrudStructure(projectPath = process.cwd()) {
    const srcDir = path.join(projectPath, 'src');
    const routesDir = path.join(srcDir, 'routes');
    const controllersDir = path.join(srcDir, 'controllers');
    const servicesDir = path.join(srcDir, 'services');
    const modelsDir = path.join(srcDir, 'models');
    
    return fs.existsSync(srcDir) &&
           fs.existsSync(routesDir) &&
           fs.existsSync(controllersDir) &&
           fs.existsSync(servicesDir) &&
           fs.existsSync(modelsDir);
}
