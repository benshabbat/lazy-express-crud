// Path validation utilities
import path from 'path';

/**
 * Validate path to prevent path traversal attacks
 * @param {string} inputPath - Path to validate
 * @returns {string} Normalized path
 * @throws {Error} If path contains traversal patterns
 */
export function validatePath(inputPath) {
    const normalized = path.normalize(inputPath);
    if (normalized.includes('..') || normalized.includes('~')) {
        throw new Error('Invalid path: Path traversal detected');
    }
    if (normalized.length > 500) {
        throw new Error('Path too long');
    }
    return normalized;
}

/**
 * Check if path is within project directory
 * @param {string} targetPath - Target path to check
 * @param {string} projectRoot - Project root directory
 * @returns {boolean} True if path is within project
 */
export function isPathInProject(targetPath, projectRoot) {
    const normalizedTarget = path.resolve(projectRoot, targetPath);
    const normalizedRoot = path.resolve(projectRoot);
    return normalizedTarget.startsWith(normalizedRoot);
}
