// Name validation utilities

/**
 * Validate resource name (PascalCase for models/resources)
 * @param {string} name - Resource name to validate
 * @returns {boolean} True if valid
 * @throws {Error} If validation fails
 */
export function validateResourceName(name) {
    // Check length (prevent DoS)
    if (!name || name.length === 0 || name.length > 100) {
        throw new Error('Resource name must be between 1 and 100 characters');
    }
    
    // Check for valid PascalCase pattern
    const validPattern = /^[A-Z][a-zA-Z0-9]*$/;
    if (!validPattern.test(name)) {
        throw new Error('Resource name must be in PascalCase (e.g., User, ProductItem)');
    }
    
    // Prevent path traversal
    if (name.includes('..') || name.includes('/') || name.includes('\\')) {
        throw new Error('Resource name cannot contain path separators');
    }
    
    // Prevent reserved JavaScript/TypeScript keywords and Node.js globals
    const reserved = [
        'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 'default',
        'delete', 'do', 'else', 'enum', 'export', 'extends', 'false', 'finally',
        'for', 'function', 'if', 'import', 'in', 'instanceof', 'new', 'null',
        'return', 'super', 'switch', 'this', 'throw', 'true', 'try', 'typeof',
        'var', 'void', 'while', 'with', 'yield', 'let', 'static', 'implements',
        'interface', 'package', 'private', 'protected', 'public',
        'Node', 'Process', 'Global', 'Console', 'Module', 'Require'
    ];
    
    if (reserved.includes(name)) {
        throw new Error(`"${name}" is a reserved name and cannot be used as a resource name`);
    }
    
    return true;
}

/**
 * Validate project name for npm package naming conventions
 * @param {string} name - Project name to validate
 * @returns {boolean} True if valid
 * @throws {Error} If validation fails (exits process)
 */
export function validateProjectName(name) {
    // Check length (prevent DoS)
    if (name.length === 0 || name.length > 214) {
        console.error('❌ Error: Project name must be between 1 and 214 characters.');
        process.exit(1);
    }
    
    // Check for valid characters (alphanumeric, dash, underscore)
    const validPattern = /^[a-zA-Z0-9_-]+$/;
    
    if (!validPattern.test(name)) {
        console.error('❌ Error: Project name can only contain letters, numbers, dashes, and underscores.');
        process.exit(1);
    }
    
    // Prevent path traversal attacks
    if (name.includes('..') || name.includes('/') || name.includes('\\')) {
        console.error('❌ Error: Project name cannot contain path separators or parent directory references.');
        process.exit(1);
    }
    
    // Prevent reserved names
    const reserved = ['node_modules', '.git', '.env', 'package.json', 'package-lock.json', 'src', 'dist', 'build'];
    if (reserved.includes(name.toLowerCase())) {
        console.error(`❌ Error: "${name}" is a reserved name and cannot be used.`);
        process.exit(1);
    }
    
    // Prevent starting with dot (hidden files)
    if (name.startsWith('.')) {
        console.error('❌ Error: Project name cannot start with a dot.');
        process.exit(1);
    }
    
    return true;
}
