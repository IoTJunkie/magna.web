# Stage 1: Dependencies and Build
FROM node:18-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy only package files to leverage layer caching
COPY package.json yarn.lock ./

# Install ALL dependencies (including dev) for the build process
RUN yarn install --frozen-lockfile --production=false

# Copy only necessary source files for building
COPY next.config.js ./
COPY tsconfig.json ./
COPY public ./public
COPY src ./src

# Build the Next.js application with optimized production build
RUN yarn build

# Remove development node_modules and install only production dependencies
RUN rm -rf node_modules && \
    yarn install --frozen-lockfile --production=true && \
    yarn cache clean

# Stage 2: Minimal Production Image
FROM node:18-alpine AS production

# Set working directory
WORKDIR /app

# Add a non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    chown -R nextjs:nodejs /app

# Copy only the necessary files from the builder stage
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./
COPY --from=builder --chown=nextjs:nodejs /app/yarn.lock ./
COPY --from=builder --chown=nextjs:nodejs /app/next.config.js ./
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

# Remove unnecessary files from .next directory
RUN find .next/cache -type f -not -name '*.html' -delete || true

# Set environment variable
ENV NODE_ENV production

# Expose the port the app will run on
EXPOSE 3000

# Switch to non-root user
USER nextjs

# Start the Next.js application
CMD ["yarn", "start"]
