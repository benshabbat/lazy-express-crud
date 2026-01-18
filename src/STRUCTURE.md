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
│   │   ├── typescript/       # TypeScript templates (future)
│   │   └── shared/           # Shared templates (future)
│   ├── utils/                # Utility functions
│   │   ├── errorUtils.js
│   │   └── index.js
│   └── validators/           # Validation functions
│       ├── pathValidators.js
│       ├── nameValidators.js
│       └── index.js
├── bin/                      # CLI executables (future)
├── shared-templates.js       # Backward compatibility layer
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

## Benefits of New Structure

1. **Better Organization**: Clear separation of concerns
2. **Easier Maintenance**: Each file has a single responsibility
3. **Improved Testability**: Isolated functions are easier to test
4. **Scalability**: Easy to add new templates and utilities
5. **Cleaner Imports**: Centralized exports via index files

## Backward Compatibility

The `shared-templates.js` file re-exports from the new structure to maintain backward compatibility with existing code.

## Next Steps

1. Move TypeScript templates to `src/templates/typescript/`
2. Move main generator files to `src/generators/`
3. Create CLI wrapper files in `bin/`
4. Add comprehensive tests
5. Update imports in all generator files
