// Error handling utilities

/**
 * Sanitize error messages for production
 * @param {Error|string} error - Error object or message
 * @returns {string} Sanitized error message
 */
export function sanitizeError(error) {
    if (process.env.NODE_ENV === 'production') {
        return 'An error occurred. Please check your configuration.';
    }
    return error.message || error.toString();
}
