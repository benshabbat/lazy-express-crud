# Project Structure

This document describes the organized structure of the lazy-express-crud codebase.

## Directory Structure

```
scriptsForJs/
├── src/
│   ├── generators/           # Main generator files (future)
│   ├── templates/
│   │   ├── javascript/       # JavaScript templates
│   │   │   ├── controllerTemplate.js
│   │   │   ├── serviceTemplate.js
│   │   │   ├── modelTemplate.js
│   │   │   └── index.js
│   │   └── typescript/       # TypeScript templates
│   │       ├── configTemplate.js
│   │       ├── typesTemplate.js
│   │       ├── serverTemplate.js
│   │       ├── databaseTemplate.js
│   │       ├── routesTemplate.js
│   │       ├── controllerTemplate.js
│   │       ├── serviceTemplate.js
│   │       ├── modelTemplate.js
│   │       └── index.js
│   ├── utils/                # Utility functions
│   │   ├── errorUtils.js
│   │   └── index.js
│   └── validators/           # Validation functions
│       ├── pathValidators.js
│       ├── nameValidators.js
│       └── index.js
├── bin/                      # CLI executables (future)
├── shared-templates-new.js   # Backward compatibility layer
├── typescript-templates-new.js # TS backward compatibility layer
└── [other generator files]   # Main generator files (to be moved)
```

## Module Organization

### `src/validators/`
Contains all validation logic:
- **pathValidators.js**: Path security validation
- **nameValidators.js**: Project and resource name validation

### `src/utils/`
Contains utility functions:
- **errorUtils.js**: Error handling and sanitization

### `src/templates/javascript/`
Contains JavaScript code templates:
- **controllerTemplate.js**: HTTP layer templates
- **serviceTemplate.js**: Business logic layer templates
- **modelTemplate.js**: Database access layer templates

### `src/templates/typescript/`
Contains TypeScript code templates:
- **configTemplate.js**: tsconfig.json generation
- **typesTemplate.js**: TypeScript type definitions
- **serverTemplate.js**: Express server with TS types
- **databaseTemplate.js**: DB configuration (MongoDB/MySQL)
- **routesTemplate.js**: Express routes with types
- **controllerTemplate.js**: HTTP layer with Request/Response types
- **serviceTemplate.js**: Business logic layer with types
- **modelTemplate.js**: Database access layer with types
wo compatibility layers maintain backward compatibility:
- **shared-templates-new.js**: Re-exports from src/validators, src/utils, src/templates/javascript
- **typescript-templates-new.js**: Re-exports from src/templates/typescript

These allow gradual migration of existing generator files.

## Next Steps

1. Move main generator files to `src/generators/`
2. Update all imports in generator files to use new structure
3. Create CLI wrapper files in `bin/`
4. Test all functionality with new structure
5. Remove old template files once migration complete
## Backward Compatibility

The `shared-templates.js` file re-exports from the new structure to maintain backward compatibility with existing code.

## Next Steps

1. Move TypeScript templates to `src/templates/typescript/`
2. Move main generator files to `src/generators/`
3. Create CLI wrapper files in `bin/`
4. Add comprehensive tests
5. Update imports in all generator files
