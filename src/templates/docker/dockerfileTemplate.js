// Dockerfile template for Node.js applications
// Multi-stage build for smaller image size

/**
 * Generate Dockerfile template
 * @param {boolean} isTypeScript - Whether the project is TypeScript (needs a compile step
 *   because `npm start` runs the compiled output under dist/, not the source in src/)
 * @returns {string} Dockerfile template content
 */
export function getDockerfileTemplate(isTypeScript = false) {
    if (isTypeScript) {
        return `# Multi-stage build for smaller image
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies like typescript, needed to build)
RUN npm ci

# Copy source code
COPY . .

# Compile TypeScript to dist/
RUN npm run build

# Production stage
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \\
    adduser -S nodejs -u 1001

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy compiled output from builder
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \\
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the compiled application
CMD ["npm", "start"]
`;
    }

    return `# Multi-stage build for smaller image
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Production stage
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \\
    adduser -S nodejs -u 1001

# Copy dependencies and source from builder
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --chown=nodejs:nodejs . .

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \\
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["npm", "start"]
`;
}
