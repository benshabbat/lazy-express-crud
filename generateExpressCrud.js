#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import {
    validateProjectName,
    createPromptInterface,
    promptLanguage,
    promptDatabase,
    sanitizeError
} from './src/utils/index.js';
import {
    getTsConfigTemplate,
    getTypesTemplate,
    getItemTypesTemplate,
    getCommonTypesTemplate,
    getServerTemplateTS,
    getDatabaseConfigTemplateTS,
    getRoutesTemplateTS,
    getControllerTemplateTS,
    getServiceTemplateTS,
    getModelTemplateTS
} from './src/templates/typescript/index.js';
import {
    getJestConfigJS,
    getJestConfigTS,
    getTestTemplateMongoJS,
    getTestTemplateMySQLJS,
    getTestTemplateMemoryJS,
    getTestTemplateMongoTS,
    getTestTemplateMySQLTS,
    getTestTemplateMemoryTS
} from './src/templates/tests/index.js';
import {
    getDatabaseConfigTemplate,
    getServerTemplate,
    getRoutesTemplate,
    getEnvTemplate,
    getGitignoreTemplate,
    getReadmeTemplate
} from './src/templates/project/index.js';
import {
    getSecurityMiddlewareTemplate,
    getSecurityMiddlewareTemplateTS,
    getCorsMiddlewareTemplate,
    getCorsMiddlewareTemplateTS,
    getErrorHandlerTemplate,
    getErrorHandlerTemplateTS
} from './src/templates/middlewares/index.js';
import {
    getControllerTemplate,
    getServiceTemplate,
    getModelTemplate
} from './src/templates/javascript/index.js';
import {
    getPackageJsonTemplate,
    getNextStepsText,
    getDatabaseDisplayName
} from './src/templates/packageJson/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Normalize a --lang/--language value to 'javascript' or 'typescript'.
 * @param {string} value
 * @returns {string|null} Normalized value, or null if not recognized
 */
function normalizeLanguageFlag(value) {
    const normalized = String(value).trim().toLowerCase();
    if (['js', 'javascript'].includes(normalized)) return 'javascript';
    if (['ts', 'typescript'].includes(normalized)) return 'typescript';
    return null;
}

/**
 * Normalize a --db/--database value to 'mongodb', 'mysql' or 'memory'.
 * @param {string} value
 * @returns {string|null} Normalized value, or null if not recognized
 */
function normalizeDatabaseFlag(value) {
    const normalized = String(value).trim().toLowerCase();
    if (['mongodb', 'mongo'].includes(normalized)) return 'mongodb';
    if (normalized === 'mysql') return 'mysql';
    if (['memory', 'in-memory', 'none'].includes(normalized)) return 'memory';
    return null;
}

// Parse command line arguments: the first non-flag argument is the project
// name; --lang/--language and --db/--database let CI pipelines and other
// non-interactive/piped-stdin usages skip the prompts entirely.
const rawArgs = process.argv.slice(2);
const positionalArgs = [];
let langFlagRaw = null;
let dbFlagRaw = null;

for (const arg of rawArgs) {
    const flagMatch = arg.match(/^--(lang|language|db|database)(?:=(.*))?$/);
    if (!flagMatch) {
        positionalArgs.push(arg);
        continue;
    }

    const [, flagName, flagValue] = flagMatch;
    if (flagValue === undefined) {
        console.error(`❌ Error: Missing value for --${flagName}. Use --${flagName}=<value>.`);
        process.exit(1);
    }

    if (flagName === 'lang' || flagName === 'language') {
        langFlagRaw = flagValue;
    } else {
        dbFlagRaw = flagValue;
    }
}

let cliLanguage = null;
if (langFlagRaw !== null) {
    cliLanguage = normalizeLanguageFlag(langFlagRaw);
    if (!cliLanguage) {
        console.error(`❌ Error: Invalid --lang value "${langFlagRaw}". Expected "javascript" or "typescript".`);
        process.exit(1);
    }
}

let cliDatabase = null;
if (dbFlagRaw !== null) {
    cliDatabase = normalizeDatabaseFlag(dbFlagRaw);
    if (!cliDatabase) {
        console.error(`❌ Error: Invalid --db value "${dbFlagRaw}". Expected "mongodb", "mysql" or "memory".`);
        process.exit(1);
    }
}

// Get project name from command line arguments
const projectName = positionalArgs[0] || 'express-crud-app';

// Security: Basic length check to prevent DoS
if (projectName.length > 214) {
    console.error('❌ Error: Project name is too long (max 214 characters)');
    process.exit(1);
}

// Validate the project name
try {
    validateProjectName(projectName);
} catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
}

// Create project directory
const projectPath = path.join(process.cwd(), projectName);

// Check if directory already exists
if (fs.existsSync(projectPath)) {
    console.error(`❌ Error: Directory "${projectName}" already exists. Please choose a different name or remove the existing directory.`);
    process.exit(1);
}

// Main async function
async function createProject() {
    // Reuse a single readline interface across every prompt in this
    // sequence. Creating a fresh interface per question breaks piped/CI
    // stdin: only the first interface ever receives input and the process
    // silently exits with code 0 once stdin reaches EOF while later prompts
    // are still pending (see issue #5).
    let rl = null;
    const getPromptInterface = () => {
        if (!rl) {
            rl = createPromptInterface();
        }
        return rl;
    };

    let langChoice;
    let dbChoice;
    try {
        // Ask for language choice (skipped if --lang/--language was provided)
        langChoice = cliLanguage || await promptLanguage(getPromptInterface());

        // Ask for database choice (skipped if --db/--database was provided)
        dbChoice = cliDatabase || await promptDatabase(getPromptInterface());
    } finally {
        if (rl) {
            rl.close();
        }
    }

    const isTypeScript = langChoice === 'typescript';
    const ext = isTypeScript ? 'ts' : 'js';
    
    console.log(`\n🚀 Creating Express CRUD project: ${projectName}`);
    console.log(`💻 Language: ${isTypeScript ? 'TypeScript' : 'JavaScript'}`);
    console.log(`📊 Database: ${dbChoice === 'mongodb' ? 'MongoDB' : dbChoice === 'mysql' ? 'MySQL' : 'In-Memory'}`);

// Create directory structure
const directories = [
    projectPath,
    path.join(projectPath, 'src'),
    path.join(projectPath, 'src', 'routes'),
    path.join(projectPath, 'src', 'controllers'),
    path.join(projectPath, 'src', 'services'),
    path.join(projectPath, 'src', 'models'),
    path.join(projectPath, 'src', 'middlewares'),
    path.join(projectPath, 'src', 'config'),
    path.join(projectPath, 'tests'),
    ...(isTypeScript ? [path.join(projectPath, 'src', 'types')] : [])
];

directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
        try {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`✅ Created directory: ${path.relative(process.cwd(), dir)}`);
        } catch (error) {
            console.error(`❌ Error creating directory ${dir}: ${error.message}`);
            process.exit(1);
        }
    }
});

// Generate package.json
const packageJson = getPackageJsonTemplate(projectName, dbChoice, isTypeScript);

// Write all files
const files = [
    { path: path.join(projectPath, 'package.json'), content: JSON.stringify(packageJson, null, 2) },
    { path: path.join(projectPath, `src/server.${ext}`), content: isTypeScript ? getServerTemplateTS('Item', dbChoice, projectName) : getServerTemplate('Item', dbChoice) },
    { path: path.join(projectPath, `src/routes/itemRoutes.${ext}`), content: isTypeScript ? getRoutesTemplateTS('Item') : getRoutesTemplate('Item') },
    { path: path.join(projectPath, `src/controllers/itemController.${ext}`), content: isTypeScript ? getControllerTemplateTS('Item', dbChoice) : getControllerTemplate('Item', dbChoice) },
    { path: path.join(projectPath, `src/services/itemService.${ext}`), content: isTypeScript ? getServiceTemplateTS('Item', dbChoice) : getServiceTemplate('Item', dbChoice) },
    { path: path.join(projectPath, `src/models/Item.${ext}`), content: isTypeScript ? getModelTemplateTS('Item', dbChoice) : getModelTemplate('Item', dbChoice) },
    { path: path.join(projectPath, `src/middlewares/security.${ext}`), content: isTypeScript ? getSecurityMiddlewareTemplateTS() : getSecurityMiddlewareTemplate() },
    { path: path.join(projectPath, `src/middlewares/cors.${ext}`), content: isTypeScript ? getCorsMiddlewareTemplateTS() : getCorsMiddlewareTemplate() },
    { path: path.join(projectPath, `src/middlewares/errorHandler.${ext}`), content: isTypeScript ? getErrorHandlerTemplateTS() : getErrorHandlerTemplate() },
    { path: path.join(projectPath, '.env'), content: getEnvTemplate(dbChoice, projectName) },
    { path: path.join(projectPath, '.gitignore'), content: isTypeScript ? getGitignoreTemplate() + 'dist/\n' : getGitignoreTemplate() },
    { path: path.join(projectPath, 'README.md'), content: getReadmeTemplate(dbChoice, projectName) }
];

// Add TypeScript specific files
if (isTypeScript) {
    files.push(
        { path: path.join(projectPath, 'tsconfig.json'), content: getTsConfigTemplate() },
        { path: path.join(projectPath, `src/types/Item.types.${ext}`), content: getItemTypesTemplate(dbChoice) },
        { path: path.join(projectPath, `src/types/index.${ext}`), content: getCommonTypesTemplate() }
    );
}

// Add database config file if using MongoDB or MySQL
if (dbChoice === 'mongodb' || dbChoice === 'mysql') {
    files.push({
        path: path.join(projectPath, `src/config/database.${ext}`),
        content: isTypeScript ? getDatabaseConfigTemplateTS(dbChoice, projectName) : getDatabaseConfigTemplate(dbChoice)
    });
}

// Add Jest configuration file
files.push({
    path: path.join(projectPath, 'jest.config.js'),
    content: isTypeScript ? getJestConfigTS() : getJestConfigJS()
});

// Add test file for Item resource
const testFileName = `Item.test.${isTypeScript ? 'ts' : 'js'}`;
let testContent;
if (isTypeScript) {
    testContent = dbChoice === 'mongodb' ? getTestTemplateMongoTS('Item') :
                  dbChoice === 'mysql' ? getTestTemplateMySQLTS('Item') :
                  getTestTemplateMemoryTS('Item');
} else {
    testContent = dbChoice === 'mongodb' ? getTestTemplateMongoJS('Item') :
                  dbChoice === 'mysql' ? getTestTemplateMySQLJS('Item') :
                  getTestTemplateMemoryJS('Item');
}
files.push({
    path: path.join(projectPath, 'tests', testFileName),
    content: testContent
});

files.forEach(file => {
    try {
        fs.writeFileSync(file.path, file.content);
        console.log(`✅ Created file: ${path.relative(process.cwd(), file.path)}`);
    } catch (error) {
        console.error(`❌ Error creating file ${file.path}: ${error.message}`);
        process.exit(1);
    }
});

const nextSteps = getNextStepsText(projectName, dbChoice);

console.log(`
✨ Project created successfully!

Database: ${getDatabaseDisplayName(dbChoice)}

Next steps:${nextSteps}
Your Express CRUD API will be running on http://localhost:3000
`);
}

// Run the async function
createProject().catch(error => {
    console.error(`❌ Error creating project: ${sanitizeError(error)}`);
    process.exit(1);
});
