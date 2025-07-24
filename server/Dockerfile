# Use latest Node.js Alpine for smaller image size
FROM node:alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat dumb-init
WORKDIR /app

# Copy package files
COPY package*.json yarn.lock ./
RUN yarn install --frozen-lockfile --production=false

# Build the source code
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build TypeScript
RUN yarn build

# Production install (separate step after build)
FROM base AS prod-deps
WORKDIR /app
COPY package*.json yarn.lock ./
RUN yarn install --frozen-lockfile --production=true && yarn cache clean

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=9201

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

# Copy built application and production dependencies
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=prod-deps --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./package.json

# Create logs directory and set permissions
RUN mkdir -p /app/logs && chown -R nodejs:nodejs /app/logs

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:9201/api/v1/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

USER nodejs

EXPOSE 9201

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"] 