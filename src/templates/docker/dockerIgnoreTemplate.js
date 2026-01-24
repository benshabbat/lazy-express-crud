// .dockerignore template

/**
 * Generate .dockerignore template
 * @returns {string} .dockerignore content
 */
export function getDockerIgnoreTemplate() {
    return `node_modules
npm-debug.log
.env
.env.local
.git
.gitignore
.vscode
.idea
*.log
*.md
!README.md
.DS_Store
coverage
.nyc_output
dist
build
`;
}
