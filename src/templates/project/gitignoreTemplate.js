// .gitignore template

/**
 * Generate .gitignore content
 * @returns {string} .gitignore content
 */
export function getGitignoreTemplate() {
    return `node_modules/
.env
.DS_Store
*.log
`;
}
