// Types templates for TypeScript projects

export function getTypesTemplate(dbChoice) {
    let types = `// Common types for the application

export interface Item {
    ${dbChoice === 'mongodb' ? '_id' : 'id'}${dbChoice === 'mongodb' ? '?' : ''}: string${dbChoice === 'mongodb' ? ' | undefined' : ''};
    name: string;
    description?: string;
    price?: number;
    ${dbChoice === 'mysql' ? 'created_at?: Date;\n    updated_at?: Date;' : ''}${dbChoice === 'mongodb' ? 'createdAt?: Date;\n    updatedAt?: Date;' : ''}
}

export interface ItemInput {
    name: string;
    description?: string;
    price?: number;
}

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    count?: number;
    message?: string;
}
`;

    return types;
}
