// Types templates for TypeScript projects

/**
 * Generate Item-specific types in separate file
 * @param {string} dbChoice - Database choice
 * @returns {string} Item types template
 */
export function getItemTypesTemplate(dbChoice) {
    const idField = dbChoice === 'mongodb' ? '_id' : 'id';
    const idType = dbChoice === 'mongodb' ? '?: string | undefined' : ': string';
    const timestampFields = dbChoice === 'mysql' 
        ? '    created_at?: Date;\n    updated_at?: Date;'
        : '    createdAt?: Date;\n    updatedAt?: Date;';

    return `// TypeScript types for Item resource

export interface Item {
    ${idField}${idType};
    name: string;
    description?: string;
    price?: number;
    ${timestampFields}
}

export interface ItemInput {
    name: string;
    description?: string;
    price?: number;
}
`;
}

/**
 * Generate common types that are shared across resources
 * @returns {string} Common types template
 */
export function getCommonTypesTemplate() {
    return `// Common types shared across all resources

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    count?: number;
    message?: string;
}
`;
}

/**
 * Generate all types in single file (DEPRECATED - kept for backward compatibility)
 * @param {string} dbChoice - Database choice
 * @returns {string} All types template
 */
export function getTypesTemplate(dbChoice) {
    return getItemTypesTemplate(dbChoice) + '\n' + getCommonTypesTemplate();
}
