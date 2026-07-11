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
    // Check '..' as a distinct path segment, not a substring: a raw substring
    // check also rejects legitimate paths, e.g. Windows 8.3 short names like
    // "RUNNER~1" (used in TEMP/TMP on GitHub Actions Windows runners), which
    // contain '~' but have no traversal meaning since Node never expands it.
    const segments = normalized.split(path.sep);
    if (segments.includes('..')) {
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
