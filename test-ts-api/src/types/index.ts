// Common types for the application

export interface Item {
    _id?: string | undefined;
    name: string;
    description?: string;
    price?: number;
    createdAt?: Date;
    updatedAt?: Date;
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
