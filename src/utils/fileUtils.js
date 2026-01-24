// File system utilities
import fs from 'fs';
import path from 'path';
import { validatePath, isPathInProject } from '../validators/index.js';

/**
 * Create directory recursively if it doesn't exist
 * @param {string} dirPath - Directory path to create
 * @returns {boolean} True if created or already exists
 */
export function ensureDirectory(dirPath) {
    try {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
            return true;
        }
        return false;
    } catch (error) {
        throw new Error(`Failed to create directory ${dirPath}: ${error.message}`);
    }
}

/**
 * Create multiple directories
 * @param {Array<string>} directories - Array of directory paths
 * @param {boolean} verbose - Whether to log each creation
 * @returns {Array<string>} Array of created directories
 */
export function createDirectories(directories, verbose = false) {
    const created = [];
    
    directories.forEach(dir => {
        if (ensureDirectory(dir)) {
            created.push(dir);
            if (verbose) {
                console.log(`✅ Created directory: ${path.relative(process.cwd(), dir)}`);
            }
        }
    });
    
    return created;
}

/**
 * Write file with content
 * @param {string} filePath - File path
 * @param {string} content - File content
 * @param {object} options - Write options
 */
export function writeFile(filePath, content, options = {}) {
    try {
        // Ensure directory exists
        const dirPath = path.dirname(filePath);
        ensureDirectory(dirPath);
        
        fs.writeFileSync(filePath, content, options);
    } catch (error) {
        throw new Error(`Failed to write file ${filePath}: ${error.message}`);
    }
}

/**
 * Write multiple files
 * @param {Array<{path: string, content: string, type?: string}>} files - Array of file objects
 * @param {boolean} verbose - Whether to log each creation
 * @returns {Array<string>} Array of created file paths
 */
export function writeFiles(files, verbose = false) {
    const created = [];
    
    files.forEach(file => {
        try {
            writeFile(file.path, file.content);
            created.push(file.path);
            
            if (verbose) {
                const displayName = file.type 
                    ? `${file.type}: ${path.basename(file.path)}`
                    : path.relative(process.cwd(), file.path);
                console.log(`✅ Created ${displayName}`);
            }
        } catch (error) {
            console.error(`❌ Error creating ${file.type || 'file'}: ${error.message}`);
            throw error;
        }
    });
    
    return created;
}

/**
 * Read file content safely
 * @param {string} filePath - File path to read
 * @param {string} projectRoot - Project root for security validation
 * @returns {string|null} File content or null if not found
 */
export function readFileSafe(filePath, projectRoot = process.cwd()) {
    try {
        if (!fs.existsSync(filePath)) {
            return null;
        }
        
        // Security: Validate path
        validatePath(filePath);
        if (projectRoot && !isPathInProject(filePath, projectRoot)) {
            throw new Error('Security: File path is outside project directory');
        }
        
        return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
        if (error.code === 'ENOENT') {
            return null;
        }
        throw error;
    }
}

/**
 * Check if file exists
 * @param {string} filePath - File path to check
 * @returns {boolean} True if file exists
 */
export function fileExists(filePath) {
    try {
        return fs.existsSync(filePath);
    } catch {
        return false;
    }
}

/**
 * Update server file with new route import and registration
 * @param {string} serverPath - Path to server file
 * @param {string} resourceName - Resource name (e.g., 'Product')
 * @param {string} ext - File extension ('js' or 'ts')
 * @returns {boolean} True if updated successfully
 */
export function updateServerWithRoute(serverPath, resourceName, ext = 'js') {
    try {
        let serverContent = readFileSafe(serverPath);
        
        if (!serverContent) {
            return false;
        }
        
        const resourceLower = resourceName.toLowerCase();
        const resourcePlural = resourceLower + 's';
        const routeFileName = `${resourceLower}Routes.${ext}`;
        
        // Check if route already imported
        const importStatement = `import ${resourceLower}Routes from './routes/${routeFileName}';`;
        if (serverContent.includes(importStatement)) {
            return false; // Already exists
        }
        
        // Find the last import statement
        const importRegex = /import .+ from .+;/g;
        const imports = serverContent.match(importRegex);
        if (imports && imports.length > 0) {
            const lastImport = imports[imports.length - 1];
            serverContent = serverContent.replace(lastImport, `${lastImport}\n${importStatement}`);
        }
        
        // Check if route already registered
        const routeStatement = `app.use('/api/${resourcePlural}', ${resourceLower}Routes);`;
        if (serverContent.includes(routeStatement)) {
            return false; // Already exists
        }
        
        // Find where to add the route (after other app.use routes)
        const routeRegex = /app\.use\('\/api\/\w+',\s+\w+Routes\);/g;
        const routes = serverContent.match(routeRegex);
        if (routes && routes.length > 0) {
            const lastRoute = routes[routes.length - 1];
            serverContent = serverContent.replace(lastRoute, `${lastRoute}\n${routeStatement}`);
        } else {
            // If no routes exist, add after items route
            const itemsRoute = "app.use('/api/items', itemRoutes);";
            if (serverContent.includes(itemsRoute)) {
                serverContent = serverContent.replace(itemsRoute, `${itemsRoute}\n${routeStatement}`);
            }
        }
        
        writeFile(serverPath, serverContent);
        return true;
    } catch (error) {
        console.log(`⚠️  Note: Could not automatically update server file: ${error.message}`);
        return false;
    }
}

/**
 * Copy file from source to destination
 * @param {string} srcPath - Source file path
 * @param {string} destPath - Destination file path
 */
export function copyFile(srcPath, destPath) {
    try {
        const content = fs.readFileSync(srcPath);
        writeFile(destPath, content);
    } catch (error) {
        throw new Error(`Failed to copy file from ${srcPath} to ${destPath}: ${error.message}`);
    }
}
