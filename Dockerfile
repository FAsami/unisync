# Multi-stage Dockerfile for Fly.io deployment
# Builds server + includes documentation

FROM node:alpine AS base

# ===== Build Documentation =====
FROM base AS docs-builder
WORKDIR /docs
COPY docs/package*.json docs/yarn.lock ./
RUN yarn install --frozen-lockfile
COPY docs/ ./
RUN yarn build

# ===== Install Server Dependencies =====
FROM base AS server-deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY server/package*.json server/yarn.lock ./
RUN yarn install --frozen-lockfile --production=false

# ===== Build Server =====
FROM base AS server-builder
WORKDIR /app
COPY --from=server-deps /app/node_modules ./node_modules
COPY server/ ./
RUN yarn build

# ===== Production Server Dependencies =====
FROM base AS prod-deps
WORKDIR /app
COPY server/package*.json server/yarn.lock ./
RUN yarn install --frozen-lockfile --production=true && yarn cache clean

# ===== Production Image =====
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=9201

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nodejs

# Copy server files
COPY --from=server-builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=prod-deps --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=server-builder --chown=nodejs:nodejs /app/package.json ./package.json

# Copy documentation
COPY --from=docs-builder --chown=nodejs:nodejs /docs/.vitepress/dist ./docs/.vitepress/dist

# Create logs directory and set permissions
RUN mkdir -p /app/logs && chown -R nodejs:nodejs /app/logs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:9201/api/v1/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

USER nodejs

EXPOSE 9201

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]

