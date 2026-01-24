// Shared Model Helpers
// Reusable functions for model template generation

/**
 * Generate MongoDB schema for a resource
 * @param {string} resourceName - Resource name
 * @param {Array<{name: string, type: string, required?: boolean, trim?: boolean, maxlength?: number, min?: number}>} fields - Schema fields
 * @param {boolean} isTypeScript - Whether to include TypeScript interface
 * @returns {string} MongoDB schema code
 */
export function generateMongoSchema(resourceName, fields, isTypeScript = false) {
    const resourceLower = resourceName.toLowerCase();
    
    // Generate field definitions
    const fieldDefs = fields.map(field => {
        const def = [];
        def.push(`    ${field.name}: {`);
        def.push(`        type: ${field.type},`);
        if (field.required) def.push(`        required: [true, '${field.displayName || field.name} is required'],`);
        if (field.trim) def.push(`        trim: true,`);
        if (field.maxlength) def.push(`        maxlength: [${field.maxlength}, '${field.displayName || field.name} cannot be more than ${field.maxlength} characters'],`);
        if (field.min !== undefined) def.push(`        min: [${field.min}, '${field.displayName || field.name} cannot be negative'],`);
        if (field.default !== undefined) def.push(`        default: ${typeof field.default === 'string' ? `'${field.default}'` : field.default}`);
        def.push(`    }`);
        return def.join('\n');
    }).join(',\n');
    
    // TypeScript interface
    const tsInterface = isTypeScript ? `
export interface I${resourceName} extends Document {
${fields.map(f => `    ${f.name}${f.required ? '' : '?'}: ${f.tsType || 'string'};`).join('\n')}
}

` : '';
    
    const schemaType = isTypeScript ? `<I${resourceName}>` : '';
    
    return `${isTypeScript ? "import mongoose, { Schema, Document } from 'mongoose';" : "import mongoose from 'mongoose';"}
${tsInterface}
const ${resourceLower}Schema = new ${isTypeScript ? 'Schema' : 'mongoose.Schema'}${schemaType}({
${fieldDefs}
}, {
    timestamps: true${isTypeScript ? '' : `,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }`}
});

// Security: Add index for performance
${resourceLower}Schema.index({ name: 1 });

const ${resourceName} = mongoose.model${isTypeScript ? `<I${resourceName}>` : ''}('${resourceName}', ${resourceLower}Schema);

export default ${resourceName};
`;
}

/**
 * Generate MySQL model class
 * @param {string} resourceName - Resource name
 * @param {Array<string>} fields - Field names
 * @param {boolean} isTypeScript - Whether to include TypeScript types
 * @returns {string} MySQL model code
 */
export function generateMySQLModel(resourceName, fields, isTypeScript = false) {
    const resourceLower = resourceName.toLowerCase();
    const resourcePlural = resourceLower + 's';
    const fieldsStr = fields.join(', ');
    const placeholders = fields.map(() => '?').join(', ');
    
    const imports = isTypeScript 
        ? `import db from '../config/database.js';
import type { ${resourceName}, ${resourceName}Input } from '../types/${resourceName}.types.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2';`
        : `import ${isTypeScript ? 'db' : 'pool'} from '../config/database.js';`;
    
    const returnTypes = {
        getAll: isTypeScript ? `: Promise<${resourceName}[]>` : '',
        getById: isTypeScript ? `: Promise<${resourceName} | undefined>` : '',
        create: isTypeScript ? `: Promise<${resourceName}>` : '',
        update: isTypeScript ? `: Promise<${resourceName} | null>` : '',
        delete: isTypeScript ? `: Promise<boolean>` : ''
    };
    
    const paramTypes = isTypeScript ? {
        id: ': string',
        data: `: ${resourceName}Input`,
        partialData: `: Partial<${resourceName}Input>`
    } : {
        id: '',
        data: '',
        partialData: ''
    };
    
    const rowType = isTypeScript ? '<RowDataPacket[]>' : '';
    const resultType = isTypeScript ? '<ResultSetHeader>' : '';
    const dbRef = isTypeScript ? 'db' : 'pool';
    
    // Generate UPDATE SET clause with dynamic fields
    const updateFields = fields.map(field => {
        return `        if (${field} !== undefined) {
            updates.push('${field} = ?');
            values.push(${field});
        }`;
    }).join('\n');
    
    const extractFields = `const { ${fieldsStr} } = data;`;
    const insertValues = fields.map(f => f === 'description' || f === 'price' ? `${f} || ${f === 'price' ? '0' : "''"}` : f).join(', ');
    
    return `${imports}

class ${resourceName}${isTypeScript ? 'Model' : ''} {
    static async getAll()${returnTypes.getAll} {
        const [rows] = await ${dbRef}.query${rowType}('SELECT * FROM ${resourcePlural} ORDER BY created_at DESC');
        return rows${isTypeScript ? ` as ${resourceName}[]` : ''};
    }

    static async getById(id${paramTypes.id})${returnTypes.getById} {
        const [rows] = await ${dbRef}.query${rowType}('SELECT * FROM ${resourcePlural} WHERE id = ?', [id]);
        return rows[0]${isTypeScript ? ` as ${resourceName} | undefined` : ''};
    }

    static async create(data${paramTypes.data})${returnTypes.create} {
        ${extractFields}
        const [result] = await ${dbRef}.query${resultType}(
            'INSERT INTO ${resourcePlural} (${fieldsStr}) VALUES (${placeholders})',
            [${insertValues}]
        );
        return {
            id: ${isTypeScript ? 'result.insertId.toString()' : 'result.insertId'},
            ${fields.map(f => `${f}: ${f === 'description' || f === 'price' ? `${f} || ${f === 'price' ? '0' : "''"}` : f}`).join(',\n            ')}
        };
    }

    static async update(id${paramTypes.id}, data${paramTypes.partialData})${returnTypes.update} {
        ${extractFields}
        const updates${isTypeScript ? ': string[]' : ''} = [];
        const values${isTypeScript ? ': any[]' : ''} = [];
        
${updateFields}
        
        if (updates.length === 0) return null;
        
        values.push(id);
        const [result] = await ${dbRef}.query${resultType}(
            \`UPDATE ${resourcePlural} SET \${updates.join(', ')} WHERE id = ?\`,
            values
        );
        
        if (result.affectedRows === 0) return null;
        return await ${resourceName}${isTypeScript ? 'Model' : ''}.getById(id)${isTypeScript ? ' || null' : ''};
    }

    static async delete(id${paramTypes.id})${returnTypes.delete} {
        const [result] = await ${dbRef}.query${resultType}('DELETE FROM ${resourcePlural} WHERE id = ?', [id]);
        return result.affectedRows > 0${isTypeScript ? '' : ' ? { id } : null'};
    }
}

export default ${resourceName}${isTypeScript ? 'Model as any' : ''};
`;
}

/**
 * Generate in-memory model class
 * @param {string} resourceName - Resource name
 * @param {Array<{name: string, value: any}>} fields - Sample fields
 * @returns {string} In-memory model code
 */
export function generateMemoryModel(resourceName, fields) {
    const resourceLower = resourceName.toLowerCase();
    const resourcePlural = resourceLower + 's';
    
    // Generate sample data
    const sampleFields = fields.map(f => `        ${f.name}: ${typeof f.value === 'string' ? `'${f.value}'` : f.value}`).join(',\n');
    
    const fieldsList = fields.map(f => f.name).join(', ');
    const fieldAssignments = fields.map(f => `            ${f.name}: data.${f.name}${f.optional ? ` || ${typeof f.default === 'string' ? `'${f.default}'` : f.default}` : ''}`).join(',\n');
    
    return `// In-memory storage (for demo purposes only - data will be lost on server restart)
let ${resourcePlural} = [
    { 
        id: '1', 
        name: 'Sample ${resourceName} 1', 
${sampleFields},
        createdAt: new Date().toISOString()
    },
    { 
        id: '2', 
        name: 'Sample ${resourceName} 2', 
${sampleFields},
        createdAt: new Date().toISOString()
    }
];
let nextId = 3;

class ${resourceName} {
    static getAll() {
        return ${resourcePlural};
    }

    static getById(id) {
        return ${resourcePlural}.find(${resourceLower} => ${resourceLower}.id === id);
    }

    static create(data) {
        const new${resourceName} = {
            id: String(nextId++),
${fieldAssignments},
            createdAt: new Date().toISOString()
        };
        ${resourcePlural}.push(new${resourceName});
        return new${resourceName};
    }

    static update(id, data) {
        const index = ${resourcePlural}.findIndex(${resourceLower} => ${resourceLower}.id === id);
        if (index === -1) return null;
        
        ${resourcePlural}[index] = { 
            ...${resourcePlural}[index], 
            ...data,
            updatedAt: new Date().toISOString()
        };
        return ${resourcePlural}[index];
    }

    static delete(id) {
        const index = ${resourcePlural}.findIndex(${resourceLower} => ${resourceLower}.id === id);
        if (index === -1) return null;
        
        const deleted = ${resourcePlural}[index];
        ${resourcePlural}.splice(index, 1);
        return deleted;
    }
}

export default ${resourceName};
`;
}

/**
 * Generate complete model based on database choice
 * @param {string} resourceName - Resource name
 * @param {string} dbChoice - Database choice (mongodb, mysql, memory)
 * @param {boolean} isTypeScript - Whether to include TypeScript
 * @param {Object} options - Additional options
 * @returns {string} Complete model code
 */
export function generateModel(resourceName, dbChoice, isTypeScript = false, options = {}) {
    const defaultFields = options.fields || [
        { name: 'name', type: 'String', required: true, trim: true, maxlength: 255, tsType: 'string', displayName: 'Name' },
        { name: 'description', type: 'String', trim: true, maxlength: 2000, tsType: 'string', default: '' },
        { name: 'price', type: 'Number', min: 0, tsType: 'number', default: 0 }
    ];
    
    if (dbChoice === 'mongodb') {
        return generateMongoSchema(resourceName, defaultFields, isTypeScript);
    } else if (dbChoice === 'mysql') {
        const fieldNames = defaultFields.map(f => f.name);
        return generateMySQLModel(resourceName, fieldNames, isTypeScript);
    } else {
        const memoryFields = defaultFields.map(f => ({
            name: f.name,
            value: f.name === 'name' ? `${f.displayName || f.name} for demo` : 
                   f.name === 'description' ? 'This is a sample description' :
                   f.name === 'price' ? 10.99 : '',
            optional: !f.required,
            default: f.default !== undefined ? f.default : (f.name === 'description' ? '' : 0)
        }));
        return generateMemoryModel(resourceName, memoryFields);
    }
}
