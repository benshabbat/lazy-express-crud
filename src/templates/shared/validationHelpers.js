/**
 * Shared validation helpers for generated templates
 * Eliminates duplicate validation code across all templates
 */

export const validators = {
    /**
     * Validate string input with customizable options
     * @param {any} value - Value to validate
     * @param {string} fieldName - Name of field for error messages
     * @param {Object} options - Validation options
     * @param {boolean} options.required - Whether field is required
     * @param {number} options.minLength - Minimum length
     * @param {number} options.maxLength - Maximum length
     * @param {boolean} options.trim - Whether to trim whitespace
     * @throws {Error} Validation error with descriptive message
     * @returns {boolean} True if validation passes
     */
    string: (value, fieldName, options = {}) => {
        const {
            required = false,
            minLength = 0,
            maxLength = 255,
            trim = false
        } = options;

        // Required check
        if (required && !value) {
            throw new Error(`${fieldName} is required`);
        }

        // Skip further validation if optional and not provided
        if (!required && !value) {
            return true;
        }

        // Type check
        if (typeof value !== 'string') {
            throw new Error(`${fieldName} must be a string`);
        }

        // Trim if requested
        const testValue = trim ? value.trim() : value;

        // Empty check after trim (if trim enabled)
        if (trim && required && !testValue) {
            throw new Error(`${fieldName} cannot be empty or whitespace`);
        }

        // Length validations
        if (testValue.length < minLength) {
            throw new Error(`${fieldName} must be at least ${minLength} characters`);
        }

        if (testValue.length > maxLength) {
            throw new Error(`${fieldName} must be less than ${maxLength} characters`);
        }

        return true;
    },

    /**
     * Validate email format
     * @param {any} value - Email to validate
     * @param {string} fieldName - Field name for errors
     * @throws {Error} Validation error
     * @returns {boolean} True if valid
     */
    email: (value, fieldName = 'Email') => {
        // First validate as string
        validators.string(value, fieldName, { required: true, maxLength: 255, trim: true });

        // Check email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value.trim())) {
            throw new Error(`${fieldName} must be a valid email address`);
        }

        return true;
    },

    /**
     * Validate password strength
     * @param {any} value - Password to validate
     * @param {string} fieldName - Field name for errors
     * @param {Object} options - Password options
     * @param {number} options.minLength - Minimum length (default: 6)
     * @param {number} options.maxLength - Maximum length (default: 128)
     * @throws {Error} Validation error
     * @returns {boolean} True if valid
     */
    password: (value, fieldName = 'Password', options = {}) => {
        const { minLength = 6, maxLength = 128 } = options;

        validators.string(value, fieldName, {
            required: true,
            minLength,
            maxLength
        });

        return true;
    },

    /**
     * Validate number input
     * @param {any} value - Number to validate
     * @param {string} fieldName - Field name for errors
     * @param {Object} options - Validation options
     * @param {boolean} options.required - Whether field is required
     * @param {number} options.min - Minimum value
     * @param {number} options.max - Maximum value
     * @param {boolean} options.integer - Must be integer
     * @throws {Error} Validation error
     * @returns {boolean} True if valid
     */
    number: (value, fieldName, options = {}) => {
        const {
            required = false,
            min = -Infinity,
            max = Infinity,
            integer = false
        } = options;

        // Required check
        if (required && (value === null || value === undefined)) {
            throw new Error(`${fieldName} is required`);
        }

        // Skip if optional and not provided
        if (!required && (value === null || value === undefined)) {
            return true;
        }

        // Type check
        if (typeof value !== 'number' || isNaN(value)) {
            throw new Error(`${fieldName} must be a valid number`);
        }

        // Integer check
        if (integer && !Number.isInteger(value)) {
            throw new Error(`${fieldName} must be an integer`);
        }

        // Range checks
        if (value < min) {
            throw new Error(`${fieldName} must be at least ${min}`);
        }

        if (value > max) {
            throw new Error(`${fieldName} must be at most ${max}`);
        }

        return true;
    },

    /**
     * Validate boolean input
     * @param {any} value - Boolean to validate
     * @param {string} fieldName - Field name for errors
     * @param {boolean} required - Whether field is required
     * @throws {Error} Validation error
     * @returns {boolean} True if valid
     */
    boolean: (value, fieldName, required = false) => {
        if (required && value === undefined) {
            throw new Error(`${fieldName} is required`);
        }

        if (value !== undefined && typeof value !== 'boolean') {
            throw new Error(`${fieldName} must be a boolean`);
        }

        return true;
    }
};

/**
 * Generate validation code for templates
 * Useful for generating validation blocks in template strings
 * @param {Array} fields - Array of field definitions
 * @returns {string} Generated validation code
 * 
 * @example
 * generateValidationCode([
 *   { name: 'name', type: 'string', options: { required: true, maxLength: 100 } },
 *   { name: 'email', type: 'email' },
 *   { name: 'price', type: 'number', options: { min: 0 } }
 * ]);
 * // Returns:
 * // validators.string(data.name, 'name', {"required":true,"maxLength":100});
 * // validators.email(data.email, 'email');
 * // validators.number(data.price, 'price', {"min":0});
 */
export function generateValidationCode(fields) {
    return fields.map(({ name, type, options }) => {
        const optionsStr = options ? `, ${JSON.stringify(options)}` : '';
        return `    validators.${type}(data.${name}, '${name}'${optionsStr});`;
    }).join('\n');
}

/**
 * Generate validators object for templates
 * Creates the full validators code block to inject into templates
 * @returns {string} Complete validators object as string
 */
export function generateValidatorsCode() {
    return `const validators = {
    string: (value, fieldName, options = {}) => {
        const { required = false, minLength = 0, maxLength = 255, trim = false } = options;
        
        if (required && !value) {
            throw new Error(\`\${fieldName} is required\`);
        }
        if (!required && !value) return true;
        if (typeof value !== 'string') {
            throw new Error(\`\${fieldName} must be a string\`);
        }
        
        const testValue = trim ? value.trim() : value;
        if (trim && required && !testValue) {
            throw new Error(\`\${fieldName} cannot be empty or whitespace\`);
        }
        if (testValue.length < minLength) {
            throw new Error(\`\${fieldName} must be at least \${minLength} characters\`);
        }
        if (testValue.length > maxLength) {
            throw new Error(\`\${fieldName} must be less than \${maxLength} characters\`);
        }
        return true;
    },
    
    email: (value, fieldName = 'Email') => {
        validators.string(value, fieldName, { required: true, maxLength: 255, trim: true });
        const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
        if (!emailRegex.test(value.trim())) {
            throw new Error(\`\${fieldName} must be a valid email address\`);
        }
        return true;
    },
    
    number: (value, fieldName, options = {}) => {
        const { required = false, min = -Infinity, max = Infinity } = options;
        
        if (required && (value === null || value === undefined)) {
            throw new Error(\`\${fieldName} is required\`);
        }
        if (!required && (value === null || value === undefined)) return true;
        if (typeof value !== 'number' || isNaN(value)) {
            throw new Error(\`\${fieldName} must be a valid number\`);
        }
        if (value < min) {
            throw new Error(\`\${fieldName} must be at least \${min}\`);
        }
        if (value > max) {
            throw new Error(\`\${fieldName} must be at most \${max}\`);
        }
        return true;
    }
};`;
}
