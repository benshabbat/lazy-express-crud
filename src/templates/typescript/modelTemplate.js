// TypeScript model template - Database access layer

import { generateModel } from '../shared/modelHelpers.js';

export function getModelTemplateTS(resourceName, dbChoice) {
    return generateModel(resourceName, dbChoice, true);
}
